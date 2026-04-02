import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRiskContext } from '@/hooks/useRiskContext';
import { PILLAR_META } from '@/lib/pillar-risks';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';

const ACTION_STYLE: Record<string, string> = {
  Approved: 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
  Modified: 'bg-primary/15 text-primary',
  Deferred: 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
  Resolved: 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
};

export default function GovernanceAuditPage() {
  const { risks, decisions } = useRiskContext();
  const [tab, setTab] = useState('all');

  const filtered = decisions.filter(d => {
    if (tab === 'all') return true;
    if (tab === 'approved') return d.action === 'Approved';
    if (tab === 'deferred') return d.action === 'Deferred';
    if (tab === 'resolved') return d.action === 'Resolved';
    // By pillar — tab is a pillar id
    const pid = Number(tab);
    if (!isNaN(pid)) {
      const risk = risks.find(r => r.id === d.risk_id);
      return risk?.pillar_id === pid;
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audit / History</h1>
          <p className="text-muted-foreground">Complete decision trail across all pillars.</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="deferred">Deferred</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            {PILLAR_META.map(p => (
              <TabsTrigger key={p.id} value={String(p.id)} className="text-xs">
                P{p.id}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No audit entries match this filter.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-border">
                    {filtered.map(d => {
                      const risk = risks.find(r => r.id === d.risk_id);
                      return (
                        <div key={d.id} className="flex items-start gap-3 p-4">
                          <div className="h-2 w-2 rounded-full mt-2 bg-primary/60 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(d.timestamp), 'MMM d, yyyy')}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {risk?.pillar_name ?? 'Unknown'}
                              </Badge>
                              <Badge className={ACTION_STYLE[d.action] ?? ''} variant="outline">
                                {d.action}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mt-1">{risk?.risk_type ?? d.risk_id}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Confidence at time: {risk ? Math.round(risk.confidence_score * 100) + '%' : '—'}
                            </p>
                            {risk?.recommended_action && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Recommendation: {risk.recommended_action}
                              </p>
                            )}
                            {d.notes && (
                              <p className="text-xs text-foreground/70 mt-1 italic">"{d.notes}"</p>
                            )}
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                              Status: {risk?.status ?? '—'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
