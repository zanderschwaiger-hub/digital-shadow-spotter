/**
 * SCORING ENGINE — Deterministic, Client-Side Computation
 * 
 * Computes control scores, pillar scores, overall score, confidence,
 * and triggered exposures from user assessment answers.
 * 
 * All logic is deterministic. No AI, no randomness.
 * 
 * Data flow:
 *   answers_json (from user_pillar_progress) → control scores → pillar scores
 *   → overall score → triggered exposures
 * 
 * answers_json shape: { [questionId: string]: ScoreValue }
 */

import { 
  CONTROLS, 
  CONTROL_QUESTIONS, 
  EXPOSURE_TYPES, 
  EXPOSURE_CONTROL_MAPPINGS,
  type ScoreValue, 
  type ExposureType,
  type Control,
  getControlsForPillar,
  getQuestionsForControl,
} from './control-library';
import type { PLevel } from './governance-policies';

export interface ControlScore {
  controlId: string;
  controlName: string;
  score: number;       // 0–3 average
  maxScore: 3;
  answeredCount: number;
  totalQuestions: number;
  percentage: number;  // 0–100
}

export interface PillarScore {
  pillarId: string;
  controls: ControlScore[];
  weightedScore: number;  // 0–100
  confidence: number;     // 0–100 (based on % questions answered)
  answeredCount: number;
  totalQuestions: number;
}

export interface OverallScore {
  score: number;       // 0–100
  confidence: number;  // 0–100
  pillarScores: PillarScore[];
  triggeredExposures: TriggeredExposure[];
}

export interface TriggeredExposure {
  exposureType: ExposureType;
  triggeringControls: { controlId: string; controlName: string; score: number }[];
  severity: PLevel;
}

type AnswersMap = Record<string, ScoreValue>;

/**
 * Compute score for a single control based on question answers.
 */
export function computeControlScore(controlId: string, answers: AnswersMap): ControlScore {
  const control = CONTROLS.find(c => c.id === controlId);
  const questions = getQuestionsForControl(controlId);
  
  let sum = 0;
  let answered = 0;
  
  for (const q of questions) {
    const val = answers[q.id];
    if (val !== undefined && val !== null) {
      sum += val;
      answered++;
    }
    // "Not sure" = 0, already handled by ScoreValue
  }
  
  const avg = answered > 0 ? sum / answered : 0;
  
  return {
    controlId,
    controlName: control?.name ?? controlId,
    score: Math.round(avg * 100) / 100,
    maxScore: 3,
    answeredCount: answered,
    totalQuestions: questions.length,
    percentage: Math.round((avg / 3) * 100),
  };
}

/**
 * Compute score for a pillar (weighted average of its controls).
 */
export function computePillarScore(pillarId: string, answers: AnswersMap): PillarScore {
  const controls = getControlsForPillar(pillarId);
  const controlScores = controls.map(c => computeControlScore(c.id, answers));
  
  let totalWeight = 0;
  let weightedSum = 0;
  let totalAnswered = 0;
  let totalQuestions = 0;
  
  for (let i = 0; i < controls.length; i++) {
    const weight = controls[i].weight;
    totalWeight += weight;
    weightedSum += controlScores[i].percentage * weight;
    totalAnswered += controlScores[i].answeredCount;
    totalQuestions += controlScores[i].totalQuestions;
  }
  
  const weightedScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const confidence = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
  
  return {
    pillarId,
    controls: controlScores,
    weightedScore,
    confidence,
    answeredCount: totalAnswered,
    totalQuestions,
  };
}

/**
 * Compute triggered exposures based on control scores and mapping thresholds.
 */
export function computeTriggeredExposures(allAnswers: AnswersMap): TriggeredExposure[] {
  const controlScoreCache = new Map<string, number>();
  
  // Pre-compute all control scores
  for (const control of CONTROLS) {
    const cs = computeControlScore(control.id, allAnswers);
    controlScoreCache.set(control.id, cs.score);
  }
  
  // Group mappings by exposure type
  const exposureMap = new Map<string, { controlId: string; controlName: string; score: number }[]>();
  
  for (const mapping of EXPOSURE_CONTROL_MAPPINGS) {
    const controlScore = controlScoreCache.get(mapping.control_id) ?? 0;
    
    if (controlScore <= mapping.threshold) {
      const triggers = exposureMap.get(mapping.exposure_type_id) || [];
      const control = CONTROLS.find(c => c.id === mapping.control_id);
      triggers.push({
        controlId: mapping.control_id,
        controlName: control?.name ?? mapping.control_id,
        score: controlScore,
      });
      exposureMap.set(mapping.exposure_type_id, triggers);
    }
  }
  
  // Build triggered exposures
  const triggered: TriggeredExposure[] = [];
  
  for (const [exposureId, triggeringControls] of exposureMap) {
    const exposureType = EXPOSURE_TYPES.find(e => e.id === exposureId);
    if (!exposureType) continue;
    
    triggered.push({
      exposureType,
      triggeringControls,
      severity: exposureType.default_severity,
    });
  }
  
  // Sort by severity: P0 first
  const severityOrder: Record<PLevel, number> = { P0: 0, P1: 1, P2: 2 };
  triggered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  return triggered;
}

/**
 * Compute overall score across all pillars.
 * Takes a map of pillarId → answers_json from user_pillar_progress rows.
 */
export function computeOverallScore(
  pillarAnswers: Record<string, AnswersMap>
): OverallScore {
  // Get unique pillar IDs from controls
  const pillarIds = [...new Set(CONTROLS.map(c => c.pillar_id))];
  
  // Merge all answers for exposure computation
  const allAnswers: AnswersMap = {};
  for (const answers of Object.values(pillarAnswers)) {
    Object.assign(allAnswers, answers);
  }
  
  const pillarScores = pillarIds.map(pid => 
    computePillarScore(pid, pillarAnswers[pid] || {})
  );
  
  // Overall = average of pillar weighted scores (equal weight per pillar)
  const assessedPillars = pillarScores.filter(p => p.answeredCount > 0);
  const overallScore = assessedPillars.length > 0
    ? Math.round(assessedPillars.reduce((s, p) => s + p.weightedScore, 0) / assessedPillars.length)
    : 0;
  
  const overallConfidence = assessedPillars.length > 0
    ? Math.round(assessedPillars.reduce((s, p) => s + p.confidence, 0) / pillarIds.length)
    : 0;
  
  const triggeredExposures = computeTriggeredExposures(allAnswers);
  
  return {
    score: overallScore,
    confidence: overallConfidence,
    pillarScores,
    triggeredExposures,
  };
}
