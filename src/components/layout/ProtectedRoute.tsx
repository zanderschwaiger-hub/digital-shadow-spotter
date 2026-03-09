import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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