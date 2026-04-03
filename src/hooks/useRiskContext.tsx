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
  approveRisk: (riskId: string, notes?: string) => void;
  modifyRisk: (riskId: string, notes: string) => void;
  deferRisk: (riskId: string, notes?: string) => void;
  resolveRisk: (riskId: string, notes?: string) => void;
}

const RiskContext = createContext<RiskContextValue | null>(null);

export function RiskProvider({ children }: { children: ReactNode }) {
  const [risks, setRisks] = useState<PillarRisk[]>(SEED_RISKS);
  const [decisions, setDecisions] = useState<RiskDecisionEvent[]>([]);

  const recordDecision = useCallback((
    riskId: string,
    action: RiskDecisionEvent['action'],
    notes: string,
    newStatus: RiskStatus,
    newDecision: DecisionState,
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
        ? { ...r, status: newStatus, decision_state: newDecision, last_reviewed_at: now }
        : r
    ));
  }, []);

  const approveRisk = useCallback((riskId: string, notes = '') => {
    recordDecision(riskId, 'Approved', notes || 'Action approved.', 'Approved', 'Approved');
  }, [recordDecision]);

  const modifyRisk = useCallback((riskId: string, notes: string) => {
    recordDecision(riskId, 'Modified', notes, 'Needs Review', 'Modified');
  }, [recordDecision]);

  const deferRisk = useCallback((riskId: string, notes = '') => {
    recordDecision(riskId, 'Deferred', notes || 'Deferred to next review.', 'Deferred', 'Deferred');
  }, [recordDecision]);

  const resolveRisk = useCallback((riskId: string, notes = '') => {
    recordDecision(riskId, 'Resolved', notes || 'Resolved.', 'Resolved', 'Approved');
  }, [recordDecision]);

  return (
    <RiskContext.Provider value={{ risks, decisions, approveRisk, modifyRisk, deferRisk, resolveRisk }}>
      {children}
    </RiskContext.Provider>
  );
}

export function useRiskContext() {
  const ctx = useContext(RiskContext);
  if (!ctx) throw new Error('useRiskContext must be used within RiskProvider');
  return ctx;
}
