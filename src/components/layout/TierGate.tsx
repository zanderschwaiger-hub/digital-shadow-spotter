import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TierGateProps {
  required: 1 | 2 | 3;
  children: ReactNode;
}

const COPY: Record<1 | 2 | 3, { title: string; body: string; cta: string; href: string }> = {
  1: {
    title: 'Baseline required',
    body: 'Complete the Tier 1 Baseline before continuing.',
    cta: 'Go to Baseline',
    href: '/assessment',
  },
  2: {
    title: 'Cleanup is locked',
    body: 'Tier 2 — Cleanup unlocks once your Baseline is complete.',
    cta: 'Go to Baseline',
    href: '/assessment',
  },
  3: {
    title: 'Digital Guardian is locked',
    body: 'Tier 3 unlocks once your Cleanup (Tier 2) is complete.',
    cta: 'Go to Cleanup',
    href: '/inventory',
  },
};

export function TierGate({ required, children }: TierGateProps) {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;

  if (profile.tier_level >= required) {
    return <>{children}</>;
  }

  const copy = COPY[required];
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full p-8 space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Tier {required} required
        </p>
        <h1 className="text-2xl font-bold">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.body}</p>
        <Button asChild className="w-full">
          <Link to={copy.href}>{copy.cta}</Link>
        </Button>
      </Card>
    </div>
  );
}
