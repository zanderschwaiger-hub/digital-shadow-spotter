/**
 * TIER-3 GOVERNANCE POLICY DEFINITIONS
 * 
 * This file contains canonical definitions for governance compliance.
 * These are POLICY DECLARATIONS ONLY — no UI, no automation, no scheduling.
 * 
 * CONSTRAINTS:
 * - Copy-only, read-only references
 * - No surveillance, no continuous observation, no background activity
 * - All checks are discrete, user-initiated, and time-boxed
 */

// ═══════════════════════════════════════════════════════════════
// 1. CANONICAL SEVERITY CLASSIFICATION (P-LEVEL SCHEMA)
// ═══════════════════════════════════════════════════════════════

/**
 * P-Level Classification
 * 
 * Every alert, finding, or log entry MUST map to exactly one P-level.
 * P-levels are labels, not actions. They carry no implied response
 * requirements and no auto-escalation logic.
 */
export type PLevel = 'P0' | 'P1' | 'P2';

export const P_LEVEL_DEFINITIONS: Record<PLevel, {
  label: string;
  definition: string;
  examples: string[];
}> = {
  P0: {
    label: 'P0 — Immediate exposure or safety risk',
    definition:
      'Active, confirmed exposure that puts identity, credentials, or safety at immediate risk. ' +
      'Requires user attention at their earliest opportunity.',
    examples: [
      'Confirmed credential appearing in an active breach',
      'Evidence of unauthorized account access',
      'Active domain spoofing targeting the user',
    ],
  },
  P1: {
    label: 'P1 — Action required, not urgent',
    definition:
      'A confirmed finding that requires a user-initiated action but does not represent ' +
      'an immediate threat. Can be addressed during the next scheduled review.',
    examples: [
      'Stale account with no MFA enabled',
      'Data broker listing confirmed but not yet acted on',
      'Password reuse detected across services',
    ],
  },
  P2: {
    label: 'P2 — Informational / awareness only',
    definition:
      'An observation logged for awareness. No action is required unless the user ' +
      'decides otherwise. Useful for trend tracking and future reference.',
    examples: [
      'A service the user uses announced a policy change',
      'A new data broker site was identified (no listing confirmed)',
      'A review cadence was completed with no findings',
    ],
  },
};

/**
 * Maps the existing severity system to the canonical P-level schema.
 * This provides a bridge between the current high/medium/low model
 * and the governance-required P0/P1/P2 classification.
 */
export function severityToPLevel(severity: 'high' | 'medium' | 'low'): PLevel {
  const map: Record<string, PLevel> = {
    high: 'P0',
    medium: 'P1',
    low: 'P2',
  };
  return map[severity] ?? 'P2';
}

// ═══════════════════════════════════════════════════════════════
// 2. GOVERNANCE FILE DEFINITION
// ═══════════════════════════════════════════════════════════════

/**
 * Governance File
 * 
 * A wrapper definition on top of the existing `baseline_artifacts` table.
 * The Governance File is an audit record, NOT a task system.
 * It does NOT replace or modify baseline_artifacts.
 * 
 * Each Governance File entry records:
 */
export interface GovernanceFileEntry {
  /** What was checked — a human-readable description of the review surface */
  what_checked: string;

  /** When it was checked — ISO 8601 timestamp of the review */
  when_checked: string;

  /** Under what cadence this check was performed */
  cadence: ReviewCadence;

  /** P-level classification of the finding */
  severity: PLevel;

  /** Result state — MUST include "none_found" as a valid outcome */
  result: GovernanceResult;

  /** Free-text summary of the finding or confirmation of absence */
  summary: string;
}

export type GovernanceResult =
  | 'finding_logged'    // An issue was discovered and recorded
  | 'none_found'        // Explicit confirmation: nothing found
  | 'action_taken'      // A mitigation step was completed
  | 'deferred';         // Finding acknowledged, action deferred to next cadence

/**
 * The Governance File artifact type identifier.
 * Used as `artifact_type` in the `baseline_artifacts` table.
 * The `content_json` field stores an array of GovernanceFileEntry[].
 */
export const GOVERNANCE_FILE_ARTIFACT_TYPE = 'governance_file';

// ═══════════════════════════════════════════════════════════════
// 3. CADENCE POLICY (DECLARATIONS ONLY)
// ═══════════════════════════════════════════════════════════════

/**
 * Review Cadence
 * 
 * Allowed cadence values. These are policy declarations only —
 * no schedulers, no triggers, no background processes.
 * 
 * Rules:
 * - Reviews are discrete events with a start and end
 * - No continuous or rolling checks
 * - Reviews expire when completed (a completed review is final)
 * - Each review produces a logged result
 */
export type ReviewCadence = 'weekly' | 'monthly' | 'quarterly';

export const CADENCE_DEFINITIONS: Record<ReviewCadence, {
  label: string;
  description: string;
  typical_surfaces: string[];
}> = {
  weekly: {
    label: 'Weekly Review',
    description:
      'A brief check of high-priority surfaces. Intended to catch ' +
      'time-sensitive changes since the last review.',
    typical_surfaces: [
      'Inbox for security notifications',
      'Password manager for flagged items',
      'Active breach alert status',
    ],
  },
  monthly: {
    label: 'Monthly Review',
    description:
      'A broader review of account hygiene and connected services. ' +
      'Covers surfaces that change less frequently.',
    typical_surfaces: [
      'Connected apps and OAuth permissions',
      'Account recovery settings',
      'Device and session list',
      'Data broker removal request status',
    ],
  },
  quarterly: {
    label: 'Quarterly Review',
    description:
      'A comprehensive governance review covering all pillars. ' +
      'Includes trend analysis and cadence adjustment.',
    typical_surfaces: [
      'Full pillar progress assessment',
      'Public footprint and reputation check',
      'Governance File export and backup',
      'Cadence effectiveness evaluation',
    ],
  },
};

/**
 * Life Event Triggers
 * 
 * These are policy-defined events that SHOULD prompt an out-of-cadence
 * review. They are labels only — no automated detection or scheduling.
 * The user declares when a life event has occurred.
 */
export const LIFE_EVENT_TRIGGERS = [
  'new_device',
  'job_change',
  'breach_notification',
  'relationship_change',
  'travel_or_relocation',
  'new_financial_account',
] as const;

export type LifeEventTrigger = typeof LIFE_EVENT_TRIGGERS[number];

export const LIFE_EVENT_DEFINITIONS: Record<LifeEventTrigger, string> = {
  new_device:
    'A new phone, laptop, or tablet has been set up. Review device permissions, ' +
    'logged-in sessions, and app installations.',
  job_change:
    'Starting or leaving a job. Review work-related accounts, SSO sessions, ' +
    'and any shared credentials or devices.',
  breach_notification:
    'A service you use has disclosed a data breach. Review affected credentials ' +
    'and check for unauthorized access.',
  relationship_change:
    'A significant relationship change. Review shared accounts, recovery contacts, ' +
    'and trusted devices.',
  travel_or_relocation:
    'Extended travel or relocation. Review location-based security settings, ' +
    'VPN configurations, and trusted networks.',
  new_financial_account:
    'A new bank, investment, or payment account opened. Review MFA settings, ' +
    'recovery options, and notification preferences.',
};

// ═══════════════════════════════════════════════════════════════
// 4. DISCOVERY TASK BOUNDARIES
// ═══════════════════════════════════════════════════════════════

/**
 * Discovery Task Definition
 * 
 * Every discovery task MUST be:
 * - Explicitly time-boxed (has a defined start and end)
 * - Produce a logged result
 * - Accept "none found" as a valid and required outcome
 * 
 * No discovery task may exist without a time boundary.
 * Discovery is NEVER repeated unless a new cadence cycle begins
 * or a life event trigger is declared by the user.
 * 
 * Discovery tasks are read-only, copy-only operations.
 * They direct the user to specific surfaces — the agent never
 * searches, accesses, or observes on behalf of the user.
 */
export interface DiscoveryTaskDefinition {
  /** Human-readable name of the discovery task */
  name: string;

  /** The surface the user is directed to (e.g., "Gmail search", "password manager audit") */
  surface: string;

  /** Maximum time allocated for this task in minutes */
  time_box_minutes: number;

  /** Instructions the user follows — copy-only, read-only */
  instructions: string;

  /** Whether "none found" is an acceptable logged outcome (always true) */
  none_found_valid: true;
}

/**
 * Constraints that govern all discovery operations.
 * These are absolute and non-negotiable.
 */
export const DISCOVERY_CONSTRAINTS = {
  /** The agent never searches on behalf of the user */
  agent_searches: false,

  /** The agent never accesses accounts or systems */
  agent_accesses: false,

  /** All discovery is user-initiated and user-executed */
  user_driven: true,

  /** Every discovery produces a logged result */
  requires_logged_result: true,

  /** "None found" is always a valid outcome */
  none_found_valid: true,

  /** No discovery without a time boundary */
  requires_time_box: true,

  /** No repeated discovery within the same cadence cycle */
  no_unnecessary_repetition: true,

  /** No surveillance language in any discovery context */
  surveillance_language_prohibited: true,

  /** No background or continuous observation */
  background_activity_prohibited: true,
} as const;

// ═══════════════════════════════════════════════════════════════
// 5. SYSTEM CONSTITUTION (NON-NEGOTIABLE CONSTRAINTS)
// ═══════════════════════════════════════════════════════════════

/**
 * System Constitution
 *
 * These constraints are absolute and override all other logic.
 * They define what the system IS and IS NOT.
 */
export const SYSTEM_CONSTITUTION = {
  /** Core identity */
  identity: {
    role: 'Governance guidance system',
    not: [
      'cleanup service',
      'security tool',
      'authority',
      'caretaker',
    ],
  },

  /** The system never requests or accepts these */
  never_request: [
    'account_logins',
    'screenshots_of_private_dashboards',
    'files_or_completed_forms',
    'personal_data_beyond_current_session',
    'passwords_pins_mfa_codes',
  ],

  /** Prohibited claims — never use these words in system output */
  prohibited_claims: [
    'security',
    'safety',
    'protection',
  ],

  /** Permitted language — use these instead */
  permitted_language: [
    'control',
    'reduced exposure',
    'governance',
    'improved clarity',
  ],

  /** Storage policy */
  storage: {
    stores_user_information: false,
    session_data_is_transient: true,
    sensitive_data_redacted_before_storage: true,
  },

  /** Authority boundaries */
  authority: {
    acts_as_legal_authority: false,
    acts_as_emergency_authority: false,
    acts_as_security_authority: false,
    on_failure_or_ambiguity: 'return control to user immediately',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 6. TIER BOUNDARIES (HARD FENCES)
// ═══════════════════════════════════════════════════════════════

/**
 * Tier Boundary Definitions
 *
 * Each tier has explicit purpose, rules, and output constraints.
 * Higher tiers may be referenced but never simulated or previewed.
 * If a user asks for something outside their current tier:
 *   → Explain the boundary
 *   → Stop
 */
export const TIER_BOUNDARIES = {
  tier_0: {
    name: 'Exposure Check',
    label: 'Free',
    purpose: ['Awareness', 'Mapping', 'Self-scoring'],
    rules: [
      'Education only',
      'No fixes',
      'No execution',
      'No completeness claims',
    ],
    output: [
      'Where exposure likely exists',
      'Why it matters',
      'Whether a next step is warranted',
    ],
  },
  tier_1: {
    name: 'Baseline + Priorities',
    purpose: ['Standards', 'Priority order', 'Governance cadence'],
    rules: [
      'No account access',
      'No cleanup',
      'No tools',
      'No step-by-step fixes',
    ],
  },
  tier_2_3: {
    name: 'Guided Cleanup / Governance Agent',
    rules: [
      'May be referenced',
      'Must never be simulated or previewed',
    ],
  },
  enforcement: 'If a user asks for something outside the current tier: explain the boundary, then stop.',
} as const;

// ═══════════════════════════════════════════════════════════════
// 7. PILLAR STRUCTURE (4-LAYER MODEL)
// ═══════════════════════════════════════════════════════════════

/**
 * The 12 Pillars, grouped into the 4-Layer Model.
 *
 * Rules:
 * - Pillars describe risk categories, not tasks.
 * - Never imply completeness.
 * - Visual or color cues are conceptual only.
 */
export const PILLAR_LAYERS = {
  CONTROL: {
    description: 'Foundational access and credential governance',
    pillars: [
      'Master Key Control',
      'Credential System',
      'MFA Standard',
    ],
  },
  COVERAGE: {
    description: 'Account inventory and surface area reduction',
    pillars: [
      'Account Inventory',
      'Account Closure & Data Minimization',
      'Connected Apps & Permissions',
    ],
  },
  DEFENSE: {
    description: 'Breach awareness and active session governance',
    pillars: [
      'Breach Reality & Alerts',
      'Session & Device Control',
      'Inbox & Cloud Hygiene',
    ],
  },
  MAINTENANCE: {
    description: 'Ongoing footprint governance and containment readiness',
    pillars: [
      'Personal Content & Social Footprint',
      'Public Footprint & Data Brokers',
      'Governance Cadence & Containment Playbook',
    ],
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 8. FEAR LANGUAGE POLICY
// ═══════════════════════════════════════════════════════════════

/**
 * Fear Language — Minimal, Calibrated
 *
 * Fear language is allowed ONLY to:
 * - Create attention
 * - Signal consequence
 * - Motivate movement
 *
 * Tone test:
 * - If it makes a calm adult feel rushed → reduce it
 * - If it makes a disengaged adult pause → correct
 */
export const FEAR_LANGUAGE_POLICY = {
  max_risk_statements_per_section: 1,

  permitted_phrases: [
    'Silent risk',
    'Exposure tends to compound over time',
    'What isn\'t governed slowly becomes unowned',
    'Most loss of control happens quietly, not suddenly',
  ],

  prohibited_phrases: [
    'Hackers are targeting you',
    'This could destroy your life',
    'If you don\'t act now',
    'Your data is at risk',
    'You are vulnerable',
  ],

  rules: [
    'At most one restrained risk statement per section',
    'Never stack fear language',
    'Never predict catastrophe',
    'Never shame or rush',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════
// 9. SCORING & UNCERTAINTY RULES
// ═══════════════════════════════════════════════════════════════

/**
 * Scoring Rules
 *
 * These govern how ambiguity is handled in assessments.
 */
export const SCORING_RULES = {
  /** "Not sure" always equals "No" for scoring purposes */
  not_sure_equals_no: true,

  /** Ambiguity must always be named explicitly */
  ambiguity_must_be_named: true,

  /** Never smooth over uncertainty */
  never_smooth_uncertainty: true,

  /** Never invent answers */
  never_invent_answers: true,

  /** Clarity beats reassurance */
  clarity_over_reassurance: true,
} as const;

// ═══════════════════════════════════════════════════════════════
// 10. PRIVACY HEADER (MANDATORY)
// ═══════════════════════════════════════════════════════════════

/**
 * Privacy Header
 *
 * MUST be displayed on any checklist, form, or self-assessment.
 */
export const PRIVACY_HEADER = {
  title: 'PRIVATE — DO NOT SHARE OR SUBMIT THIS FORM',
  lines: [
    'This form is for your personal use only.',
    'We will never request, collect, or accept this form.',
    'We do not encourage sharing it with anyone.',
    'If printed: destroy it securely when no longer needed.',
    'If saved digitally: store it with proper locks and access controls.',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════
// 11. DECISION COMPRESSION LOGIC
// ═══════════════════════════════════════════════════════════════

/**
 * Decision Compression
 *
 * The system reduces decisions, never expands them.
 * Every interaction MUST lead to exactly one of three outcomes.
 */
export const DECISION_COMPRESSION = {
  allowed_outcomes: [
    'stop',
    'proceed_to_tier_1',
    'intentionally_defer',
  ] as const,

  prohibited_patterns: [
    'Endless options',
    '"You could also…" loops',
    'Open-ended exploration',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════
// 12. SUCCESS CRITERIA
// ═══════════════════════════════════════════════════════════════

/**
 * Success Criteria
 *
 * The system is succeeding if and only if all of these hold.
 */
export const SUCCESS_CRITERIA = {
  succeeding: [
    'The user feels clearer, not overwhelmed',
    'The user understands where exposure likely lives',
    'The user knows the next responsible step',
    'The system exits cleanly without dependency',
  ],
  failing: [
    'The system creates reliance',
    'The system implies authority',
    'The system oversteps boundaries',
  ],
} as const;
