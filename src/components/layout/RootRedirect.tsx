import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

function Spinner() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function RootRedirect() {
  const { user, loading } = useAuth();
  const [hasCheck, setHasCheck] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setHasCheck(null);
      return;
    }

    let mounted = true;

    supabase
      .from('exposure_checks')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted) setHasCheck(!!data);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/exposure-check" replace />;
  }

  // Routing for returning users is based on a saved exposure result only.
  if (hasCheck === null) return <Spinner />;

  return <Navigate to={hasCheck ? '/dashboard' : '/exposure-check'} replace />;
}
