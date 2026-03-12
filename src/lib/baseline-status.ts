import { Task, IdentifierCoverage } from '@/lib/types';

export type BaselineStatus = 
  | 'not_established' 
  | 'in_progress' 
  | 'established';

export interface BaselineResult {
  status: BaselineStatus;
  label: string;
  description: string;
  taskPercent: number;
  navigateTo: string;
  buttonLabel: string;
}

export function calculateBaseline(
  tasks: Task[],
  coverage: IdentifierCoverage,
): BaselineResult {
  const guidedTasks = tasks.filter(t => t.source_type === 'course');
  const totalGuided = guidedTasks.length;
  const completedGuided = guidedTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
  const taskPercent = totalGuided > 0 ? Math.round((completedGuided / totalGuided) * 100) : 0;

  const hasIdentifier = coverage.primaryEmail || coverage.phone || coverage.username || coverage.domain;

  if (totalGuided === 0) {
    return {
      status: 'not_established',
      label: 'Baseline Not Established',
      description: 'Generate your guided plan to begin establishing your digital baseline.',
      taskPercent: 0,
      navigateTo: '/tasks',
      buttonLabel: 'Go to Tasks',
    };
  }

  if (taskPercent >= 70 && hasIdentifier) {
    return {
      status: 'established',
      label: 'Baseline Established',
      description: 'Your digital baseline is in place. Continue reviewing your governance posture to maintain it.',
      taskPercent,
      navigateTo: '/governance',
      buttonLabel: 'View Governance',
    };
  }

  return {
    status: 'in_progress',
    label: 'Baseline In Progress',
    description: 'Your digital baseline is being established. Continue completing guided tasks to strengthen your governance posture.',
    taskPercent,
    navigateTo: '/tasks',
    buttonLabel: 'Continue Tasks',
  };
}
