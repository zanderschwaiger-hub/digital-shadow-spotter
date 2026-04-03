/**
 * PILLAR RISK MODEL — Client-Side Mock Data
 * 
 * Defines the PillarRisk type and seed data for the Governance Console.
 * This is a decision system, not automation.
 */

export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type RiskStatus = 'Needs Review' | 'Approved' | 'Deferred' | 'Resolved';
export type DecisionState = 'Pending' | 'Approved' | 'Modified' | 'Deferred';
export type ExecutionState = 'Not Started' | 'In Progress' | 'Completed';

export interface PillarRisk {
  id: string;
  pillar_id: number;
  pillar_name: string;
  risk_type: string;
  impact_level: ImpactLevel;
  confidence_score: number; // 0–1
  status: RiskStatus;
  why_flagged: string[];
  recommended_action: string;
  decision_state: DecisionState;
  execution_state: ExecutionState;
  created_at: string;
  last_reviewed_at: string | null;
}

export interface RiskDecisionEvent {
  id: string;
  risk_id: string;
  action: 'Approved' | 'Modified' | 'Deferred' | 'Resolved';
  notes: string;
  timestamp: string;
}

// ── Pillar Metadata ──────────────────────────────────────────

export const PILLAR_META: { id: number; name: string; description: string; category: GovernanceCategory }[] = [
  { id: 1,  name: 'Master Key Control',                             description: 'Governance of your primary email and recovery chain.',           category: 'Control' },
  { id: 2,  name: 'Credential System',                              description: 'Password management, uniqueness, and rotation discipline.',      category: 'Control' },
  { id: 3,  name: 'MFA Standard',                                   description: 'Multi-factor authentication coverage and method strength.',      category: 'Control' },
  { id: 4,  name: 'Account Inventory',                              description: 'Catalog of all active accounts and their classification.',       category: 'Coverage' },
  { id: 5,  name: 'Account Closure + Data Minimization',            description: 'Closing dormant accounts and reducing digital surface.',         category: 'Coverage' },
  { id: 6,  name: 'Breach Reality + Alerts',                        description: 'Breach awareness and credential exposure response.',             category: 'Defense' },
  { id: 7,  name: 'Session & Device Control',                       description: 'Session hygiene and device trust management.',                   category: 'Defense' },
  { id: 8,  name: 'Connected Apps & Permissions',                   description: 'OAuth and third-party app access governance.',                   category: 'Coverage' },
  { id: 9,  name: 'Inbox + Cloud Vault Hygiene',                    description: 'Email forwarding, cloud sharing, and subscription control.',     category: 'Defense' },
  { id: 10, name: 'Personal Content & Social Footprint',            description: 'Social media privacy and content exposure management.',          category: 'Maintenance' },
  { id: 11, name: 'Public Footprint / Data Brokers / Reputation',   description: 'Data broker listings, search results, and public exposure.',     category: 'Maintenance' },
  { id: 12, name: 'Governance Cadence + Containment Playbook',      description: 'Review schedules and incident response readiness.',              category: 'Maintenance' },
];

export type GovernanceCategory = 'Control' | 'Coverage' | 'Defense' | 'Maintenance';

export const CATEGORY_PILLARS: Record<GovernanceCategory, number[]> = {
  Control:     [1, 2, 3],
  Coverage:    [4, 5, 8],
  Defense:     [6, 7, 9],
  Maintenance: [10, 11, 12],
};

// ── Seed / Mock Risks ──────────────────────────────────────────

export const SEED_RISKS: PillarRisk[] = [
  {
    id: 'risk-001',
    pillar_id: 1,
    pillar_name: 'Master Key Control',
    risk_type: 'Single point of failure',
    impact_level: 'High',
    confidence_score: 0.91,
    status: 'Needs Review',
    why_flagged: [
      'Primary email is the sole recovery path for multiple critical accounts',
      'No alternative recovery method documented',
      'Recovery options have not been reviewed recently',
    ],
    recommended_action: 'Review and diversify recovery options for your primary email. Document backup codes and add an alternative recovery address.',
    decision_state: 'Pending',
    created_at: '2026-03-15T10:00:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-002',
    pillar_id: 2,
    pillar_name: 'Credential System',
    risk_type: 'Password reuse detected',
    impact_level: 'High',
    confidence_score: 0.87,
    status: 'Needs Review',
    why_flagged: [
      'Password reuse likely across key accounts based on assessment responses',
      'No password manager adoption confirmed',
      'Credential rotation has not been performed recently',
    ],
    recommended_action: 'Adopt a dedicated password manager and generate unique passwords for all critical accounts. Begin with financial and email accounts.',
    decision_state: 'Pending',
    created_at: '2026-03-16T08:30:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-003',
    pillar_id: 3,
    pillar_name: 'MFA Standard',
    risk_type: 'SMS-only MFA on critical accounts',
    impact_level: 'Medium',
    confidence_score: 0.78,
    status: 'Needs Review',
    why_flagged: [
      'MFA relies on SMS which is subject to SIM swap exposure',
      'No authenticator app or hardware key in use',
    ],
    recommended_action: 'Upgrade MFA on critical accounts from SMS to authenticator app or hardware security key.',
    decision_state: 'Pending',
    created_at: '2026-03-17T14:00:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-004',
    pillar_id: 4,
    pillar_name: 'Account Inventory',
    risk_type: 'Incomplete account catalog',
    impact_level: 'Medium',
    confidence_score: 0.72,
    status: 'Needs Review',
    why_flagged: [
      'Account inventory does not cover all categories',
      'Dormant accounts have not been identified',
    ],
    recommended_action: 'Complete a full account audit using your password manager export and email search history.',
    decision_state: 'Pending',
    created_at: '2026-03-18T09:00:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-005',
    pillar_id: 8,
    pillar_name: 'Connected Apps & Permissions',
    risk_type: 'Excessive third-party access',
    impact_level: 'Medium',
    confidence_score: 0.76,
    status: 'Needs Review',
    why_flagged: [
      'Too many connected apps with unclear access scope',
      'No recent review of OAuth permissions',
      'Unused apps still have active permissions',
    ],
    recommended_action: 'Review all OAuth connections on Google, Apple, and social accounts. Revoke unused apps and downgrade permissions where possible.',
    decision_state: 'Pending',
    created_at: '2026-03-19T11:00:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-006',
    pillar_id: 6,
    pillar_name: 'Breach Reality + Alerts',
    risk_type: 'Unresolved breach exposure',
    impact_level: 'High',
    confidence_score: 0.83,
    status: 'Needs Review',
    why_flagged: [
      'Breach check results indicate exposed credentials',
      'Passwords for breached accounts may not have been changed',
    ],
    recommended_action: 'Change passwords on all accounts identified in breach databases. Enable breach notification subscriptions for key emails.',
    decision_state: 'Pending',
    created_at: '2026-03-20T07:45:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-007',
    pillar_id: 11,
    pillar_name: 'Public Footprint / Data Brokers / Reputation',
    risk_type: 'Data broker listings',
    impact_level: 'Low',
    confidence_score: 0.65,
    status: 'Needs Review',
    why_flagged: [
      'Data broker opt-out requests have not been submitted',
      'Self-search for public exposure has not been performed',
    ],
    recommended_action: 'Perform a self-search and check major data broker sites. Submit opt-out requests where listings are found.',
    decision_state: 'Pending',
    created_at: '2026-03-21T16:00:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-008',
    pillar_id: 12,
    pillar_name: 'Governance Cadence + Containment Playbook',
    risk_type: 'No review cadence established',
    impact_level: 'Medium',
    confidence_score: 0.70,
    status: 'Needs Review',
    why_flagged: [
      'No recurring governance review schedule defined',
      'No containment playbook documented',
    ],
    recommended_action: 'Establish a monthly governance review cadence and document a basic containment playbook for credential compromise.',
    decision_state: 'Pending',
    created_at: '2026-03-22T12:00:00Z',
    last_reviewed_at: null,
  },
  {
    id: 'risk-009',
    pillar_id: 7,
    pillar_name: 'Session & Device Control',
    risk_type: 'Unknown active sessions',
    impact_level: 'Medium',
    confidence_score: 0.74,
    status: 'Needs Review',
    why_flagged: [
      'Active sessions on key accounts have not been reviewed',
      'Old or unknown devices may still have account access',
    ],
    recommended_action: 'Review active sessions on email, social, and financial accounts. Remove unfamiliar sessions and devices.',
    decision_state: 'Pending',
    created_at: '2026-03-23T09:30:00Z',
    last_reviewed_at: null,
  },
];

// ── Helpers ──────────────────────────────────────────

export function getPillarName(pillarId: number): string {
  return PILLAR_META.find(p => p.id === pillarId)?.name ?? `Pillar ${pillarId}`;
}

export function getCategoryStatus(risks: PillarRisk[], category: GovernanceCategory): {
  activeCount: number;
  highestImpact: ImpactLevel | null;
  label: 'Stable' | 'Needs Review' | 'High Priority';
} {
  const pillarIds = CATEGORY_PILLARS[category];
  const categoryRisks = risks.filter(r => pillarIds.includes(r.pillar_id) && r.status !== 'Resolved');

  if (categoryRisks.length === 0) {
    return { activeCount: 0, highestImpact: null, label: 'Stable' };
  }

  const impactOrder: ImpactLevel[] = ['High', 'Medium', 'Low'];
  const highestImpact = impactOrder.find(level =>
    categoryRisks.some(r => r.impact_level === level)
  ) ?? 'Low';

  const hasHigh = categoryRisks.some(r => r.impact_level === 'High');

  return {
    activeCount: categoryRisks.length,
    highestImpact,
    label: hasHigh ? 'High Priority' : 'Needs Review',
  };
}

export function getTopRisks(risks: PillarRisk[], count = 3): PillarRisk[] {
  const impactWeight: Record<ImpactLevel, number> = { High: 3, Medium: 2, Low: 1 };
  return [...risks]
    .filter(r => r.status !== 'Resolved')
    .sort((a, b) => {
      const impactDiff = impactWeight[b.impact_level] - impactWeight[a.impact_level];
      if (impactDiff !== 0) return impactDiff;
      return b.confidence_score - a.confidence_score;
    })
    .slice(0, count);
}

export function getDecisionSummary(risks: PillarRisk[]): {
  pending: number;
  resolvedThisMonth: number;
  highPriority: number;
} {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return {
    pending: risks.filter(r => r.decision_state === 'Pending').length,
    resolvedThisMonth: risks.filter(r => r.status === 'Resolved' && r.last_reviewed_at && r.last_reviewed_at >= monthStart).length,
    highPriority: risks.filter(r => r.impact_level === 'High' && r.status !== 'Resolved').length,
  };
}
