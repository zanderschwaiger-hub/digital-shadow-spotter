import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssessment } from '@/hooks/useAssessment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EXPOSURE_TYPES } from '@/lib/control-library';
import { FilePlus, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface DecisionEntry {
  exposure_type_id: string;
  action: 'mitigate' | 'defer' | 'accept';
  notes: string;
  decided_at: string;
}

export default function DecisionsPage() {
  const { user } = useAuth();
  const { overallScore, logDecision } = useAssessment();
  const { toast } = useToast();

  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // New decision form
  const [selectedExposure, setSelectedExposure] = useState('');
  const [selectedAction, setSelectedAction] = useState<'mitigate' | 'defer' | 'accept'>('mitigate');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDecisions();
  }, [user]);

  const loadDecisions = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_type', 'user_decision')
      .order('created_at', { ascending: false });

    if (data) {
      setDecisions(
        data.map(d => d.payload_json as unknown as DecisionEntry).filter(Boolean)
      );
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedExposure) return;
    setSubmitting(true);
    
    const { error } = await logDecision(selectedExposure, selectedAction, notes);
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Decision logged', description: 'Your decision has been recorded in the audit trail.' });
      setSelectedExposure('');
      setNotes('');
      await loadDecisions();
    }
    setSubmitting(false);
  };

  const getExposureName = (id: string) => 
    EXPOSURE_TYPES.find(e => e.id === id)?.name || id;

  const ACTION_CONFIG = {
    mitigate: { icon: CheckCircle2, label: 'Mitigate', className: 'bg-[hsl(var(--severity-low))] text-[hsl(var(--severity-low-foreground))]' },
    defer: { icon: Clock, label: 'Defer', className: 'bg-[hsl(var(--severity-medium))] text-[hsl(var(--severity-medium-foreground))]' },
    accept: { icon: PauseCircle, label: 'Accept', className: 'bg-secondary text-secondary-foreground' },
  };

  // Get currently triggered exposures for the dropdown
  const triggeredIds = new Set(overallScore?.triggeredExposures.map(e => e.exposureType.id) || []);
  const availableExposures = EXPOSURE_TYPES.filter(e => triggeredIds.has(e.id));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Decisions</h1>
          <p className="text-muted-foreground">
            Log decisions for each exposure: mitigate, defer, or accept. Append-only audit trail.
          </p>
        </div>

        {/* New decision form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FilePlus className="h-5 w-5" /> Log a Decision
            </CardTitle>
            <CardDescription>
              Choose an exposure and record your decision. Each entry is permanent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Exposure</label>
                <Select value={selectedExposure} onValueChange={setSelectedExposure}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exposure..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableExposures.length > 0 ? (
                      availableExposures.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))
                    ) : (
                      EXPOSURE_TYPES.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as 'mitigate' | 'defer' | 'accept')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mitigate">Mitigate — take corrective action</SelectItem>
                    <SelectItem value="defer">Defer — address at next review</SelectItem>
                    <SelectItem value="accept">Accept — no action needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Why this decision? What's the next step?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit} disabled={!selectedExposure || submitting}>
              {submitting ? 'Logging...' : 'Log Decision'}
            </Button>
          </CardContent>
        </Card>

        {/* Decision history */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Decision History</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : decisions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No decisions logged yet. Complete an assessment and log your first decision.
              </CardContent>
            </Card>
          ) : (
            decisions.map((d, i) => {
              const config = ACTION_CONFIG[d.action];
              const Icon = config.icon;
              return (
                <Card key={i}>
                  <CardContent className="flex items-start gap-3 py-4">
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{getExposureName(d.exposure_type_id)}</span>
                        <Badge className={config.className}>{config.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(d.decided_at).toLocaleDateString()}
                        </span>
                      </div>
                      {d.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{d.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
