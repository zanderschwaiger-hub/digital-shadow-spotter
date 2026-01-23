import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Clock,
  SkipForward,
  ExternalLink,
  Loader2,
  ListTodo,
  CheckCheck,
  XCircle
} from 'lucide-react';
import { Task, TaskStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: typeof CheckCircle2; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' },
  completed: { label: 'Completed', icon: CheckCircle2, variant: 'default' },
  skipped: { label: 'Skipped', icon: XCircle, variant: 'outline' },
  reminded: { label: 'Reminded', icon: Clock, variant: 'secondary' }
};

export default function TasksPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const updates: { status: string; completed_at?: string } = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (!error) {
      await logEvent(`task_${status}`, { task_id: taskId });
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updates } as Task : t
      ));
      
      if (status === 'completed') {
        toast({ title: 'Task completed!', description: 'Great job maintaining your footprint.' });
      }
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'reminded');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const skippedTasks = tasks.filter(t => t.status === 'skipped');

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
          <h1 className="text-2xl font-bold">Cleanup Tasks</h1>
          <p className="text-muted-foreground">
            Human-in-the-loop tasks to maintain your digital footprint
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingTasks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCheck className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedTasks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Skipped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{skippedTasks.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            <TabsTrigger value="skipped">Skipped ({skippedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-muted-foreground">No pending tasks. Great job maintaining your footprint.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onComplete={() => updateTaskStatus(task.id, 'completed')}
                    onSkip={() => updateTaskStatus(task.id, 'skipped')}
                    onRemind={() => updateTaskStatus(task.id, 'reminded')}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {completedTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No completed tasks yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="skipped" className="mt-4">
            {skippedTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No skipped tasks.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {skippedTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onReopen={() => updateTaskStatus(task.id, 'pending')}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Task Generation Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">How Tasks Are Generated</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Tasks are automatically generated based on:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your identity inventory completeness</li>
              <li>Enabled signals and detected alerts</li>
              <li>Best practices for digital hygiene</li>
              <li>Your account security status</li>
            </ul>
            <p className="mt-4">
              <strong>Remember:</strong> Every task is a suggestion. You decide whether to complete, skip, or postpone it.
              We never perform actions without your explicit confirmation.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

interface TaskItemProps {
  task: Task;
  onComplete?: () => void;
  onSkip?: () => void;
  onRemind?: () => void;
  onReopen?: () => void;
}

function TaskItem({ task, onComplete, onSkip, onRemind, onReopen }: TaskItemProps) {
  const statusConfig = STATUS_CONFIG[task.status];
  const StatusIcon = statusConfig.icon;
  const steps = Array.isArray(task.steps_json) ? task.steps_json : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={statusConfig.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline">{task.type}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
              </span>
            </div>
            <CardTitle className="text-base">{task.title}</CardTitle>
            {task.description && (
              <CardDescription>{task.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      {steps.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium">Steps:</p>
            <ul className="space-y-2">
              {steps.map((step, idx) => (
                <li key={step.id || idx} className="flex items-start gap-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <p>{step.title}</p>
                    {step.description && (
                      <p className="text-muted-foreground text-xs">{step.description}</p>
                    )}
                    {step.link && (
                      <a 
                        href={step.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        Open official link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
      {(onComplete || onSkip || onRemind || onReopen) && (
        <CardContent className="pt-0">
          <div className="flex gap-2">
            {onComplete && (
              <Button onClick={onComplete} className="flex-1">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                I Did It
              </Button>
            )}
            {onRemind && (
              <Button variant="outline" onClick={onRemind}>
                <Clock className="mr-2 h-4 w-4" />
                Remind Me
              </Button>
            )}
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                <SkipForward className="mr-2 h-4 w-4" />
                Skip
              </Button>
            )}
            {onReopen && (
              <Button variant="outline" onClick={onReopen}>
                Reopen Task
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}