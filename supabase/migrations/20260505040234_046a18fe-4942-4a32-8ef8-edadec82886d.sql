
-- pillar_progress
CREATE TABLE public.pillar_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pillar_index integer NOT NULL CHECK (pillar_index BETWEEN 1 AND 12),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pillar_index)
);

ALTER TABLE public.pillar_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pillar progress"
  ON public.pillar_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own pillar progress"
  ON public.pillar_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pillar progress"
  ON public.pillar_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'canceled' CHECK (status IN ('active','past_due','canceled')),
  current_period_end timestamptz,
  last_payment_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own subscription"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subscription"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Updated complete_baseline: require all 12 pillars complete
CREATE OR REPLACE FUNCTION public.complete_baseline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _completed_count integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT COUNT(*) INTO _completed_count
  FROM public.pillar_progress
  WHERE user_id = _uid AND completed = true AND pillar_index BETWEEN 1 AND 12;

  IF _completed_count < 12 THEN
    RAISE EXCEPTION 'All 12 pillars must be completed before baseline (% completed)', _completed_count;
  END IF;

  UPDATE public.profiles
  SET baseline_completed = true,
      tier = 'tier1',
      tier_level = GREATEST(tier_level, 1),
      updated_at = now()
  WHERE user_id = _uid;

  INSERT INTO public.audit_log (user_id, event_type, payload_json)
  VALUES (_uid, 'baseline_completed', '{}'::jsonb);
END;
$$;

-- Updated complete_tier2: promote to tier 3
CREATE OR REPLACE FUNCTION public.complete_tier2()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _baseline boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT baseline_completed INTO _baseline FROM public.profiles WHERE user_id = _uid;
  IF NOT COALESCE(_baseline, false) THEN
    RAISE EXCEPTION 'Baseline must be completed first';
  END IF;

  UPDATE public.profiles
  SET tier2_completed = true,
      tier = 'tier3',
      tier_level = GREATEST(tier_level, 3),
      updated_at = now()
  WHERE user_id = _uid;

  INSERT INTO public.audit_log (user_id, event_type, payload_json)
  VALUES (_uid, 'tier2_completed', '{}'::jsonb);
END;
$$;
