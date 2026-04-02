import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRiskContext } from '@/hooks/useRiskContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

export default function GovernanceCadencePage() {
  const { risks, decisions } = useRiskContext();
  const navigate = useNavigate();

  const unresolvedRisks = risks.filter(r => r.status !== 'Resolved');
  const recentDecisions = decisions.slice(0, 5);
  const pendingCount = risks.filter(r => r.decision_state === 'Pending').length;
  const resolvedCount = risks.filter(r => r.status === 'Resolved').length;
  const totalRisks = risks.length;

  // Next review: mock — 30 days from now
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + 30);

  const readiness = pendingCount === 0 && unresolvedRisks.length === 0
    ? 'Ready'
    : pendingCount > 0
      ? 'Decisions Pending'
      : 'Risks Open';

  const readinessStyle = readiness === 'Ready'
    ? 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]'
    : 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Governance Cadence</h1>
          <p className="text-muted-foreground">Review schedule, open decisions, and containment readiness.</p>
        </div>

        {/* Summary row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Next Review</p>
                  <p className="text-sm font-medium">{nextReview.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-[hsl(var(--severity-medium))]" />
                <div>
                  <p className="text-xs text-muted-foreground">Unresolved Risks</p>
                  <p className="text-sm font-medium">{unresolvedRisks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--severity-low))]" />
                <div>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                  <p className="text-sm font-medium">{resolvedCount} / {totalRisks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <Badge variant="outline" className={readinessStyle}>{readiness}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Review</CardTitle>
              <CardDescription>Scheduled governance review cycle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cadence</span>
                <span>Monthly</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next date</span>
                <span>{nextReview.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending decisions</span>
                <span>{pendingCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Open Decisions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Decisions</CardTitle>
              <CardDescription>Risks requiring your review.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCount === 0 ? (
                <p className="text-sm text-muted-foreground">All decisions have been addressed.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm"><strong>{pendingCount}</strong> decision{pendingCount !== 1 ? 's' : ''} pending.</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/decision-queue')}>
                    View Decision Queue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Decisions</CardTitle>
              <CardDescription>Latest governance decisions.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDecisions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentDecisions.map(d => {
                    const risk = risks.find(r => r.id === d.risk_id);
                    return (
                      <div key={d.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground/80 truncate">{risk?.risk_type ?? d.risk_id}</span>
                        <Badge variant="outline" className="text-xs shrink-0 ml-2">{d.action}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Containment Readiness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Containment Readiness</CardTitle>
              <CardDescription>Incident response preparation status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Playbooks available</span>
                <span>5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Readiness status</span>
                <Badge variant="outline" className={readinessStyle}>{readiness}</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/playbooks')} className="mt-2">
                View Playbooks
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Review all pillars, resolve open decisions, and confirm your governance posture.
            </p>
            <Button onClick={() => navigate('/governance-console')}>
              Run Governance Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
