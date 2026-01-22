import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

export function useAuditLog() {
  const { user } = useAuth();

  const logEvent = async (
    eventType: string, 
    payload: Record<string, string | number | boolean | null> = {}
  ) => {
    if (!user) return;

    await supabase.from('audit_log').insert([{
      user_id: user.id,
      event_type: eventType,
      payload_json: payload as Json
    }]);
  };

  return { logEvent };
}