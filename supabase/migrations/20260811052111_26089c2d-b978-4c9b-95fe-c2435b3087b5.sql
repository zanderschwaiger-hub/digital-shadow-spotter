ALTER TABLE public.exposure_checks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Users can view their own exposure checks" ON public.exposure_checks;
CREATE POLICY "Users can view their own exposure checks"
ON public.exposure_checks FOR SELECT TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT ON public.exposure_checks TO authenticated;
GRANT ALL ON public.exposure_checks TO service_role;

CREATE OR REPLACE FUNCTION public.submit_exposure_check(_score integer, _band text, _answers jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.exposure_checks (score, band, answers_json, user_id)
  VALUES (_score, _band, _answers, auth.uid())
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_exposure_check(integer, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_exposure_check(integer, text, jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_exposure_check(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.exposure_checks
  SET user_id = _uid
  WHERE id = _id AND user_id IS NULL;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_exposure_check(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_exposure_check(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can insert their own emails" ON public.inventory_emails;
CREATE POLICY "Users can insert their own emails"
ON public.inventory_emails FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own emails" ON public.inventory_emails;
CREATE POLICY "Users can update their own emails"
ON public.inventory_emails FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own emails" ON public.inventory_emails;
CREATE POLICY "Users can delete their own emails"
ON public.inventory_emails FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own phones" ON public.inventory_phones;
CREATE POLICY "Users can insert their own phones"
ON public.inventory_phones FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own phones" ON public.inventory_phones;
CREATE POLICY "Users can update their own phones"
ON public.inventory_phones FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own phones" ON public.inventory_phones;
CREATE POLICY "Users can delete their own phones"
ON public.inventory_phones FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_email_cap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.inventory_emails WHERE user_id = NEW.user_id) >= 2 THEN
    RAISE EXCEPTION 'You''ve added the maximum for your account (2 emails).';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_email_cap_trigger ON public.inventory_emails;
CREATE TRIGGER enforce_email_cap_trigger
BEFORE INSERT ON public.inventory_emails
FOR EACH ROW EXECUTE FUNCTION public.enforce_email_cap();

CREATE OR REPLACE FUNCTION public.enforce_phone_cap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.inventory_phones WHERE user_id = NEW.user_id) >= 1 THEN
    RAISE EXCEPTION 'You''ve added the maximum for your account (1 phone number).';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_phone_cap_trigger ON public.inventory_phones;
CREATE TRIGGER enforce_phone_cap_trigger
BEFORE INSERT ON public.inventory_phones
FOR EACH ROW EXECUTE FUNCTION public.enforce_phone_cap();