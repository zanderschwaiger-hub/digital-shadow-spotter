import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Subscription {
  status: 'active' | 'past_due' | 'canceled';
  current_period_end: string | null;
  last_payment_date: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('subscriptions' as any)
        .select('status, current_period_end, last_payment_date')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) {
        setSubscription((data as any) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const now = Date.now();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).getTime() : null;
  const dueSoon = !!periodEnd && periodEnd > now && periodEnd - now < 3 * 24 * 60 * 60 * 1000;
  const pastDue = subscription?.status === 'past_due';
  const active = subscription?.status === 'active';

  return { subscription, loading, dueSoon, pastDue, active };
}
