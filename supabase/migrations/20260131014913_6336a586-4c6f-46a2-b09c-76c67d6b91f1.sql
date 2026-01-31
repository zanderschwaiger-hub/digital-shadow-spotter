-- Fix security definer view issue by recreating as security invoker
DROP VIEW IF EXISTS public.user_entitlements;

CREATE VIEW public.user_entitlements 
WITH (security_invoker = true) AS
SELECT
  user_id,
  tier_level,
  (tier_level >= 1) AS baseline_access,
  (tier_level >= 2) AS guided_cleanup_access,
  (tier_level >= 3) AS governance_agent_access
FROM public.profiles;