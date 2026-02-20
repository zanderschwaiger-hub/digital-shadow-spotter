import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  computeOverallScore, 
  computePillarScore,
  type OverallScore, 
  type PillarScore 
} from '@/lib/scoring-engine';
import { type ScoreValue } from '@/lib/control-library';
import type { Json } from '@/integrations/supabase/types';

type AnswersMap = Record<string, ScoreValue>;

export function useAssessment() {
  const { user } = useAuth();
  const [pillarAnswers, setPillarAnswers] = useState<Record<string, AnswersMap>>({});
  const [overallScore, setOverallScore] = useState<OverallScore | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnswers = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('user_pillar_progress')
      .select('pillar_id, answers_json, score, completed_at')
      .eq('user_id', user.id);

    if (!error && data) {
      const answers: Record<string, AnswersMap> = {};
      for (const row of data) {
        if (row.answers_json && typeof row.answers_json === 'object') {
          answers[row.pillar_id] = row.answers_json as unknown as AnswersMap;
        }
      }
      setPillarAnswers(answers);
      setOverallScore(computeOverallScore(answers));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAnswers();
  }, [loadAnswers]);

  const saveControlAnswers = async (
    pillarId: string, 
    questionAnswers: AnswersMap
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };

    // Merge with existing answers for this pillar
    const existing = pillarAnswers[pillarId] || {};
    const merged = { ...existing, ...questionAnswers };

    // Compute pillar score
    const pillarScore = computePillarScore(pillarId, merged);

    // Check if progress row exists
    const { data: existing_row } = await supabase
      .from('user_pillar_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('pillar_id', pillarId)
      .maybeSingle();

    let error;
    if (existing_row) {
      const { error: updateError } = await supabase
        .from('user_pillar_progress')
        .update({
          answers_json: merged as unknown as Json,
          score: pillarScore.weightedScore,
          completed_at: pillarScore.confidence === 100 ? new Date().toISOString() : null,
        })
        .eq('id', existing_row.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_pillar_progress')
        .insert({
          user_id: user.id,
          pillar_id: pillarId,
          answers_json: merged as unknown as Json,
          score: pillarScore.weightedScore,
          decision_log: [] as unknown as Json,
          completed_at: pillarScore.confidence === 100 ? new Date().toISOString() : null,
        });
      error = insertError;
    }

    if (!error) {
      // Log to audit
      await supabase.from('audit_log').insert({
        user_id: user.id,
        event_type: 'assessment_saved',
        payload_json: { 
          pillar_id: pillarId, 
          score: pillarScore.weightedScore,
          confidence: pillarScore.confidence,
        } as unknown as Json,
      });

      await loadAnswers();
    }

    return { error: error?.message || null };
  };

  const logDecision = async (
    exposureTypeId: string,
    action: 'mitigate' | 'defer' | 'accept',
    notes: string
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase.from('audit_log').insert({
      user_id: user.id,
      event_type: 'user_decision',
      payload_json: {
        exposure_type_id: exposureTypeId,
        action,
        notes,
        decided_at: new Date().toISOString(),
      } as unknown as Json,
    });

    return { error: error?.message || null };
  };

  const saveExposureSnapshot = async (): Promise<{ error: string | null }> => {
    if (!user || !overallScore) return { error: 'No score computed' };

    const snapshot = {
      score: overallScore.score,
      confidence: overallScore.confidence,
      exposures: overallScore.triggeredExposures.map(e => ({
        id: e.exposureType.id,
        severity: e.severity,
        triggering_controls: e.triggeringControls,
      })),
      captured_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('baseline_artifacts').upsert({
      user_id: user.id,
      artifact_type: 'risk_snapshot',
      content_json: snapshot as unknown as Json,
    }, { onConflict: 'user_id,artifact_type' });

    return { error: error?.message || null };
  };

  return {
    pillarAnswers,
    overallScore,
    loading,
    refresh: loadAnswers,
    saveControlAnswers,
    logDecision,
    saveExposureSnapshot,
  };
}
