-- Add tier_level to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tier_level INTEGER NOT NULL DEFAULT 3;

-- Create governance_pillars table
CREATE TABLE IF NOT EXISTS public.governance_pillars (
  id TEXT PRIMARY KEY,
  pillar_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  minimum_tier INTEGER NOT NULL DEFAULT 1,
  questions_json JSONB NOT NULL DEFAULT '[]',
  steps_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on governance_pillars
ALTER TABLE public.governance_pillars ENABLE ROW LEVEL SECURITY;

-- Create user_pillar_progress table
CREATE TABLE IF NOT EXISTS public.user_pillar_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id TEXT NOT NULL REFERENCES public.governance_pillars(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  answers_json JSONB DEFAULT '{}',
  decision_log JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, pillar_id)
);

-- Enable RLS on user_pillar_progress
ALTER TABLE public.user_pillar_progress ENABLE ROW LEVEL SECURITY;

-- Create baseline_artifacts table
CREATE TABLE IF NOT EXISTS public.baseline_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  exported_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on baseline_artifacts
ALTER TABLE public.baseline_artifacts ENABLE ROW LEVEL SECURITY;

-- Create user_entitlements view (entitlement-driven, not tier-driven UI)
CREATE OR REPLACE VIEW public.user_entitlements AS
SELECT
  user_id,
  tier_level,
  (tier_level >= 1) AS baseline_access,
  (tier_level >= 2) AS guided_cleanup_access,
  (tier_level >= 3) AS governance_agent_access
FROM public.profiles;

-- RLS Policies for governance_pillars
DROP POLICY IF EXISTS "Pillars are readable by authenticated users" ON public.governance_pillars;
DROP POLICY IF EXISTS "Pillars readable if entitled" ON public.governance_pillars;

CREATE POLICY "Pillars readable if entitled"
ON public.governance_pillars FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.tier_level >= governance_pillars.minimum_tier
  )
);

-- RLS Policies for user_pillar_progress
DROP POLICY IF EXISTS "Users can view their own pillar progress" ON public.user_pillar_progress;
DROP POLICY IF EXISTS "Users can insert their own pillar progress" ON public.user_pillar_progress;
DROP POLICY IF EXISTS "Users can update their own pillar progress" ON public.user_pillar_progress;
DROP POLICY IF EXISTS "Users can insert progress if entitled for pillar" ON public.user_pillar_progress;
DROP POLICY IF EXISTS "Users can update progress if entitled for pillar" ON public.user_pillar_progress;

CREATE POLICY "Users can view their own pillar progress"
ON public.user_pillar_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert progress if entitled for pillar"
ON public.user_pillar_progress FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.governance_pillars gp
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE gp.id = pillar_id
      AND p.tier_level >= gp.minimum_tier
  )
);

CREATE POLICY "Users can update progress if entitled for pillar"
ON public.user_pillar_progress FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.governance_pillars gp
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE gp.id = pillar_id
      AND p.tier_level >= gp.minimum_tier
  )
);

-- RLS Policies for baseline_artifacts
DROP POLICY IF EXISTS "Users can view their own baseline artifacts" ON public.baseline_artifacts;
DROP POLICY IF EXISTS "Users can insert their own baseline artifacts" ON public.baseline_artifacts;
DROP POLICY IF EXISTS "Users can update their own baseline artifacts" ON public.baseline_artifacts;
DROP POLICY IF EXISTS "Users can insert baseline artifacts if tier>=1" ON public.baseline_artifacts;

CREATE POLICY "Users can view their own baseline artifacts"
ON public.baseline_artifacts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert baseline artifacts if entitled"
ON public.baseline_artifacts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.tier_level >= 1
  )
);

CREATE POLICY "Users can update their own baseline artifacts"
ON public.baseline_artifacts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at on new tables
CREATE TRIGGER update_governance_pillars_updated_at
  BEFORE UPDATE ON public.governance_pillars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_pillar_progress_updated_at
  BEFORE UPDATE ON public.user_pillar_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_baseline_artifacts_updated_at
  BEFORE UPDATE ON public.baseline_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();