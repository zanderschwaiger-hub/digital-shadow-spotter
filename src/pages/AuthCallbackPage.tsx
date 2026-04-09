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
      // PKCE flow: Supabase magic links redirect with ?code= in the URL.
      // We must exchange the code for a session before checking getSession().
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!mounted || redirected) return;

        if (!error) {
          goToDashboard();
          return;
        }
        // If the exchange failed (e.g. expired code), fall through to retry logic.
        console.warn('Code exchange failed:', error.message);
      }

      // Fallback: check if session was already established (e.g. hash-based flow).
      const { data } = await supabase.auth.getSession();
      if (!mounted || redirected) return;

      if (data.session?.user) {
        goToDashboard();
        return;
      }

      // Give Supabase a moment to process any remaining auth return URL tokens.
      window.setTimeout(async () => {
        const { data: retryData } = await supabase.auth.getSession();
        if (!mounted || redirected) return;

        if (retryData.session?.user) {
          goToDashboard();
        } else {
          goToLogin();
        }
      }, 2000);
    };

    // Also listen for auth state changes in case the session resolves via another path.
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
