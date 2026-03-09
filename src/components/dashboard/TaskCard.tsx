import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/types';
import { ArrowRight, ListTodo, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaskCardProps {
  tasks: Task[];
}

export function TaskCard({ tasks }: TaskCardProps) {
  const courseTasks = tasks.filter(t => t.source_type === 'course');
  const openTasks = courseTasks.filter(t => t.status === 'open').slice(0, 3);
  const inProgressTasks = courseTasks.filter(t => t.status === 'in_progress').slice(0, 3);
  const displayTasks = inProgressTasks.length > 0 ? inProgressTasks : openTasks;

  const doneCount = courseTasks.filter(t => t.status === 'done').length;
  const totalCount = courseTasks.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <ListTodo className="h-4 w-4" /> Tasks
        </CardTitle>
        {totalCount > 0 && (
          <Badge variant="outline" className="text-xs">{doneCount}/{totalCount}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {totalCount === 0 ? (
          <div className="py-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">No guided plan yet.</p>
            <Link to="/tasks">
              <Button size="sm" variant="outline">
                Generate Plan <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">All tasks completed.</p>
          </div>
        ) : (
          <>
            {displayTasks.map(task => (
              <div key={task.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  {task.status === 'in_progress' ? (
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <ListTodo className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <p className="font-medium text-sm">{task.title}</p>
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground ml-5.5">{task.description}</p>
                )}
              </div>
            ))}
            <Link to="/tasks" className="block">
              <Button size="sm" variant="outline" className="w-full">
                Manage in Tasks <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
