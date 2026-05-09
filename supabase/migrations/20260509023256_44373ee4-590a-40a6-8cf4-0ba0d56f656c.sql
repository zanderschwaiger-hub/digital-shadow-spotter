ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS authorization_confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS authorization_version TEXT;

CREATE TABLE IF NOT EXISTS public.authorization_audit_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  confirmed_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  authorization_version TEXT,
  user_agent            TEXT,
  ip_address            TEXT
);

ALTER TABLE public.authorization_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own auth audit log"
  ON public.authorization_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own auth audit log"
  ON public.authorization_audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id
  ON public.authorization_audit_logs (user_id);