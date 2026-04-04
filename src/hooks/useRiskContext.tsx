import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  PillarRisk,
  RiskDecisionEvent,
  SEED_RISKS,
  type DecisionState,
  type RiskStatus,
  type ExecutionState,
} from '@/lib/pillar-risks';

interface RiskContextValue {
  risks: PillarRisk[];
  decisions: RiskDecisionEvent[];
  lastSystemReviewAt: string | null;
  approveRisk: (riskId: string, notes?: string) => void;
  modifyRisk: (riskId: string, notes: string) => void;
  deferRisk: (riskId: string, notes?: string) => void;
  resolveRisk: (riskId: string, notes?: string) => void;
  startRisk: (riskId: string) => void;
  markRiskComplete: (riskId: string, notes?: string) => void;
}

const RiskContext = createContext<RiskContextValue | null>(null);

export function RiskProvider({ children }: { children: ReactNode }) {
  const [risks, setRisks] = useState<PillarRisk[]>(SEED_RISKS);
  const [decisions, setDecisions] = useState<RiskDecisionEvent[]>([]);
  const [lastSystemReviewAt, setLastSystemReviewAt] = useState<string | null>(null);

  const updateReviewTimestamp = useCallback(() => {
    setLastSystemReviewAt(new Date().toISOString());
  }, []);

  const recordDecision = useCallback((
    riskId: string,
    action: RiskDecisionEvent['action'],
    notes: string,
    newStatus: RiskStatus,
    newDecision: DecisionState,
    newExecution?: ExecutionState,
  ) => {
    const now = new Date().toISOString();

    setDecisions(prev => [{
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      risk_id: riskId,
      action,
      notes,
      timestamp: now,
    }, ...prev]);

    setRisks(prev => prev.map(r =>
      r.id === riskId
        ? {
            ...r,
            status: newStatus,
            decision_state: newDecision,
            last_reviewed_at: now,
            ...(newExecution !== undefined ? { execution_state: newExecution } : {}),
          }
        : r
    ));
  }, []);

  const approveRisk = useCallback((riskId: string, notes = '') => {
    recordDecision(riskId, 'Approved', notes || 'Action approved.', 'Approved', 'Approved', 'Not Started');
    updateReviewTimestamp();
  }, [recordDecision, updateReviewTimestamp]);

  const modifyRisk = useCallback((riskId: string, notes: string) => {
    recordDecision(riskId, 'Modified', notes, 'Needs Review', 'Modified');
  }, [recordDecision]);

  const deferRisk = useCallback((riskId: string, notes = '') => {
    recordDecision(riskId, 'Deferred', notes || 'Deferred to next review.', 'Deferred', 'Deferred');
  }, [recordDecision]);

  const resolveRisk = useCallback((riskId: string, notes = '') => {
    recordDecision(riskId, 'Resolved', notes || 'Resolved.', 'Resolved', 'Approved', 'Completed');
  }, [recordDecision]);

  const startRisk = useCallback((riskId: string) => {
    recordDecision(riskId, 'Started', 'Work started.', 'Approved', 'Approved', 'In Progress');
  }, [recordDecision]);

  const markRiskComplete = useCallback((riskId: string, notes = '') => {
    recordDecision(riskId, 'Completed', notes || 'Work completed.', 'Resolved', 'Approved', 'Completed');
    updateReviewTimestamp();
  }, [recordDecision, updateReviewTimestamp]);

  return (
    <RiskContext.Provider value={{ risks, decisions, lastSystemReviewAt, approveRisk, modifyRisk, deferRisk, resolveRisk, startRisk, markRiskComplete }}>
      {children}
    </RiskContext.Provider>
  );
}

export function useRiskContext() {
  const ctx = useContext(RiskContext);
  if (!ctx) throw new Error('useRiskContext must be used within RiskProvider');
  return ctx;
}
