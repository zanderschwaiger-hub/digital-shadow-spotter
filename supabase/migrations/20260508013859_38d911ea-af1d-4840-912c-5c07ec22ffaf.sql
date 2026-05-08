-- 1. Add authorization_confirmed column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS authorization_confirmed boolean NOT NULL DEFAULT false;

-- 2. Replace pillar_progress INSERT policy with sequence + duplicate enforcement
DROP POLICY IF EXISTS "Users insert own pillar progress" ON public.pillar_progress;

CREATE POLICY "Users insert own pillar progress in sequence"
ON public.pillar_progress
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND pillar_index BETWEEN 1 AND 12
  -- no duplicate for this user+pillar
  AND NOT EXISTS (
    SELECT 1 FROM public.pillar_progress pp
    WHERE pp.user_id = auth.uid()
      AND pp.pillar_index = pillar_progress.pillar_index
  )
  -- previous pillar must be completed (except for pillar 1)
  AND (
    pillar_index = 1
    OR EXISTS (
      SELECT 1 FROM public.pillar_progress pp
      WHERE pp.user_id = auth.uid()
        AND pp.pillar_index = pillar_progress.pillar_index - 1
        AND pp.completed = true
    )
  )
);

-- 3. Replace complete_baseline() with strict sequential validation
CREATE OR REPLACE FUNCTION public.complete_baseline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _i integer;
  _row_count integer;
  _distinct_count integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Duplicate detection: total rows vs distinct pillar_index (1..12)
  SELECT COUNT(*), COUNT(DISTINCT pillar_index)
    INTO _row_count, _distinct_count
  FROM public.pillar_progress
  WHERE user_id = _uid
    AND completed = true
    AND pillar_index BETWEEN 1 AND 12;

  IF _row_count <> _distinct_count THEN
    RAISE EXCEPTION 'Duplicate pillar completion detected';
  END IF;

  -- Sequential validation: each of 1..12 must exist completed
  FOR _i IN 1..12 LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.pillar_progress
      WHERE user_id = _uid
        AND pillar_index = _i
        AND completed = true
    ) THEN
      RAISE EXCEPTION 'Pillars must be completed in sequential order';
    END IF;
  END LOOP;

  UPDATE public.profiles
  SET baseline_completed = true,
      tier = 'tier1',
      tier_level = GREATEST(tier_level, 1),
      updated_at = now()
  WHERE user_id = _uid;

  INSERT INTO public.audit_log (user_id, event_type, payload_json)
  VALUES (_uid, 'baseline_completed', '{}'::jsonb);
END;
$function$;