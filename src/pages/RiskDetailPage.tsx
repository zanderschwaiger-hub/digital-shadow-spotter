import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRiskContext } from '@/hooks/useRiskContext';
import { ArrowLeft } from 'lucide-react';

const IMPACT_STYLE: Record<string, string> = {
  High: 'bg-[hsl(var(--severity-high))]/15 text-[hsl(var(--severity-high))]',
  Medium: 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
  Low: 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
};

export default function RiskDetailPage() {
  const { riskId } = useParams<{ riskId: string }>();
  const navigate = useNavigate();
  const { risks, approveRisk, modifyRisk, deferRisk } = useRiskContext();
  const [notes, setNotes] = useState('');
  const [acted, setActed] = useState(false);

  const risk = risks.find(r => r.id === riskId);

  if (!risk) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Risk not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </AppLayout>
    );
  }

  const handleAction = (action: 'approve' | 'modify' | 'defer') => {
    if (action === 'approve') approveRisk(risk.id, notes);
    else if (action === 'modify') modifyRisk(risk.id, notes || 'Plan modified by user.');
    else deferRisk(risk.id, notes);
    setActed(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{risk.risk_type}</CardTitle>
              <Badge variant="outline" className={IMPACT_STYLE[risk.impact_level]}>
                {risk.impact_level}
              </Badge>
            </div>
            <CardDescription>
              {risk.pillar_name} · Confidence: {Math.round(risk.confidence_score * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Problem summary */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Why this was flagged</p>
              <ul className="list-disc list-inside space-y-1">
                {risk.why_flagged.map((reason, i) => (
                  <li key={i} className="text-sm text-foreground/80">{reason}</li>
                ))}
              </ul>
            </div>

            {/* Why it matters */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Recommended action</p>
              <p className="text-sm">{risk.recommended_action}</p>
            </div>

            {/* Expected outcome */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Expected outcome</p>
              <p className="text-sm text-foreground/80">
                Addressing this will move the risk status to resolved and improve your governance posture for {risk.pillar_name}.
              </p>
            </div>

            {/* Notes */}
            {!acted && (
              <>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Your notes (optional)</p>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Why this decision? What's the plan?"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleAction('approve')}>Approve</Button>
                  <Button variant="outline" onClick={() => handleAction('modify')}>Modify plan</Button>
                  <Button variant="ghost" onClick={() => handleAction('defer')}>Cancel</Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  No automatic execution. Your decision will be recorded and the risk status updated.
                </p>
              </>
            )}

            {acted && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-4 text-center">
                  <p className="text-sm font-medium">Decision recorded.</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/decision-queue')}>
                    Return to Decision Queue
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
