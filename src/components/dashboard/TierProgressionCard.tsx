import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePillarProgress } from '@/hooks/usePillarProgress';
import { TOTAL_PILLARS } from '@/lib/pillars';

export function TierProgressionCard() {
  const { profile } = useAuth();
  const { currentPillar, allComplete, loading } = usePillarProgress();

  const baselineCompleted = !!profile?.baseline_completed;
  const completedCount = Math.min(Math.max(currentPillar - 1, 0), TOTAL_PILLARS);

  if (baselineCompleted || allComplete) {
    return (
      <Card className="p-4 sm:p-6 space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Baseline complete</p>
        <h2 className="text-lg font-semibold">All 12 pillars completed</h2>
        <p className="text-sm text-muted-foreground">
          Continue with cleanup and ongoing governance.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/inventory">Continue cleanup</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/governance-console">Governance Console</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const safePillar = Math.min(currentPillar, TOTAL_PILLARS);
  const pillarHref = `/assessment/pillar/${safePillar}`;

  return (
    <Card className="p-4 sm:p-6 space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Pillar {completedCount} of {TOTAL_PILLARS} complete
      </p>
      <h2 className="text-lg font-semibold">
        {completedCount === 0 ? `Start Pillar ${safePillar}` : `Continue Pillar ${safePillar}`}
      </h2>
      <Button asChild size="sm" disabled={loading}>
        <Link to={pillarHref}>
          {completedCount === 0 ? 'Start' : 'Resume'} <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </Card>
  );
}
