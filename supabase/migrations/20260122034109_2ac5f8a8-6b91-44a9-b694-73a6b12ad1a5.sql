-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'tier3',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  consent_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_emails table
CREATE TABLE public.inventory_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_usernames table
CREATE TABLE public.inventory_usernames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  platform TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_accounts table for key accounts
CREATE TABLE public.inventory_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_domains table
CREATE TABLE public.inventory_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_phones table
CREATE TABLE public.inventory_phones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signals_settings table
CREATE TABLE public.signals_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signal_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'daily',
  last_check_at TIMESTAMP WITH TIME ZONE,
  next_check_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, signal_type)
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  title TEXT NOT NULL,
  details TEXT,
  source_type TEXT NOT NULL DEFAULT 'system',
  read_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps_json JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 1,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create broker_sites table
CREATE TABLE public.broker_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_name TEXT NOT NULL,
  url TEXT,
  date_submitted DATE,
  status TEXT NOT NULL DEFAULT 'not_started',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_log table (immutable)
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  sms_high_only BOOLEAN NOT NULL DEFAULT true,
  digest_frequency TEXT NOT NULL DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_usernames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for inventory_emails
CREATE POLICY "Users can view their own emails" ON public.inventory_emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own emails" ON public.inventory_emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own emails" ON public.inventory_emails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own emails" ON public.inventory_emails FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inventory_usernames
CREATE POLICY "Users can view their own usernames" ON public.inventory_usernames FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usernames" ON public.inventory_usernames FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own usernames" ON public.inventory_usernames FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own usernames" ON public.inventory_usernames FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inventory_accounts
CREATE POLICY "Users can view their own accounts" ON public.inventory_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON public.inventory_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.inventory_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.inventory_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inventory_domains
CREATE POLICY "Users can view their own domains" ON public.inventory_domains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own domains" ON public.inventory_domains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own domains" ON public.inventory_domains FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own domains" ON public.inventory_domains FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inventory_phones
CREATE POLICY "Users can view their own phones" ON public.inventory_phones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own phones" ON public.inventory_phones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own phones" ON public.inventory_phones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own phones" ON public.inventory_phones FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for signals_settings
CREATE POLICY "Users can view their own signals settings" ON public.signals_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own signals settings" ON public.signals_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own signals settings" ON public.signals_settings FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Users can view their own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for broker_sites
CREATE POLICY "Users can view their own broker sites" ON public.broker_sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own broker sites" ON public.broker_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own broker sites" ON public.broker_sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own broker sites" ON public.broker_sites FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audit_log (read-only for users, insert via app)
CREATE POLICY "Users can view their own audit log" ON public.audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audit log" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_settings
CREATE POLICY "Users can view their own notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification settings" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles timestamp
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, tier)
  VALUES (NEW.id, 'tier3');
  
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.audit_log (user_id, event_type, payload_json)
  VALUES (NEW.id, 'account_created', '{"source": "signup"}'::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();