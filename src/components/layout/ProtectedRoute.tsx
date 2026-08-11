import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

type MfaState = 'checking' | 'needs-enrollment' | 'needs-challenge' | 'ok';

function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [mfaState, setMfaState] = useState<MfaState>('checking');

  useEffect(() => {
    let mounted = true;

    if (!user) {
      setMfaState('checking');
      return;
    }

    const check = async () => {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = (factors?.totp ?? []) as Array<{ id: string; status: string }>;
      const hasVerified = totpFactors.some((f) => f.status === 'verified');

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (!mounted) return;

      if (!hasVerified) {
        setMfaState('needs-enrollment');
      } else if (aal?.currentLevel !== 'aal2') {
        setMfaState('needs-challenge');
      } else {
        setMfaState('ok');
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return <Spinner label="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticator app is required before any app content renders.
  if (mfaState === 'checking') {
    return <Spinner />;
  }

  if (mfaState === 'needs-enrollment') {
    return <Navigate to="/mfa-setup" replace />;
  }

  if (mfaState === 'needs-challenge') {
    return <Navigate to="/mfa-challenge" replace />;
  }

  // If user is authenticated but profile is missing (trigger race on new signup),
  // route to onboarding so the profile can be created.
  const onConsentPage = location.pathname === '/onboarding-consent';
  if (!profile && !onConsentPage) {
    return <Navigate to="/onboarding-consent" replace />;
  }

  // Profile loaded — check onboarding completion
  if (profile && !profile.onboarding_completed && !onConsentPage) {
    return <Navigate to="/onboarding-consent" replace />;
  }

  return <>{children}</>;
}
