import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface TierProgressionCardProps {
  tierLevel: number;
}

export function TierProgressionCard({ tierLevel }: TierProgressionCardProps) {
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

  let tierLabel = '';
  let title = '';
  let cta = '';
  let href = '';

  if (tierLevel === 0) {
    tierLabel = 'Tier 0';
    title = 'Baseline required';
    cta = 'Start Baseline';
    href = '/assessment';
  } else if (tierLevel === 1) {
    tierLabel = 'Tier 1';
    title = 'Baseline complete';
    cta = 'Start Cleanup';
    href = '/inventory';
  } else {
    tierLabel = 'Tier 2';
    title = 'Cleanup in progress';
    cta = 'Continue Cleanup';
    href = '/inventory';
  }

  return (
    <Card className="p-4 sm:p-6 space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{tierLabel}</p>
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button asChild size="sm">
        <Link to={href}>
          {cta} <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </Card>
  );
}
