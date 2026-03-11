
-- Governance coverage inputs: separated from general profile data
CREATE TABLE public.governance_coverage_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recovery_phone text,
  recovery_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.governance_coverage_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coverage inputs"
  ON public.governance_coverage_inputs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coverage inputs"
  ON public.governance_coverage_inputs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coverage inputs"
  ON public.governance_coverage_inputs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coverage inputs"
  ON public.governance_coverage_inputs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
