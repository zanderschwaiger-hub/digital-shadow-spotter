import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface GovernancePillar {
  id: string;
  name: string;
  description: string;
  pillar_order: number;
  minimum_tier: number;
  questions_json: unknown[];
  steps_json: unknown[];
}

export interface UserPillarProgress {
  id: string;
  pillar_id: string;
  score: number | null;
  answers_json: Record<string, unknown> | null;
  decision_log: unknown[] | null;
  completed_at: string | null;
}

export interface PillarWithProgress extends GovernancePillar {
  progress: UserPillarProgress | null;
  isAccessible: boolean;
}

export function useGovernance() {
  const { user, profile } = useAuth();
  const [pillars, setPillars] = useState<PillarWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tierLevel = profile?.tier_level ?? 3;

  const loadGovernanceData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all pillars (RLS will filter by tier)
      const { data: pillarsData, error: pillarsError } = await supabase
        .from('governance_pillars')
        .select('*')
        .order('pillar_order', { ascending: true });

      if (pillarsError) throw pillarsError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_pillar_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Map progress to pillars
      const progressMap = new Map(
        (progressData || []).map(p => [p.pillar_id, p])
      );

      const pillarsWithProgress: PillarWithProgress[] = (pillarsData || []).map(pillar => ({
        ...pillar,
        questions_json: pillar.questions_json as unknown[],
        steps_json: pillar.steps_json as unknown[],
        progress: progressMap.get(pillar.id) as UserPillarProgress | null ?? null,
        isAccessible: tierLevel >= pillar.minimum_tier,
      }));

      setPillars(pillarsWithProgress);
    } catch (err) {
      console.error('Error loading governance data:', err);
      setError('Failed to load governance data');
    } finally {
      setLoading(false);
    }
  }, [user, tierLevel]);

  useEffect(() => {
    loadGovernanceData();
  }, [loadGovernanceData]);

  const getNextActions = useCallback(() => {
    return pillars
      .filter(p => p.isAccessible && !p.progress?.completed_at)
      .slice(0, 3)
      .map(p => ({
        pillarId: p.id,
        pillarName: p.name,
        action: p.progress ? 'Continue assessment' : 'Start assessment',
        priority: p.pillar_order,
      }));
  }, [pillars]);

  const getOverallProgress = useCallback(() => {
    const accessible = pillars.filter(p => p.isAccessible);
    const completed = accessible.filter(p => p.progress?.completed_at);
    return {
      total: accessible.length,
      completed: completed.length,
      percentage: accessible.length > 0 
        ? Math.round((completed.length / accessible.length) * 100) 
        : 0,
    };
  }, [pillars]);

  const startPillar = async (pillarId: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('user_pillar_progress')
      .insert({
        user_id: user.id,
        pillar_id: pillarId,
        score: 0,
        answers_json: {},
        decision_log: [],
      });

    if (!error) {
      await loadGovernanceData();
    }

    return { error: error?.message || null };
  };

  return {
    pillars,
    loading,
    error,
    refresh: loadGovernanceData,
    getNextActions,
    getOverallProgress,
    startPillar,
    tierLevel,
  };
}
