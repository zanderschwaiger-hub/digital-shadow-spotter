
CREATE TABLE public.user_playbook_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  playbook_id text NOT NULL,
  step_id text NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, playbook_id, step_id)
);

ALTER TABLE public.user_playbook_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playbook progress"
  ON public.user_playbook_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playbook progress"
  ON public.user_playbook_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playbook progress"
  ON public.user_playbook_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
