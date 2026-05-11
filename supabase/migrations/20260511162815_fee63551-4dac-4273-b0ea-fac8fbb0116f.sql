
-- Convert helper RLS functions to SECURITY INVOKER (they only read the calling user's own rows under RLS)
CREATE OR REPLACE FUNCTION public.profile_tier_unchanged(_user_id uuid, _tier text, _tier_level integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND tier = _tier
      AND tier_level = _tier_level
  );
$function$;

CREATE OR REPLACE FUNCTION public.agent_action_immutable_check(_id uuid, _action_type text, _target_type text, _target_id text, _proposed_payload jsonb)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.agent_actions
    WHERE id = _id
      AND action_type = _action_type
      AND target_type IS NOT DISTINCT FROM _target_type
      AND target_id IS NOT DISTINCT FROM _target_id
      AND proposed_payload = _proposed_payload
  );
$function$;

-- Lock down execute on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_baseline() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.complete_tier2() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_course_tasks() FROM PUBLIC, anon;

-- Grant only what the app actually calls via RPC
GRANT EXECUTE ON FUNCTION public.complete_baseline() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_course_tasks() TO authenticated;
