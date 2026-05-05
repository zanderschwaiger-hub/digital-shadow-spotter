import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { usePillarProgress } from '@/hooks/usePillarProgress';
import { TOTAL_PILLARS } from '@/lib/pillars';

interface TierProgressionCardProps {
  tierLevel: number;
}

export function TierProgressionCard({ tierLevel }: TierProgressionCardProps) {
  const { currentPillar, loading } = usePillarProgress();

  if (tierLevel >= 3) {
    return (
      <Card className="p-4 sm:p-6 space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Tier 3 — Digital Guardian</p>
        <h2 className="text-lg font-semibold">Full access unlocked</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/governance-console">Governance Console</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/decisions">Decisions</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/agent-log">Agent Log</Link>
          </Button>
        </div>
      </Card>
    );
  }

  if (tierLevel === 2) {
    return (
      <Card className="p-4 sm:p-6 space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Tier 2</p>
        <h2 className="text-lg font-semibold">Cleanup in progress</h2>
        <Button asChild size="sm">
          <Link to="/inventory">
            Continue Cleanup <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </Card>
    );
  }

  // Tier 0 or Tier 1 → drive through pillars
  const safePillar = Math.min(currentPillar, TOTAL_PILLARS);
  const pillarHref = `/assessment/pillar/${safePillar}`;

  if (tierLevel === 0) {
    return (
      <Card className="p-4 sm:p-6 space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Tier 0</p>
        <h2 className="text-lg font-semibold">Baseline required</h2>
        <p className="text-sm text-muted-foreground">
          Complete all {TOTAL_PILLARS} pillars to unlock Tier 1.
        </p>
        <Button asChild size="sm" disabled={loading}>
          <Link to={pillarHref}>
            Start Pillar {safePillar} <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </Card>
    );
  }

  // tier_level === 1
  return (
    <Card className="p-4 sm:p-6 space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Tier 1</p>
      <h2 className="text-lg font-semibold">
        Continue Pillar {safePillar} of {TOTAL_PILLARS}
      </h2>
      <Button asChild size="sm" disabled={loading}>
        <Link to={pillarHref}>
          Resume <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </Card>
  );
}
