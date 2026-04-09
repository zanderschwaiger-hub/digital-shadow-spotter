
-- ============================================================
-- Tighten RLS policies: change role from public to authenticated
-- ============================================================

-- AUDIT_LOG
DROP POLICY IF EXISTS "Users can insert their own audit log" ON public.audit_log;
CREATE POLICY "Users can insert their own audit log"
ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own audit log" ON public.audit_log;
CREATE POLICY "Users can view their own audit log"
ON public.audit_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ALERTS
DROP POLICY IF EXISTS "Users can insert their own alerts" ON public.alerts;
CREATE POLICY "Users can insert their own alerts"
ON public.alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own alerts" ON public.alerts;
CREATE POLICY "Users can update their own alerts"
ON public.alerts FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own alerts" ON public.alerts;
CREATE POLICY "Users can view their own alerts"
ON public.alerts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- NOTIFICATION_SETTINGS
DROP POLICY IF EXISTS "Users can insert their own notification settings" ON public.notification_settings;
CREATE POLICY "Users can insert their own notification settings"
ON public.notification_settings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notification settings" ON public.notification_settings;
CREATE POLICY "Users can update their own notification settings"
ON public.notification_settings FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notification settings" ON public.notification_settings;
CREATE POLICY "Users can view their own notification settings"
ON public.notification_settings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- SIGNALS_SETTINGS
DROP POLICY IF EXISTS "Users can insert their own signals settings" ON public.signals_settings;
CREATE POLICY "Users can insert their own signals settings"
ON public.signals_settings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own signals settings" ON public.signals_settings;
CREATE POLICY "Users can update their own signals settings"
ON public.signals_settings FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own signals settings" ON public.signals_settings;
CREATE POLICY "Users can view their own signals settings"
ON public.signals_settings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- TASKS
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
CREATE POLICY "Users can insert their own tasks"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- INVENTORY_ACCOUNTS
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.inventory_accounts;
CREATE POLICY "Users can insert their own accounts"
ON public.inventory_accounts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own accounts" ON public.inventory_accounts;
CREATE POLICY "Users can update their own accounts"
ON public.inventory_accounts FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own accounts" ON public.inventory_accounts;
CREATE POLICY "Users can view their own accounts"
ON public.inventory_accounts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.inventory_accounts;
CREATE POLICY "Users can delete their own accounts"
ON public.inventory_accounts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- INVENTORY_DOMAINS
DROP POLICY IF EXISTS "Users can insert their own domains" ON public.inventory_domains;
CREATE POLICY "Users can insert their own domains"
ON public.inventory_domains FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own domains" ON public.inventory_domains;
CREATE POLICY "Users can update their own domains"
ON public.inventory_domains FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own domains" ON public.inventory_domains;
CREATE POLICY "Users can view their own domains"
ON public.inventory_domains FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own domains" ON public.inventory_domains;
CREATE POLICY "Users can delete their own domains"
ON public.inventory_domains FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- INVENTORY_EMAILS
DROP POLICY IF EXISTS "Users can insert their own emails" ON public.inventory_emails;
CREATE POLICY "Users can insert their own emails"
ON public.inventory_emails FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own emails" ON public.inventory_emails;
CREATE POLICY "Users can update their own emails"
ON public.inventory_emails FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own emails" ON public.inventory_emails;
CREATE POLICY "Users can view their own emails"
ON public.inventory_emails FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own emails" ON public.inventory_emails;
CREATE POLICY "Users can delete their own emails"
ON public.inventory_emails FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- INVENTORY_PHONES
DROP POLICY IF EXISTS "Users can insert their own phones" ON public.inventory_phones;
CREATE POLICY "Users can insert their own phones"
ON public.inventory_phones FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own phones" ON public.inventory_phones;
CREATE POLICY "Users can update their own phones"
ON public.inventory_phones FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own phones" ON public.inventory_phones;
CREATE POLICY "Users can view their own phones"
ON public.inventory_phones FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own phones" ON public.inventory_phones;
CREATE POLICY "Users can delete their own phones"
ON public.inventory_phones FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- INVENTORY_USERNAMES
DROP POLICY IF EXISTS "Users can insert their own usernames" ON public.inventory_usernames;
CREATE POLICY "Users can insert their own usernames"
ON public.inventory_usernames FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usernames" ON public.inventory_usernames;
CREATE POLICY "Users can update their own usernames"
ON public.inventory_usernames FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own usernames" ON public.inventory_usernames;
CREATE POLICY "Users can view their own usernames"
ON public.inventory_usernames FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own usernames" ON public.inventory_usernames;
CREATE POLICY "Users can delete their own usernames"
ON public.inventory_usernames FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- BROKER_SITES
DROP POLICY IF EXISTS "Users can insert their own broker sites" ON public.broker_sites;
CREATE POLICY "Users can insert their own broker sites"
ON public.broker_sites FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own broker sites" ON public.broker_sites;
CREATE POLICY "Users can update their own broker sites"
ON public.broker_sites FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own broker sites" ON public.broker_sites;
CREATE POLICY "Users can view their own broker sites"
ON public.broker_sites FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own broker sites" ON public.broker_sites;
CREATE POLICY "Users can delete their own broker sites"
ON public.broker_sites FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- PROFILES (already uses public role for INSERT/UPDATE/SELECT — tighten)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND tier = 'tier3' AND tier_level = 3);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND public.profile_tier_unchanged(auth.uid(), tier, tier_level));

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);
