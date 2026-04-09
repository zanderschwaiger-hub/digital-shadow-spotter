
-- ============================================================
-- FIX 1: Prevent tier escalation on profiles table
-- ============================================================

-- Drop the existing overly-permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a helper function to check tier hasn't changed (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.profile_tier_unchanged(_user_id uuid, _tier text, _tier_level integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND tier = _tier
      AND tier_level = _tier_level
  );
$$;

-- Recreate UPDATE policy: user can update own profile but cannot change tier fields
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND public.profile_tier_unchanged(auth.uid(), tier, tier_level)
);

-- Also tighten INSERT: the handle_new_user trigger creates the profile,
-- so we restrict the INSERT policy to enforce default tier values
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
  AND tier = 'tier3'
  AND tier_level = 3
);

-- ============================================================
-- FIX 2: Lock down agent_actions UPDATE to only allow status/reason/resolved_at changes
-- ============================================================

DROP POLICY IF EXISTS "Users can update their own agent actions" ON public.agent_actions;

-- Helper to verify immutable fields haven't changed
CREATE OR REPLACE FUNCTION public.agent_action_immutable_check(_id uuid, _action_type text, _target_type text, _target_id text, _proposed_payload jsonb)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agent_actions
    WHERE id = _id
      AND action_type = _action_type
      AND target_type IS NOT DISTINCT FROM _target_type
      AND target_id IS NOT DISTINCT FROM _target_id
      AND proposed_payload = _proposed_payload
  );
$$;

CREATE POLICY "Users can update their own agent actions"
ON public.agent_actions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND public.agent_action_immutable_check(id, action_type, target_type, target_id, proposed_payload)
);
