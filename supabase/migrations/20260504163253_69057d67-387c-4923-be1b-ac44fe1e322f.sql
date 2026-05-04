
-- 1. Tier 0: anonymous exposure_checks table
CREATE TABLE IF NOT EXISTS public.exposure_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score integer NOT NULL,
  band text NOT NULL CHECK (band IN ('high','medium','low')),
  answers_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exposure_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit an exposure check" ON public.exposure_checks;
CREATE POLICY "Anyone can submit an exposure check"
ON public.exposure_checks FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- 2. Add progression flags to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS baseline_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tier2_completed boolean NOT NULL DEFAULT false;

-- 3. New users start at tier 0 (existing users unchanged)
ALTER TABLE public.profiles
  ALTER COLUMN tier SET DEFAULT 'tier0',
  ALTER COLUMN tier_level SET DEFAULT 0;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND tier = 'tier0'
  AND tier_level = 0
  AND baseline_completed = false
  AND tier2_completed = false
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, tier, tier_level)
  VALUES (NEW.id, 'tier0', 0);

  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.audit_log (user_id, event_type, payload_json)
  VALUES (NEW.id, 'account_created', '{"source": "signup"}'::jsonb);

  RETURN NEW;
END;
$$;

-- 4. Server-side tier promotion functions
CREATE OR REPLACE FUNCTION public.complete_baseline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.profiles
  SET baseline_completed = true,
      tier = CASE WHEN tier_level < 1 THEN 'tier1' ELSE tier END,
      tier_level = GREATEST(tier_level, 1),
      updated_at = now()
  WHERE user_id = _uid;
  INSERT INTO public.audit_log (user_id, event_type, payload_json)
  VALUES (_uid, 'baseline_completed', '{}'::jsonb);
END;
$$;

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
      tier = CASE WHEN tier_level < 3 THEN 'tier3' ELSE tier END,
      tier_level = GREATEST(tier_level, 3),
      updated_at = now()
  WHERE user_id = _uid;
  INSERT INTO public.audit_log (user_id, event_type, payload_json)
  VALUES (_uid, 'tier2_completed', '{}'::jsonb);
END;
$$;

-- 5. Tier-2 gating on inventory tables
-- inventory_accounts
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.inventory_accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.inventory_accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.inventory_accounts;
CREATE POLICY "Users can insert their own accounts" ON public.inventory_accounts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can update their own accounts" ON public.inventory_accounts FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can delete their own accounts" ON public.inventory_accounts FOR DELETE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));

-- inventory_domains
DROP POLICY IF EXISTS "Users can insert their own domains" ON public.inventory_domains;
DROP POLICY IF EXISTS "Users can update their own domains" ON public.inventory_domains;
DROP POLICY IF EXISTS "Users can delete their own domains" ON public.inventory_domains;
CREATE POLICY "Users can insert their own domains" ON public.inventory_domains FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can update their own domains" ON public.inventory_domains FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can delete their own domains" ON public.inventory_domains FOR DELETE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));

-- inventory_emails
DROP POLICY IF EXISTS "Users can insert their own emails" ON public.inventory_emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON public.inventory_emails;
DROP POLICY IF EXISTS "Users can delete their own emails" ON public.inventory_emails;
CREATE POLICY "Users can insert their own emails" ON public.inventory_emails FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can update their own emails" ON public.inventory_emails FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can delete their own emails" ON public.inventory_emails FOR DELETE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));

-- inventory_phones
DROP POLICY IF EXISTS "Users can insert their own phones" ON public.inventory_phones;
DROP POLICY IF EXISTS "Users can update their own phones" ON public.inventory_phones;
DROP POLICY IF EXISTS "Users can delete their own phones" ON public.inventory_phones;
CREATE POLICY "Users can insert their own phones" ON public.inventory_phones FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can update their own phones" ON public.inventory_phones FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can delete their own phones" ON public.inventory_phones FOR DELETE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));

-- inventory_usernames
DROP POLICY IF EXISTS "Users can insert their own usernames" ON public.inventory_usernames;
DROP POLICY IF EXISTS "Users can update their own usernames" ON public.inventory_usernames;
DROP POLICY IF EXISTS "Users can delete their own usernames" ON public.inventory_usernames;
CREATE POLICY "Users can insert their own usernames" ON public.inventory_usernames FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can update their own usernames" ON public.inventory_usernames FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));
CREATE POLICY "Users can delete their own usernames" ON public.inventory_usernames FOR DELETE TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 2));

-- 6. Tier-3 gating on agent_actions
DROP POLICY IF EXISTS "Users can insert their own agent actions" ON public.agent_actions;
DROP POLICY IF EXISTS "Users can update their own agent actions" ON public.agent_actions;

CREATE POLICY "Users can insert their own agent actions"
ON public.agent_actions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 3)
);

CREATE POLICY "Users can update their own agent actions"
ON public.agent_actions FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.tier_level >= 3)
)
WITH CHECK (
  auth.uid() = user_id
  AND public.agent_action_immutable_check(id, action_type, target_type, target_id, proposed_payload)
);
