import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { CheckCircle2, Clock, SkipForward, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaskCardProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
  onRemind: (taskId: string) => void;
}

export function TaskCard({ tasks, onComplete, onSkip, onRemind }: TaskCardProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Today's Tasks
        </CardTitle>
        <Link to="/tasks">
          <Button variant="ghost" size="sm" className="text-xs">
            View All
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No pending tasks. Great job! 🎉
          </p>
        ) : (
          pendingTasks.map((task) => (
            <div key={task.id} className="rounded-lg border p-3">
              <p className="font-medium text-sm mb-2">{task.title}</p>
              {task.description && (
                <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => onComplete(task.id)}
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  I Did It
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRemind(task.id)}
                >
                  <Clock className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onSkip(task.id)}
                >
                  <SkipForward className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}