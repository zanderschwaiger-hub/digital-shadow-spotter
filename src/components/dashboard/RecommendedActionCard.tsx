import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAgentEngine } from '@/hooks/useAgentEngine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, ListTodo } from 'lucide-react';
import { Task, TaskCatalogItem } from '@/lib/types';

export function RecommendedActionCard() {
  const { user } = useAuth();
  const { getNextRecommendation } = useAgentEngine();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [catalog, setCatalog] = useState<TaskCatalogItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('source_type', 'course').order('sequence_order', { ascending: true }),
      supabase.from('task_catalog').select('*').order('course_order', { ascending: true }),
    ]).then(([tasksRes, catRes]) => {
      if (tasksRes.data) setTasks(tasksRes.data as Task[]);
      if (catRes.data) setCatalog(catRes.data as TaskCatalogItem[]);
      setLoaded(true);
    });
  }, [user]);

  const completedSourceIds = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => { if (t.status === 'done' && t.source_id) set.add(t.source_id); });
    return set;
  }, [tasks]);

  const catalogDeps = useMemo(() => {
    const map = new Map<string, string[]>();
    catalog.forEach(c => map.set(c.id, c.dependency_task_ids || []));
    return map;
  }, [catalog]);

  const recommendation = useMemo(
    () => getNextRecommendation(
      tasks.map(t => ({ title: t.title, status: t.status, source_id: t.source_id, sequence_order: t.sequence_order })),
      completedSourceIds,
      catalogDeps,
    ),
    [tasks, completedSourceIds, catalogDeps, getNextRecommendation],
  );

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length;

  if (!loaded) return null;

  // No plan generated yet
  if (totalCount === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ListTodo className="h-4 w-4" /> Recommended Next Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Generate your guided plan to get agent-driven recommendations.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/tasks')}>
            Go to Tasks <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Recommended Next Action
        </CardTitle>
        <CardDescription className="text-xs">{doneCount}/{totalCount} tasks completed</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendation ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">{recommendation.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{recommendation.reason}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/tasks')}>
              Open in Tasks <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge variant="default">All tasks completed</Badge>
            <p className="text-xs text-muted-foreground">Your governance course is complete.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
