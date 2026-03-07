import { useEffect, useState, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskBriefPanel } from '@/components/tasks/TaskBriefPanel';
import { generateTaskBrief, generateLockedBrief } from '@/lib/task-briefs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAgentEngine } from '@/hooks/useAgentEngine';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2, Clock, Loader2, ListTodo, CheckCheck,
  Lock, PlayCircle, Zap, Timer, ShieldAlert, Info, ChevronDown, ChevronRight, FileText,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Task, TaskCatalogItem } from '@/lib/types';

type CourseStatus = 'open' | 'in_progress' | 'done';

const STATUS_CONFIG: Record<CourseStatus, { label: string; icon: typeof CheckCircle2; variant: 'default' | 'secondary' | 'outline' }> = {
  open: { label: 'Open', icon: ListTodo, variant: 'secondary' },
  in_progress: { label: 'In Progress', icon: Clock, variant: 'outline' },
  done: { label: 'Done', icon: CheckCircle2, variant: 'default' },
};

const PILLAR_NAMES: Record<string, string> = {
  'master-key-control': 'Pillar 1 — Master Key Control',
  'credential-system': 'Pillar 2 — Credential System',
  'mfa-standard': 'Pillar 3 — MFA Standard',
  'account-inventory': 'Pillar 4 — Account Inventory',
  'account-closure': 'Pillar 5 — Account Closure & Data Minimization',
  'breach-reality': 'Pillar 6 — Breach Reality & Alerts',
  'session-device-control': 'Pillar 7 — Session & Device Control',
  'connected-apps': 'Pillar 8 — Connected Apps & Permissions',
  'inbox-cloud-hygiene': 'Pillar 9 — Inbox & Cloud Vault Hygiene',
  'personal-content': 'Pillar 10 — Personal Content & Social Footprint',
  'public-footprint': 'Pillar 11 — Public Footprint & Data Brokers',
  'governance-cadence': 'Pillar 12 — Governance Cadence & Containment',
};

const PILLAR_ORDER = [
  'master-key-control', 'credential-system', 'mfa-standard', 'account-inventory',
  'account-closure', 'breach-reality', 'session-device-control', 'connected-apps',
  'inbox-cloud-hygiene', 'personal-content', 'public-footprint', 'governance-cadence',
];

interface PendingAction {
  actionId: string;
  taskId: string;
  taskTitle: string;
  newStatus: CourseStatus;
}

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logEvent } = useAuditLog();
  const { proposeAction, confirmAction, rejectAction, getNextRecommendation } = useAgentEngine();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [catalog, setCatalog] = useState<TaskCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('open');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [tasksRes, catalogRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('source_type', 'course').order('sequence_order', { ascending: true }),
      supabase.from('task_catalog').select('*').order('course_order', { ascending: true }),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data as Task[]);
    if (catalogRes.data) setCatalog(catalogRes.data as TaskCatalogItem[]);
    setLoading(false);
  };

  // Derived state
  const completedSourceIds = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => { if (t.status === 'done' && t.source_id) set.add(t.source_id); });
    return set;
  }, [tasks]);

  const catalogMap = useMemo(() => {
    const map = new Map<string, TaskCatalogItem>();
    catalog.forEach(c => map.set(c.id, c));
    return map;
  }, [catalog]);

  const catalogDeps = useMemo(() => {
    const map = new Map<string, string[]>();
    catalog.forEach(c => map.set(c.id, c.dependency_task_ids || []));
    return map;
  }, [catalog]);

  const isDependencyMet = (task: Task): boolean => {
    if (!task.source_id) return true;
    const deps = catalogDeps.get(task.source_id);
    if (!deps || deps.length === 0) return true;
    return deps.every(depId => completedSourceIds.has(depId));
  };

  const courseTasks = tasks.filter(t => t.source_type === 'course');

  // Agent recommendation
  const recommendation = useMemo(
    () => getNextRecommendation(
      courseTasks.map(t => ({ title: t.title, status: t.status, source_id: t.source_id, sequence_order: t.sequence_order })),
      completedSourceIds,
      catalogDeps,
    ),
    [courseTasks, completedSourceIds, catalogDeps, getNextRecommendation],
  );

  // Generate plan — goes through agent
  const generatePlan = async () => {
    setGenerating(true);
    const result = await proposeAction(
      { action_type: 'generate_plan', target_type: 'plan', proposed_payload: { task_count: 72 } },
      { completedSourceIds, catalogDeps },
    );

    if (!result.approved) {
      toast({ title: 'Blocked', description: result.reason, variant: 'destructive' });
      setGenerating(false);
      return;
    }

    // Execute
    const { error } = await supabase.rpc('generate_course_tasks');
    if (error) {
      if (result.action_id) await rejectAction(result.action_id, error.message);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      if (result.action_id) await confirmAction(result.action_id);
      await logEvent('plan_generated', { task_count: 72 });
      toast({ title: 'Guided Plan generated', description: '72 tasks created across 12 pillars.' });
      await loadData();
    }
    setGenerating(false);
  };

  // Request a status change — propose through agent, then show approval dialog
  const requestStatusChange = useCallback(async (task: Task, newStatus: CourseStatus) => {
    const result = await proposeAction(
      {
        action_type: 'task_status_change',
        target_type: 'task',
        target_id: task.id,
        proposed_payload: {
          source_id: task.source_id || '',
          current_status: task.status,
          new_status: newStatus,
          title: task.title,
        },
      },
      { completedSourceIds, catalogDeps },
    );

    if (!result.approved) {
      toast({ title: 'Action blocked', description: result.reason, variant: 'destructive' });
      return;
    }

    // Show approval dialog
    setPendingAction({
      actionId: result.action_id!,
      taskId: task.id,
      taskTitle: task.title,
      newStatus,
    });
  }, [proposeAction, completedSourceIds, catalogDeps, toast]);

  // User confirms the pending action
  const handleApprove = async () => {
    if (!pendingAction) return;

    const updates: Record<string, unknown> = { status: pendingAction.newStatus };
    if (pendingAction.newStatus === 'done') updates.completed_at = new Date().toISOString();
    if (pendingAction.newStatus === 'open') updates.completed_at = null;

    const { error } = await supabase.from('tasks').update(updates).eq('id', pendingAction.taskId);

    if (!error) {
      await confirmAction(pendingAction.actionId);
      await logEvent('task_status_changed', {
        task_id: pendingAction.taskId,
        new_status: pendingAction.newStatus,
      });
      setTasks(prev => prev.map(t =>
        t.id === pendingAction.taskId
          ? { ...t, status: pendingAction.newStatus, ...(pendingAction.newStatus === 'done' ? { completed_at: new Date().toISOString() } : { completed_at: null }) }
          : t
      ));
    } else {
      await rejectAction(pendingAction.actionId, error.message);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setPendingAction(null);
  };

  // User rejects the pending action
  const handleReject = async () => {
    if (!pendingAction) return;
    await rejectAction(pendingAction.actionId, 'User declined');
    setPendingAction(null);
  };

  // Grouping and filtering
  const groupedByPillar = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    PILLAR_ORDER.forEach(pid => { groups[pid] = []; });
    courseTasks.forEach(t => {
      const catItem = t.source_id ? catalogMap.get(t.source_id) : null;
      const pillarId = catItem?.pillar_id || 'unknown';
      if (!groups[pillarId]) groups[pillarId] = [];
      groups[pillarId].push(t);
    });
    return groups;
  }, [courseTasks, catalogMap]);

  const filteredGroups = useMemo(() => {
    const result: Record<string, Task[]> = {};
    for (const [pillarId, pillarTasks] of Object.entries(groupedByPillar)) {
      const filtered = pillarTasks.filter(t => activeTab === 'all' || t.status === activeTab);
      if (filtered.length > 0) result[pillarId] = filtered;
    }
    return result;
  }, [groupedByPillar, activeTab]);

  const counts = useMemo(() => ({
    open: courseTasks.filter(t => t.status === 'open').length,
    in_progress: courseTasks.filter(t => t.status === 'in_progress').length,
    done: courseTasks.filter(t => t.status === 'done').length,
    total: courseTasks.length,
  }), [courseTasks]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (courseTasks.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Guided Plan</h1>
            <p className="text-muted-foreground">72 tasks across 12 pillars — your governance course.</p>
          </div>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-4">
              <ListTodo className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-lg font-medium">No guided plan yet</p>
              <p className="text-muted-foreground max-w-md mx-auto">
                Generate your personalized course of 72 tasks organized by the 12 governance pillars.
              </p>
              <Button onClick={generatePlan} disabled={generating} size="lg">
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                Generate Guided Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Approval Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) handleReject(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction && (
                <>
                  Change <strong>"{pendingAction.taskTitle}"</strong> to{' '}
                  <Badge variant="outline">{pendingAction.newStatus}</Badge>?
                  <br /><br />
                  <span className="text-xs text-muted-foreground">
                    Every action is logged. You can review your action history in Settings.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleReject}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guided Plan</h1>
            <p className="text-muted-foreground">{counts.done}/{counts.total} tasks completed</p>
          </div>
        </div>

        {/* Agent recommendation */}
        {recommendation && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <CardTitle className="text-sm font-medium">Recommended next</CardTitle>
                  <CardDescription className="text-xs">{recommendation.title} — {recommendation.reason}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ListTodo className="h-4 w-4" /> Open
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{counts.open}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> In Progress
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{counts.in_progress}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCheck className="h-4 w-4" /> Done
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{counts.done}</p></CardContent>
          </Card>
        </div>

        {/* Task list */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.total})</TabsTrigger>
            <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({counts.in_progress})</TabsTrigger>
            <TabsTrigger value="done">Done ({counts.done})</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-6">
            {PILLAR_ORDER.map(pillarId => {
              const pillarTasks = filteredGroups[pillarId];
              if (!pillarTasks || pillarTasks.length === 0) return null;
              const allPillarTasks = groupedByPillar[pillarId] || [];
              const pillarDone = allPillarTasks.filter(t => t.status === 'done').length;

              return (
                <div key={pillarId}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">{PILLAR_NAMES[pillarId] || pillarId}</h2>
                    <Badge variant="outline">{pillarDone}/{allPillarTasks.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {pillarTasks.map(task => {
                      const catItem = task.source_id ? catalogMap.get(task.source_id) : null;
                      const locked = !isDependencyMet(task) && task.status !== 'done';
                      return (
                        <CourseTaskItem
                          key={task.id}
                          task={task}
                          catItem={catItem || null}
                          locked={locked}
                          onStatusChange={requestStatusChange}
                          catalogMap={catalogMap}
                          completedSourceIds={completedSourceIds}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}

interface CourseTaskItemProps {
  task: Task;
  catItem: TaskCatalogItem | null;
  locked: boolean;
  onStatusChange: (task: Task, status: CourseStatus) => void;
  catalogMap: Map<string, TaskCatalogItem>;
  completedSourceIds: Set<string>;
}

function CourseTaskItem({ task, catItem, locked, onStatusChange, catalogMap, completedSourceIds }: CourseTaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const status = task.status as CourseStatus;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const StatusIcon = config.icon;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className={locked ? 'opacity-50' : ''}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {task.sequence_order || '—'}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                  <Badge variant={config.variant} className="text-xs">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  {locked && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      <Lock className="h-3 w-3 mr-1" /> Locked
                    </Badge>
                  )}
                  {catItem?.blast_radius === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" /> High Impact
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <CardDescription className="text-xs mt-0.5">{task.description}</CardDescription>
                )}
                {catItem?.effort_minutes && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Timer className="h-3 w-3" /> ~{catItem.effort_minutes} min
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {catItem && (
                <CollapsibleTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Brief
                    {expanded ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
                  </Button>
                </CollapsibleTrigger>
              )}
              {!locked && (
                <>
                  {status === 'open' && (
                    <Button size="sm" variant="outline" onClick={() => onStatusChange(task, 'in_progress')}>
                      Start
                    </Button>
                  )}
                  {status === 'in_progress' && (
                    <Button size="sm" onClick={() => onStatusChange(task, 'done')}>
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Done
                    </Button>
                  )}
                  {status === 'done' && (
                    <Button size="sm" variant="ghost" onClick={() => onStatusChange(task, 'open')}>
                      Reopen
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {catItem && (
          <CollapsibleContent>
            <div className="px-4 pb-4">
              {locked ? (
                <TaskBriefPanel
                  locked={true}
                  brief={generateLockedBrief(catItem, catalogMap, completedSourceIds)}
                  taskTitle={task.title}
                />
              ) : (
                <TaskBriefPanel
                  locked={false}
                  brief={generateTaskBrief(catItem, catalogMap)}
                />
              )}
            </div>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  );
}
