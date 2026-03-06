import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';

export type AgentActionType =
  | 'generate_plan'
  | 'task_status_change'
  | 'pillar_start';

export type AgentActionStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface AgentActionRequest {
  action_type: AgentActionType;
  target_type: 'task' | 'pillar' | 'plan';
  target_id?: string;
  proposed_payload: Record<string, string | number | boolean | null>;
}

export interface AgentActionResult {
  approved: boolean;
  reason: string;
  action_id?: string;
}

interface ValidationContext {
  userId: string;
  completedSourceIds: Set<string>;
  catalogDeps: Map<string, string[]>;
}

type RuleResult = { allowed: true } | { allowed: false; reason: string };

function checkDependency(request: AgentActionRequest, ctx: ValidationContext): RuleResult {
  if (request.action_type !== 'task_status_change') return { allowed: true };
  const newStatus = request.proposed_payload.new_status as string;
  if (newStatus !== 'in_progress' && newStatus !== 'done') return { allowed: true };

  const sourceId = request.proposed_payload.source_id as string | undefined;
  if (!sourceId) return { allowed: true };

  const deps = ctx.catalogDeps.get(sourceId);
  if (!deps || deps.length === 0) return { allowed: true };

  const unmet = deps.filter(d => !ctx.completedSourceIds.has(d));
  if (unmet.length > 0) {
    return { allowed: false, reason: `Blocked: prerequisite tasks not completed (${unmet.join(', ')})` };
  }
  return { allowed: true };
}

function checkSkip(request: AgentActionRequest): RuleResult {
  if (request.action_type !== 'task_status_change') return { allowed: true };
  const newStatus = request.proposed_payload.new_status as string;
  const currentStatus = request.proposed_payload.current_status as string;
  if (newStatus === 'done' && currentStatus === 'open') {
    return { allowed: false, reason: 'Blocked: task must be started before marking done' };
  }
  return { allowed: true };
}

export function useAgentEngine() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();

  const proposeAction = useCallback(
    async (
      request: AgentActionRequest,
      context: Omit<ValidationContext, 'userId'>,
    ): Promise<AgentActionResult> => {
      if (!user) return { approved: false, reason: 'Not authenticated' };

      const ctx: ValidationContext = { ...context, userId: user.id };

      // Run validation rules
      const rules = [checkDependency, checkSkip];
      for (const rule of rules) {
        const result = rule(request, ctx);
        if (!result.allowed) {
          const blockedReason = (result as { allowed: false; reason: string }).reason;
          // Log blocked action
          await supabase.from('agent_actions').insert([{
            user_id: user.id,
            action_type: request.action_type,
            target_type: request.target_type,
            target_id: request.target_id || null,
            proposed_payload: JSON.parse(JSON.stringify(request.proposed_payload)),
            status: 'blocked',
            reason: blockedReason,
            resolved_at: new Date().toISOString(),
          }]);

          await logEvent('agent_action_blocked', {
            action_type: request.action_type,
            target_id: request.target_id || '',
            reason: blockedReason,
          });

          return { approved: false, reason: blockedReason };
        }
      }

      // All rules passed — record as pending
      const { data } = await supabase
        .from('agent_actions')
        .insert([{
          user_id: user.id,
          action_type: request.action_type,
          target_type: request.target_type,
          target_id: request.target_id || null,
          proposed_payload: JSON.parse(JSON.stringify(request.proposed_payload)),
          status: 'pending',
        }])
        .select('id')
        .single();

      return {
        approved: true,
        reason: 'Validation passed',
        action_id: data?.id,
      };
    },
    [user, logEvent],
  );

  const confirmAction = useCallback(
    async (actionId: string) => {
      if (!user) return;

      await supabase
        .from('agent_actions')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', actionId);

      await logEvent('agent_action_approved', { action_id: actionId });
    },
    [user, logEvent],
  );

  const rejectAction = useCallback(
    async (actionId: string, reason: string) => {
      if (!user) return;

      await supabase
        .from('agent_actions')
        .update({ status: 'rejected', reason, resolved_at: new Date().toISOString() })
        .eq('id', actionId);

      await logEvent('agent_action_rejected', { action_id: actionId, reason });
    },
    [user, logEvent],
  );

  const getNextRecommendation = useCallback(
    (
      tasks: Array<{ title: string; status: string; source_id?: string | null; sequence_order?: number | null }>,
      completedSourceIds: Set<string>,
      catalogDeps: Map<string, string[]>,
    ): { title: string; source_id: string; reason: string } | null => {
      const sorted = [...tasks]
        .filter(t => t.status === 'open' && t.source_id)
        .sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

      for (const task of sorted) {
        const deps = catalogDeps.get(task.source_id!);
        if (!deps || deps.length === 0 || deps.every(d => completedSourceIds.has(d))) {
          return {
            title: task.title,
            source_id: task.source_id!,
            reason: 'This is the next unlocked task in your guided plan.',
          };
        }
      }
      return null;
    },
    [],
  );

  return { proposeAction, confirmAction, rejectAction, getNextRecommendation };
}
