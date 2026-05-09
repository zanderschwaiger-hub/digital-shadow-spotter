import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CURRENT_AUTHORIZATION_VERSION } from '@/components/dashboard/AuthorizationConfirmModal';

export function RequiresAuthorization({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isAuthorized =
    profile?.authorization_confirmed === true &&
    (profile as any)?.authorization_version === CURRENT_AUTHORIZATION_VERSION;

  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
