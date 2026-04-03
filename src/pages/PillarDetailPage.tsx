import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRiskContext } from '@/hooks/useRiskContext';
import { PILLAR_META } from '@/lib/pillar-risks';
import { ArrowLeft, CheckCircle2, Clock, Circle } from 'lucide-react';
import { format } from 'date-fns';

const IMPACT_STYLE: Record<string, string> = {
  High: 'bg-[hsl(var(--severity-high))]/15 text-[hsl(var(--severity-high))]',
  Medium: 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
  Low: 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
};

const STATUS_ICON = {
  'Needs Review': Circle,
  'Approved': CheckCircle2,
  'Deferred': Clock,
  'Resolved': CheckCircle2,
};

export default function PillarDetailPage() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const navigate = useNavigate();
  const { risks, decisions, approveRisk, deferRisk, startRisk, markRiskComplete } = useRiskContext();

  const id = Number(pillarId);
  const pillar = PILLAR_META.find(p => p.id === id);
  const pillarRisks = risks.filter(r => r.pillar_id === id);
  const activeRisks = pillarRisks.filter(r => r.status !== 'Resolved');
  const pillarDecisions = decisions.filter(d => {
    const risk = risks.find(r => r.id === d.risk_id);
    return risk?.pillar_id === id;
  });

  if (!pillar) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Pillar not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/pillar-directory')}>
            Back to Directory
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate('/pillar-directory')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{pillar.id}. {pillar.name}</h1>
              <p className="text-muted-foreground">{pillar.description}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-xs">{pillar.category}</Badge>
              <p className="text-xs text-muted-foreground mt-1">{activeRisks.length} active risk{activeRisks.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Active Risks */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Active Risks</h2>
          {activeRisks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active risks for this pillar.
              </CardContent>
            </Card>
          ) : (
            activeRisks.map(risk => {
              const Icon = STATUS_ICON[risk.status] ?? Circle;
              return (
                <Card key={risk.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">{risk.risk_type}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={IMPACT_STYLE[risk.impact_level]}>
                          {risk.impact_level}
                        </Badge>
                        <Badge variant="outline" className={
                          risk.execution_state === 'Completed' ? 'bg-primary/10 text-primary' :
                          risk.execution_state === 'In Progress' ? 'bg-accent/50 text-accent-foreground' :
                          'bg-muted text-muted-foreground'
                        }>
                          {risk.execution_state}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(risk.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Why flagged</p>
                      <ul className="list-disc list-inside space-y-1">
                        {risk.why_flagged.map((reason, i) => (
                          <li key={i} className="text-sm text-foreground/80">{reason}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Recommended action</p>
                      <p className="text-sm">{risk.recommended_action}</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {risk.decision_state === 'Pending' && (
                        <>
                          <Button size="sm" onClick={() => approveRisk(risk.id)}>
                            Approve Action
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/risk-detail/${risk.id}`)}>
                            Modify
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deferRisk(risk.id)}>
                            Defer
                          </Button>
                        </>
                      )}
                      {risk.execution_state === 'Not Started' && risk.decision_state === 'Approved' && (
                        <Button size="sm" variant="outline" onClick={() => startRisk(risk.id)}>
                          Start Work
                        </Button>
                      )}
                      {risk.execution_state === 'In Progress' && (
                        <Button size="sm" onClick={() => markRiskComplete(risk.id)}>
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* History */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">History</h2>
          {pillarDecisions.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                No decisions recorded for this pillar yet.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="divide-y divide-border">
                {pillarDecisions.map(d => {
                  const risk = risks.find(r => r.id === d.risk_id);
                  return (
                    <div key={d.id} className="flex items-start gap-3 py-3">
                      <div className="h-2 w-2 rounded-full mt-2 bg-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{d.action}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="text-xs text-muted-foreground">{risk?.risk_type ?? d.risk_id}</span>
                        </div>
                        {d.notes && <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>}
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {format(new Date(d.timestamp), 'MMM d, yyyy · h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
