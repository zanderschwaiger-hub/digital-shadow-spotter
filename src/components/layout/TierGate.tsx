import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type GateMode = 'baseline' | 'subscription';

interface TierGateProps {
  /** Application progression gate. Use 'baseline' for post-baseline routes,
   *  'subscription' for routes that additionally require an active subscription. */
  mode?: GateMode;
  children: ReactNode;
}

export function TierGate({ mode = 'baseline', children }: TierGateProps) {
  const { profile, loading } = useAuth();
  const { active, loading: subLoading } = useSubscription();

  if (loading || (mode === 'subscription' && subLoading)) return null;
  if (!profile) return <Navigate to="/login" replace />;

  const baselineOk = !!profile.baseline_completed;

  if (!baselineOk) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full p-8 space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Baseline required</p>
          <h1 className="text-2xl font-bold">Complete your Baseline</h1>
          <p className="text-sm text-muted-foreground">
            Finish all 12 pillars to unlock this area.
          </p>
          <Button asChild className="w-full">
            <Link to="/assessment">Go to Baseline</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (mode === 'subscription' && !active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full p-8 space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Subscription required</p>
          <h1 className="text-2xl font-bold">Active subscription needed</h1>
          <p className="text-sm text-muted-foreground">
            This area requires an active subscription.
          </p>
          <Button asChild className="w-full">
            <Link to="/settings">Manage subscription</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
