import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ShieldCheck, ShieldAlert, ShieldX, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

interface AgentAction {
  id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  status: string;
  reason: string | null;
  proposed_payload: Json;
  created_at: string;
  resolved_at: string | null;
}

interface AuditEntry {
  id: string;
  event_type: string;
  payload_json: Json;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; icon: typeof ShieldCheck; className: string }> = {
  approved: { label: 'Approved', icon: ShieldCheck, className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  pending: { label: 'Pending', icon: Clock, className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  blocked: { label: 'Blocked', icon: ShieldAlert, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  rejected: { label: 'Rejected', icon: ShieldX, className: 'bg-muted text-muted-foreground border-border' },
};

function actionToPlainLanguage(action: AgentAction): string {
  const payload = action.proposed_payload as Record<string, unknown> | null;
  switch (action.action_type) {
    case 'generate_plan':
      return `Generate guided plan (${payload?.task_count ?? 72} tasks)`;
    case 'task_status_change': {
      const title = payload?.title ?? action.target_id ?? 'task';
      const from = payload?.current_status ?? '?';
      const to = payload?.new_status ?? '?';
      return `Change "${title}" from ${from} → ${to}`;
    }
    case 'pillar_start':
      return `Start pillar: ${action.target_id ?? 'unknown'}`;
    default:
      return `${action.action_type} on ${action.target_type ?? 'unknown'}`;
  }
}

function auditToPlainLanguage(entry: AuditEntry): string {
  const payload = entry.payload_json as Record<string, unknown> | null;
  switch (entry.event_type) {
    case 'plan_generated':
      return `Guided plan generated (${payload?.task_count ?? 72} tasks)`;
    case 'task_status_changed':
      return `Task status changed to ${payload?.new_status ?? '?'}`;
    case 'agent_action_blocked':
      return `Agent action blocked: ${payload?.reason ?? 'validation failed'}`;
    case 'agent_action_approved':
      return `Agent action approved`;
    case 'agent_action_rejected':
      return `Agent action rejected: ${payload?.reason ?? 'user declined'}`;
    case 'task_completed':
      return 'Task marked completed';
    case 'task_skipped':
      return 'Task skipped';
    case 'welcome_tour_completed':
      return 'Welcome tour completed';
    case 'account_created':
      return 'Account created';
    default:
      return entry.event_type.replace(/_/g, ' ');
  }
}

export default function AgentLogPage() {
  const { user } = useAuth();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [actionsRes, auditRes] = await Promise.all([
      supabase.from('agent_actions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200),
      supabase.from('audit_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200),
    ]);
    if (actionsRes.data) setActions(actionsRes.data as AgentAction[]);
    if (auditRes.data) setAuditLog(auditRes.data as AuditEntry[]);
    setLoading(false);
  };

  const counts = {
    approved: actions.filter(a => a.status === 'approved').length,
    blocked: actions.filter(a => a.status === 'blocked').length,
    rejected: actions.filter(a => a.status === 'rejected').length,
    pending: actions.filter(a => a.status === 'pending').length,
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Agent Action Log</h1>
          <p className="text-muted-foreground">Every agent decision — visible, auditable, yours.</p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-primary">{counts.approved}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-destructive">{counts.blocked}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-muted-foreground">{counts.rejected}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-amber-600">{counts.pending}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="actions">
          <TabsList>
            <TabsTrigger value="actions">Agent Actions ({actions.length})</TabsTrigger>
            <TabsTrigger value="audit">Full Audit Log ({auditLog.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="mt-4">
            <Card>
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-border">
                  {actions.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No agent actions yet. Generate your guided plan to get started.</p>
                    </div>
                  ) : (
                    actions.map(action => {
                      const statusConfig = STATUS_MAP[action.status] || STATUS_MAP.pending;
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div key={action.id} className="flex items-start gap-3 p-4">
                          <StatusIcon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{actionToPlainLanguage(action)}</span>
                              <Badge variant="outline" className={statusConfig.className}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            {action.reason && (
                              <p className="text-xs text-muted-foreground mt-1">{action.reason}</p>
                            )}
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {format(new Date(action.created_at), 'MMM d, yyyy · h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-border">
                  {auditLog.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No audit events yet.</p>
                    </div>
                  ) : (
                    auditLog.map(entry => (
                      <div key={entry.id} className="flex items-start gap-3 p-4">
                        <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium">{auditToPlainLanguage(entry)}</span>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
