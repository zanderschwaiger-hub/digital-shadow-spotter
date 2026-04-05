import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session?.user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    handleAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <p className="text-sm text-muted-foreground">Completing sign-in...</p>
    </div>
  );
}
