import { supabase } from '@/integrations/supabase/client';

/**
 * Updates the pillar score based on completed tasks.
 * Score = (completed tasks / total tasks) * 100
 * If all tasks are completed, marks the pillar as completed.
 */
export async function updatePillarScoreFromTasks(
  userId: string, 
  pillarId: string
): Promise<{ score: number; isComplete: boolean } | null> {
  // Fetch all tasks for this pillar
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('user_id', userId)
    .eq('type', `pillar:${pillarId}`);

  if (tasksError || !tasks || tasks.length === 0) {
    return null;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const score = Math.round((completedTasks / totalTasks) * 100);
  const isComplete = completedTasks === totalTasks;

  // Update the pillar progress
  const updates: { score: number; completed_at?: string } = { score };
  if (isComplete) {
    updates.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('user_pillar_progress')
    .update(updates)
    .eq('user_id', userId)
    .eq('pillar_id', pillarId);

  if (updateError) {
    console.error('Error updating pillar score:', updateError);
    return null;
  }

  return { score, isComplete };
}

/**
 * Extracts pillar ID from task type if it's a pillar task.
 * Returns null if not a pillar task.
 */
export function getPillarIdFromTaskType(taskType: string): string | null {
  if (taskType.startsWith('pillar:')) {
    return taskType.replace('pillar:', '');
  }
  return null;
}
