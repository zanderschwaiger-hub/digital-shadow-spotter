import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Clock,
  Loader2,
  ListTodo,
  CheckCheck,
  Lock,
  PlayCircle,
  Zap,
  Timer,
} from 'lucide-react';
import { Task, TaskCatalogItem } from '@/lib/types';

type CourseStatus = 'open' | 'in_progress' | 'done';

const STATUS_CONFIG: Record<CourseStatus, { label: string; icon: typeof CheckCircle2; variant: 'default' | 'secondary' | 'outline' }> = {
  open: { label: 'Open', icon: ListTodo, variant: 'secondary' },
  in_progress: { label: 'In Progress', icon: Clock, variant: 'outline' },
  done: { label: 'Done', icon: CheckCircle2, variant: 'default' },
};

// Pillar display names keyed by pillar_id
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

// Ordered pillar IDs
const PILLAR_ORDER = [
  'master-key-control', 'credential-system', 'mfa-standard', 'account-inventory',
  'account-closure', 'breach-reality', 'session-device-control', 'connected-apps',
  'inbox-cloud-hygiene', 'personal-content', 'public-footprint', 'governance-cadence',
];

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [catalog, setCatalog] = useState<TaskCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('open');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const [tasksRes, catalogRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_type', 'course')
        .order('sequence_order', { ascending: true }),
      supabase
        .from('task_catalog')
        .select('*')
        .order('course_order', { ascending: true }),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data as Task[]);
    if (catalogRes.data) setCatalog(catalogRes.data as TaskCatalogItem[]);
    setLoading(false);
  };

  const generatePlan = async () => {
    setGenerating(true);
    const { error } = await supabase.rpc('generate_course_tasks');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Guided Plan generated!', description: '72 tasks created across 12 pillars.' });
      await loadData();
    }
    setGenerating(false);
  };

  const updateTaskStatus = async (taskId: string, status: CourseStatus) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'done') updates.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (!error) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status, ...(status === 'done' ? { completed_at: new Date().toISOString() } : {}) } : t
      ));
    }
  };

  // Build a set of completed source_ids for dependency checking
  const completedSourceIds = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => {
      if (t.status === 'done' && t.source_id) set.add(t.source_id);
    });
    return set;
  }, [tasks]);

  // Build catalog lookup
  const catalogMap = useMemo(() => {
    const map = new Map<string, TaskCatalogItem>();
    catalog.forEach(c => map.set(c.id, c));
    return map;
  }, [catalog]);

  // Check if a task's dependencies are met
  const isDependencyMet = (task: Task): boolean => {
    if (!task.source_id) return true;
    const catItem = catalogMap.get(task.source_id);
    if (!catItem || !catItem.dependency_task_ids || catItem.dependency_task_ids.length === 0) return true;
    return catItem.dependency_task_ids.every(depId => completedSourceIds.has(depId));
  };

  // Group tasks by pillar
  const courseTasks = tasks.filter(t => t.source_type === 'course');
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

  // Filter by status tab
  const filteredGroups = useMemo(() => {
    const result: Record<string, Task[]> = {};
    for (const [pillarId, pillarTasks] of Object.entries(groupedByPillar)) {
      const filtered = pillarTasks.filter(t => {
        if (activeTab === 'all') return true;
        return t.status === activeTab;
      });
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

  // No course tasks yet — show generate button
  if (courseTasks.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Guided Plan</h1>
            <p className="text-muted-foreground">
              72 tasks across 12 pillars to secure your digital footprint.
            </p>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guided Plan</h1>
            <p className="text-muted-foreground">
              {counts.done}/{counts.total} tasks completed
            </p>
          </div>
        </div>

        {/* Summary cards */}
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

        {/* Tabs */}
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
                          onStatusChange={updateTaskStatus}
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
  onStatusChange: (id: string, status: CourseStatus) => void;
}

function CourseTaskItem({ task, catItem, locked, onStatusChange }: CourseTaskItemProps) {
  const status = task.status as CourseStatus;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const StatusIcon = config.icon;

  return (
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

          {!locked && (
            <div className="flex gap-2 shrink-0">
              {status === 'open' && (
                <Button size="sm" variant="outline" onClick={() => onStatusChange(task.id, 'in_progress')}>
                  Start
                </Button>
              )}
              {status === 'in_progress' && (
                <Button size="sm" onClick={() => onStatusChange(task.id, 'done')}>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Done
                </Button>
              )}
              {status === 'done' && (
                <Button size="sm" variant="ghost" onClick={() => onStatusChange(task.id, 'open')}>
                  Reopen
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
