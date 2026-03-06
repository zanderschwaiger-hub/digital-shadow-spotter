
-- Agent actions table: every action the agent proposes or the user takes
-- This is the core of the agent model
CREATE TABLE public.agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,        -- 'task_status_change', 'generate_plan', 'pillar_start', 'task_complete', 'task_skip'
  target_type text,                 -- 'task', 'pillar', 'plan'
  target_id text,                   -- ID of the target (task id, pillar id, etc.)
  proposed_payload jsonb NOT NULL DEFAULT '{}'::jsonb,  -- what the agent proposed
  status text NOT NULL DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'auto_approved'
  reason text,                      -- why approved/rejected/blocked
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can only see/create their own actions
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent actions"
  ON public.agent_actions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent actions"
  ON public.agent_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent actions"
  ON public.agent_actions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
