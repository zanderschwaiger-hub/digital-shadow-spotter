import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRiskContext } from '@/hooks/useRiskContext';
import { useNavigate } from 'react-router-dom';
import { PILLAR_META, type GovernanceCategory } from '@/lib/pillar-risks';
import { ChevronRight } from 'lucide-react';

const CAT_COLORS: Record<GovernanceCategory, string> = {
  Control: 'border-l-[hsl(var(--primary))]',
  Coverage: 'border-l-[hsl(var(--severity-medium))]',
  Defense: 'border-l-[hsl(var(--severity-high))]',
  Maintenance: 'border-l-[hsl(var(--severity-low))]',
};

const STATUS_STYLE: Record<string, string> = {
  'Needs Review': 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
  'Resolved': 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
  'Approved': 'bg-primary/15 text-primary',
  'Deferred': 'bg-muted text-muted-foreground',
};

function getStatusLabel(activeCount: number, hasHigh: boolean): string {
  if (activeCount === 0) return 'Stable';
  if (hasHigh) return 'High Priority';
  return 'Needs Review';
}

export default function PillarDirectoryPage() {
  const { risks } = useRiskContext();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pillar Directory</h1>
          <p className="text-muted-foreground">12 governance pillars in locked order.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PILLAR_META.map(pillar => {
            const pillarRisks = risks.filter(r => r.pillar_id === pillar.id && r.status !== 'Resolved');
            const hasHigh = pillarRisks.some(r => r.impact_level === 'High');
            const statusLabel = getStatusLabel(pillarRisks.length, hasHigh);

            const statusStyle = statusLabel === 'High Priority'
              ? 'bg-[hsl(var(--severity-high))]/15 text-[hsl(var(--severity-high))]'
              : statusLabel === 'Needs Review'
                ? 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]'
                : 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]';

            return (
              <Card
                key={pillar.id}
                className={`cursor-pointer border-l-4 ${CAT_COLORS[pillar.category]} hover:border-primary/30 transition-colors`}
                onClick={() => navigate(`/pillar-detail/${pillar.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{pillar.id}. {pillar.name}</CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-xs line-clamp-2">{pillar.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="outline" className={statusStyle}>{statusLabel}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {pillarRisks.length} active risk{pillarRisks.length !== 1 ? 's' : ''}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
