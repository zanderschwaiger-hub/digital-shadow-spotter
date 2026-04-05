import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let redirected = false;

    const goToDashboard = () => {
      if (!mounted || redirected) return;
      redirected = true;
      navigate('/dashboard', { replace: true });
    };

    const goToLogin = () => {
      if (!mounted || redirected) return;
      redirected = true;
      navigate('/login', { replace: true });
    };

    const resolveSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted || redirected) return;

      if (data.session?.user) {
        goToDashboard();
        return;
      }

      // Give Supabase a moment to process the auth return URL
      window.setTimeout(async () => {
        const { data: retryData } = await supabase.auth.getSession();

        if (!mounted || redirected) return;

        if (retryData.session?.user) {
          goToDashboard();
        } else {
          goToLogin();
        }
      }, 1500);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        goToDashboard();
      }
    });

    resolveSession();

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
