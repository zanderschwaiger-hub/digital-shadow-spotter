import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRiskContext } from '@/hooks/useRiskContext';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const IMPACT_STYLE: Record<string, string> = {
  High: 'bg-[hsl(var(--severity-high))]/15 text-[hsl(var(--severity-high))]',
  Medium: 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
  Low: 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
};

export default function DecisionQueuePage() {
  const { risks, approveRisk, deferRisk } = useRiskContext();
  const navigate = useNavigate();

  const pendingRisks = risks.filter(r => r.decision_state === 'Pending');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Decision Queue</h1>
          <p className="text-muted-foreground">Nothing changes without your approval.</p>
        </div>

        {pendingRisks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pending decisions</p>
              <p className="text-sm mt-1">All risks have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingRisks.map(risk => (
              <Card key={risk.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{risk.pillar_name}</CardTitle>
                    <Badge variant="outline" className={IMPACT_STYLE[risk.impact_level]}>
                      {risk.impact_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Risk:</span>
                    <span>{risk.risk_type}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Confidence: {Math.round(risk.confidence_score * 100)}%
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Why flagged</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {risk.why_flagged.map((r, i) => (
                        <li key={i} className="text-sm text-foreground/80">{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Recommended action</p>
                    <p className="text-sm">{risk.recommended_action}</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => approveRisk(risk.id)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/risk-detail/${risk.id}`)}>Modify</Button>
                    <Button size="sm" variant="ghost" onClick={() => deferRisk(risk.id)}>Not Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
