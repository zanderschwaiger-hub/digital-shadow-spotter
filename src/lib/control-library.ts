/**
 * CONTROL LIBRARY — Static Reference Data
 * 
 * All controls, questions, exposure types, and mappings are defined here
 * as TypeScript constants. No database tables needed for reference data.
 * 
 * Data model:
 * - Controls belong to Pillars (by pillar_id)
 * - Each control has questions (scored 0–3)
 * - Low control scores map to exposure types via mappings
 * - Exposures have severity (P0/P1/P2)
 */

import type { PLevel } from './governance-policies';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface Control {
  id: string;           // e.g. "P01-C01"
  pillar_id: string;    // matches governance_pillars.id
  name: string;
  description: string;
  weight: number;       // 1–10, used in scoring
  order: number;
}

export interface ControlQuestion {
  id: string;           // e.g. "P01-C01-Q01"
  control_id: string;
  text: string;
  help_text?: string;
  order: number;
}

/** 0 = No / Not sure, 1 = Partial, 2 = Mostly, 3 = Fully implemented */
export type ScoreValue = 0 | 1 | 2 | 3;

export const SCORE_LABELS: Record<ScoreValue, string> = {
  0: 'No / Not sure',
  1: 'Partial',
  2: 'Mostly',
  3: 'Fully implemented',
};

export interface ExposureType {
  id: string;           // e.g. "ACCOUNT_TAKEOVER"
  name: string;
  description: string;
  default_severity: PLevel;
  category: string;     // groups exposures in UI
}

export interface ExposureControlMapping {
  exposure_type_id: string;
  control_id: string;
  /** Score threshold — if control avg <= this, exposure is triggered */
  threshold: ScoreValue;
}

// ═══════════════════════════════════════════════════════════════
// CONTROLS (36 controls across 12 pillars)
// ═══════════════════════════════════════════════════════════════

export const CONTROLS: Control[] = [
  // P01 — Master Key Control
  { id: 'P01-C01', pillar_id: 'P01', name: 'Primary email governance', description: 'Primary email has strong, unique password and recovery options reviewed.', weight: 10, order: 1 },
  { id: 'P01-C02', pillar_id: 'P01', name: 'Recovery options audit', description: 'All recovery emails, phones, and backup codes are current and controlled.', weight: 8, order: 2 },
  { id: 'P01-C03', pillar_id: 'P01', name: 'App password review', description: 'Third-party apps with email access have been audited and limited.', weight: 6, order: 3 },

  // P02 — Credential System
  { id: 'P02-C01', pillar_id: 'P02', name: 'Password manager adoption', description: 'A dedicated password manager is installed and used for all accounts.', weight: 10, order: 1 },
  { id: 'P02-C02', pillar_id: 'P02', name: 'Password uniqueness', description: 'No password is reused across multiple services.', weight: 9, order: 2 },
  { id: 'P02-C03', pillar_id: 'P02', name: 'Credential rotation', description: 'Critical credentials are rotated on a defined schedule.', weight: 5, order: 3 },

  // P03 — MFA Standard
  { id: 'P03-C01', pillar_id: 'P03', name: 'MFA on critical accounts', description: 'MFA is enabled on all financial, email, and high-value accounts.', weight: 10, order: 1 },
  { id: 'P03-C02', pillar_id: 'P03', name: 'MFA method strength', description: 'Hardware keys or authenticator apps used instead of SMS where possible.', weight: 7, order: 2 },
  { id: 'P03-C03', pillar_id: 'P03', name: 'MFA backup codes', description: 'Backup codes are stored securely and accessible if primary MFA fails.', weight: 6, order: 3 },

  // P04 — Account Inventory
  { id: 'P04-C01', pillar_id: 'P04', name: 'Account catalog completeness', description: 'All active accounts are documented in the inventory.', weight: 9, order: 1 },
  { id: 'P04-C02', pillar_id: 'P04', name: 'Account categorization', description: 'Accounts are classified by importance and risk level.', weight: 5, order: 2 },
  { id: 'P04-C03', pillar_id: 'P04', name: 'Dormant account identification', description: 'Unused or forgotten accounts have been identified for review.', weight: 7, order: 3 },

  // P05 — Account Closure & Data Minimization
  { id: 'P05-C01', pillar_id: 'P05', name: 'Dormant account closure', description: 'Identified dormant accounts have been closed or deactivated.', weight: 8, order: 1 },
  { id: 'P05-C02', pillar_id: 'P05', name: 'Data deletion requests', description: 'Data deletion has been requested from closed services.', weight: 6, order: 2 },
  { id: 'P05-C03', pillar_id: 'P05', name: 'Account surface reduction', description: 'Total active accounts have been reduced to what is necessary.', weight: 7, order: 3 },

  // P06 — Connected Apps & Permissions
  { id: 'P06-C01', pillar_id: 'P06', name: 'OAuth permission audit', description: 'All OAuth/connected apps have been reviewed for excessive permissions.', weight: 9, order: 1 },
  { id: 'P06-C02', pillar_id: 'P06', name: 'Unused app revocation', description: 'Apps no longer in use have had their permissions revoked.', weight: 8, order: 2 },
  { id: 'P06-C03', pillar_id: 'P06', name: 'Permission scope review', description: 'Remaining apps use minimum required permissions.', weight: 6, order: 3 },

  // P07 — Breach Reality & Alerts
  { id: 'P07-C01', pillar_id: 'P07', name: 'Breach check completion', description: 'All emails/usernames have been checked against known breach databases.', weight: 10, order: 1 },
  { id: 'P07-C02', pillar_id: 'P07', name: 'Breach response actions', description: 'Credentials exposed in breaches have been changed.', weight: 9, order: 2 },
  { id: 'P07-C03', pillar_id: 'P07', name: 'Alert subscription', description: 'Breach notification services are configured for key identifiers.', weight: 5, order: 3 },

  // P08 — Session & Device Control
  { id: 'P08-C01', pillar_id: 'P08', name: 'Active session review', description: 'Active sessions on key accounts have been reviewed and unknown ones removed.', weight: 8, order: 1 },
  { id: 'P08-C02', pillar_id: 'P08', name: 'Device inventory', description: 'All devices with account access are documented.', weight: 6, order: 2 },
  { id: 'P08-C03', pillar_id: 'P08', name: 'Device lock enforcement', description: 'All devices use screen locks and are encrypted.', weight: 7, order: 3 },

  // P09 — Inbox & Cloud Hygiene
  { id: 'P09-C01', pillar_id: 'P09', name: 'Inbox forwarding audit', description: 'No unauthorized forwarding rules exist on email accounts.', weight: 9, order: 1 },
  { id: 'P09-C02', pillar_id: 'P09', name: 'Cloud sharing review', description: 'Shared files/folders in cloud storage have been reviewed.', weight: 6, order: 2 },
  { id: 'P09-C03', pillar_id: 'P09', name: 'Subscription cleanup', description: 'Unnecessary email subscriptions and notifications reduced.', weight: 4, order: 3 },

  // P10 — Personal Content & Social Footprint
  { id: 'P10-C01', pillar_id: 'P10', name: 'Social privacy settings', description: 'Privacy settings on social platforms have been reviewed and tightened.', weight: 7, order: 1 },
  { id: 'P10-C02', pillar_id: 'P10', name: 'Content audit', description: 'Old posts, photos, and tags have been reviewed for exposure.', weight: 5, order: 2 },
  { id: 'P10-C03', pillar_id: 'P10', name: 'Location data control', description: 'Location sharing and geotagging have been reviewed and limited.', weight: 6, order: 3 },

  // P11 — Public Footprint & Data Brokers
  { id: 'P11-C01', pillar_id: 'P11', name: 'Data broker inventory', description: 'Major data broker sites have been checked for listings.', weight: 8, order: 1 },
  { id: 'P11-C02', pillar_id: 'P11', name: 'Opt-out completion', description: 'Opt-out requests have been submitted to identified brokers.', weight: 7, order: 2 },
  { id: 'P11-C03', pillar_id: 'P11', name: 'Search result review', description: 'Self-search has been performed to identify public exposure.', weight: 5, order: 3 },

  // P12 — Governance Cadence & Containment Playbook
  { id: 'P12-C01', pillar_id: 'P12', name: 'Review cadence defined', description: 'A recurring schedule for governance reviews has been established.', weight: 8, order: 1 },
  { id: 'P12-C02', pillar_id: 'P12', name: 'Containment playbook', description: 'A step-by-step response plan exists for credential compromise.', weight: 7, order: 2 },
  { id: 'P12-C03', pillar_id: 'P12', name: 'Life event triggers defined', description: 'Life events that should trigger an out-of-cadence review are documented.', weight: 5, order: 3 },
];

// ═══════════════════════════════════════════════════════════════
// QUESTIONS (3 per control = 108 total)
// ═══════════════════════════════════════════════════════════════

export const CONTROL_QUESTIONS: ControlQuestion[] = [
  // P01-C01
  { id: 'P01-C01-Q01', control_id: 'P01-C01', text: 'Does your primary email use a strong, unique password (not reused anywhere)?', order: 1 },
  { id: 'P01-C01-Q02', control_id: 'P01-C01', text: 'Have you reviewed and updated your email recovery options in the last 6 months?', order: 2 },
  { id: 'P01-C01-Q03', control_id: 'P01-C01', text: 'Is your primary email\'s login activity regularly checked for unfamiliar access?', order: 3 },

  // P01-C02
  { id: 'P01-C02-Q01', control_id: 'P01-C02', text: 'Are all recovery email addresses current and under your control?', order: 1 },
  { id: 'P01-C02-Q02', control_id: 'P01-C02', text: 'Are recovery phone numbers current and not shared with others?', order: 2 },
  { id: 'P01-C02-Q03', control_id: 'P01-C02', text: 'Have backup codes been generated and stored securely?', order: 3 },

  // P01-C03
  { id: 'P01-C03-Q01', control_id: 'P01-C03', text: 'Have you reviewed which third-party apps have access to your email?', order: 1 },
  { id: 'P01-C03-Q02', control_id: 'P01-C03', text: 'Have unused or suspicious app connections been revoked?', order: 2 },
  { id: 'P01-C03-Q03', control_id: 'P01-C03', text: 'Do remaining apps use the minimum required permissions?', order: 3 },

  // P02-C01
  { id: 'P02-C01-Q01', control_id: 'P02-C01', text: 'Do you use a dedicated password manager (not browser-only)?', order: 1 },
  { id: 'P02-C01-Q02', control_id: 'P02-C01', text: 'Is the password manager installed on all your devices?', order: 2 },
  { id: 'P02-C01-Q03', control_id: 'P02-C01', text: 'Are new account credentials being saved to the password manager?', order: 3 },

  // P02-C02
  { id: 'P02-C02-Q01', control_id: 'P02-C02', text: 'Has a password audit been run to identify reused passwords?', order: 1 },
  { id: 'P02-C02-Q02', control_id: 'P02-C02', text: 'Have all reused passwords been changed to unique ones?', order: 2 },
  { id: 'P02-C02-Q03', control_id: 'P02-C02', text: 'Are passwords generated randomly (not based on patterns)?', order: 3 },

  // P02-C03
  { id: 'P02-C03-Q01', control_id: 'P02-C03', text: 'Do you have a schedule for rotating critical passwords?', order: 1 },
  { id: 'P02-C03-Q02', control_id: 'P02-C03', text: 'Have email and financial passwords been changed in the last year?', order: 2 },
  { id: 'P02-C03-Q03', control_id: 'P02-C03', text: 'Are rotation events logged in your governance file?', order: 3 },

  // P03-C01
  { id: 'P03-C01-Q01', control_id: 'P03-C01', text: 'Is MFA enabled on your primary email?', order: 1 },
  { id: 'P03-C01-Q02', control_id: 'P03-C01', text: 'Is MFA enabled on all financial accounts?', order: 2 },
  { id: 'P03-C01-Q03', control_id: 'P03-C01', text: 'Is MFA enabled on all social media accounts?', order: 3 },

  // P03-C02
  { id: 'P03-C02-Q01', control_id: 'P03-C02', text: 'Do you use an authenticator app or hardware key instead of SMS?', order: 1 },
  { id: 'P03-C02-Q02', control_id: 'P03-C02', text: 'Have you avoided SMS-only MFA on high-value accounts?', order: 2 },
  { id: 'P03-C02-Q03', control_id: 'P03-C02', text: 'Is your authenticator app backed up or synced across devices?', order: 3 },

  // P03-C03
  { id: 'P03-C03-Q01', control_id: 'P03-C03', text: 'Have you generated and saved MFA backup/recovery codes?', order: 1 },
  { id: 'P03-C03-Q02', control_id: 'P03-C03', text: 'Are backup codes stored separately from your primary device?', order: 2 },
  { id: 'P03-C03-Q03', control_id: 'P03-C03', text: 'Could you regain access to critical accounts if you lost your phone?', order: 3 },

  // P04-C01
  { id: 'P04-C01-Q01', control_id: 'P04-C01', text: 'Have you cataloged all active online accounts?', order: 1 },
  { id: 'P04-C01-Q02', control_id: 'P04-C01', text: 'Does your inventory include financial, social, email, and utility accounts?', order: 2 },
  { id: 'P04-C01-Q03', control_id: 'P04-C01', text: 'Is the inventory updated when new accounts are created?', order: 3 },

  // P04-C02
  { id: 'P04-C02-Q01', control_id: 'P04-C02', text: 'Are accounts categorized by importance (critical, standard, low)?', order: 1 },
  { id: 'P04-C02-Q02', control_id: 'P04-C02', text: 'Are financial accounts flagged as highest priority?', order: 2 },
  { id: 'P04-C02-Q03', control_id: 'P04-C02', text: 'Do categories inform which accounts get MFA and rotation first?', order: 3 },

  // P04-C03
  { id: 'P04-C03-Q01', control_id: 'P04-C03', text: 'Have you identified accounts you no longer use?', order: 1 },
  { id: 'P04-C03-Q02', control_id: 'P04-C03', text: 'Have you checked for accounts via password manager or email search?', order: 2 },
  { id: 'P04-C03-Q03', control_id: 'P04-C03', text: 'Is there a list of dormant accounts pending closure?', order: 3 },

  // P05-C01
  { id: 'P05-C01-Q01', control_id: 'P05-C01', text: 'Have dormant accounts been closed or deactivated?', order: 1 },
  { id: 'P05-C01-Q02', control_id: 'P05-C01', text: 'Was data exported before account closure where needed?', order: 2 },
  { id: 'P05-C01-Q03', control_id: 'P05-C01', text: 'Is the closure status tracked for each dormant account?', order: 3 },

  // P05-C02
  { id: 'P05-C02-Q01', control_id: 'P05-C02', text: 'Have data deletion requests been submitted to closed services?', order: 1 },
  { id: 'P05-C02-Q02', control_id: 'P05-C02', text: 'Are deletion request confirmations saved?', order: 2 },
  { id: 'P05-C02-Q03', control_id: 'P05-C02', text: 'Have you verified deletion by checking if data is still accessible?', order: 3 },

  // P05-C03
  { id: 'P05-C03-Q01', control_id: 'P05-C03', text: 'Has your total active account count been reduced?', order: 1 },
  { id: 'P05-C03-Q02', control_id: 'P05-C03', text: 'Are you avoiding creating unnecessary new accounts?', order: 2 },
  { id: 'P05-C03-Q03', control_id: 'P05-C03', text: 'Is account creation a conscious decision rather than habitual?', order: 3 },

  // P06-C01
  { id: 'P06-C01-Q01', control_id: 'P06-C01', text: 'Have you reviewed all OAuth/SSO connections on Google, Apple, Facebook, etc.?', order: 1 },
  { id: 'P06-C01-Q02', control_id: 'P06-C01', text: 'Do you know what data each connected app can access?', order: 2 },
  { id: 'P06-C01-Q03', control_id: 'P06-C01', text: 'Have you identified apps with excessive permissions?', order: 3 },

  // P06-C02
  { id: 'P06-C02-Q01', control_id: 'P06-C02', text: 'Have unused connected apps been revoked?', order: 1 },
  { id: 'P06-C02-Q02', control_id: 'P06-C02', text: 'Are revoked apps documented in your governance file?', order: 2 },
  { id: 'P06-C02-Q03', control_id: 'P06-C02', text: 'Is there a regular schedule for reviewing connected apps?', order: 3 },

  // P06-C03
  { id: 'P06-C03-Q01', control_id: 'P06-C03', text: 'Do remaining connected apps use minimum required permissions?', order: 1 },
  { id: 'P06-C03-Q02', control_id: 'P06-C03', text: 'Have you downgraded permission scopes where possible?', order: 2 },
  { id: 'P06-C03-Q03', control_id: 'P06-C03', text: 'Are permissions reviewed when apps request new access?', order: 3 },

  // P07-C01
  { id: 'P07-C01-Q01', control_id: 'P07-C01', text: 'Have all your email addresses been checked on haveibeenpwned.com or similar?', order: 1 },
  { id: 'P07-C01-Q02', control_id: 'P07-C01', text: 'Have all your usernames been checked for breach appearances?', order: 2 },
  { id: 'P07-C01-Q03', control_id: 'P07-C01', text: 'Have you documented the results of breach checks?', order: 3 },

  // P07-C02
  { id: 'P07-C02-Q01', control_id: 'P07-C02', text: 'Have passwords for breached accounts been changed?', order: 1 },
  { id: 'P07-C02-Q02', control_id: 'P07-C02', text: 'Have breached accounts been checked for unauthorized activity?', order: 2 },
  { id: 'P07-C02-Q03', control_id: 'P07-C02', text: 'Are breach response actions logged in your governance file?', order: 3 },

  // P07-C03
  { id: 'P07-C03-Q01', control_id: 'P07-C03', text: 'Are you subscribed to breach notification services?', order: 1 },
  { id: 'P07-C03-Q02', control_id: 'P07-C03', text: 'Are notifications configured for all your key email addresses?', order: 2 },
  { id: 'P07-C03-Q03', control_id: 'P07-C03', text: 'Do you know where breach notifications will arrive?', order: 3 },

  // P08-C01
  { id: 'P08-C01-Q01', control_id: 'P08-C01', text: 'Have you reviewed active sessions on email, social, and financial accounts?', order: 1 },
  { id: 'P08-C01-Q02', control_id: 'P08-C01', text: 'Have unknown or old sessions been terminated?', order: 2 },
  { id: 'P08-C01-Q03', control_id: 'P08-C01', text: 'Do you know how to check active sessions on your key accounts?', order: 3 },

  // P08-C02
  { id: 'P08-C02-Q01', control_id: 'P08-C02', text: 'Are all devices that access your accounts documented?', order: 1 },
  { id: 'P08-C02-Q02', control_id: 'P08-C02', text: 'Have old or lost devices been removed from account trust lists?', order: 2 },
  { id: 'P08-C02-Q03', control_id: 'P08-C02', text: 'Do you have a plan for device loss or theft?', order: 3 },

  // P08-C03
  { id: 'P08-C03-Q01', control_id: 'P08-C03', text: 'Do all your devices use screen locks (PIN, biometric, or password)?', order: 1 },
  { id: 'P08-C03-Q02', control_id: 'P08-C03', text: 'Is device encryption enabled on all devices?', order: 2 },
  { id: 'P08-C03-Q03', control_id: 'P08-C03', text: 'Are automatic updates enabled on all devices?', order: 3 },

  // P09-C01
  { id: 'P09-C01-Q01', control_id: 'P09-C01', text: 'Have you checked for unauthorized email forwarding rules?', order: 1 },
  { id: 'P09-C01-Q02', control_id: 'P09-C01', text: 'Have you reviewed email filters and labels for suspicious auto-actions?', order: 2 },
  { id: 'P09-C01-Q03', control_id: 'P09-C01', text: 'Is email forwarding disabled unless intentionally configured?', order: 3 },

  // P09-C02
  { id: 'P09-C02-Q01', control_id: 'P09-C02', text: 'Have you reviewed shared files and folders in cloud storage?', order: 1 },
  { id: 'P09-C02-Q02', control_id: 'P09-C02', text: 'Have outdated sharing links been revoked?', order: 2 },
  { id: 'P09-C02-Q03', control_id: 'P09-C02', text: 'Are cloud storage permissions reviewed on a schedule?', order: 3 },

  // P09-C03
  { id: 'P09-C03-Q01', control_id: 'P09-C03', text: 'Have you unsubscribed from unnecessary email lists?', order: 1 },
  { id: 'P09-C03-Q02', control_id: 'P09-C03', text: 'Have notification settings been reviewed on key services?', order: 2 },
  { id: 'P09-C03-Q03', control_id: 'P09-C03', text: 'Is your inbox manageable and not a source of missed alerts?', order: 3 },

  // P10-C01
  { id: 'P10-C01-Q01', control_id: 'P10-C01', text: 'Have privacy settings been reviewed on all social platforms?', order: 1 },
  { id: 'P10-C01-Q02', control_id: 'P10-C01', text: 'Are profiles set to the most restrictive visibility appropriate for you?', order: 2 },
  { id: 'P10-C01-Q03', control_id: 'P10-C01', text: 'Have you reviewed who can see your friends/connections lists?', order: 3 },

  // P10-C02
  { id: 'P10-C02-Q01', control_id: 'P10-C02', text: 'Have you reviewed old posts and photos for unintended exposure?', order: 1 },
  { id: 'P10-C02-Q02', control_id: 'P10-C02', text: 'Have old tags and mentions been reviewed and cleaned up?', order: 2 },
  { id: 'P10-C02-Q03', control_id: 'P10-C02', text: 'Are you aware of what public information exists about you on social media?', order: 3 },

  // P10-C03
  { id: 'P10-C03-Q01', control_id: 'P10-C03', text: 'Is location sharing disabled or limited to trusted contacts?', order: 1 },
  { id: 'P10-C03-Q02', control_id: 'P10-C03', text: 'Is geotagging disabled on photo uploads?', order: 2 },
  { id: 'P10-C03-Q03', control_id: 'P10-C03', text: 'Have location history settings been reviewed on Google/Apple?', order: 3 },

  // P11-C01
  { id: 'P11-C01-Q01', control_id: 'P11-C01', text: 'Have you checked major data broker sites for your listings?', order: 1 },
  { id: 'P11-C01-Q02', control_id: 'P11-C01', text: 'Do you know which brokers have your information?', order: 2 },
  { id: 'P11-C01-Q03', control_id: 'P11-C01', text: 'Is your data broker inventory up to date?', order: 3 },

  // P11-C02
  { id: 'P11-C02-Q01', control_id: 'P11-C02', text: 'Have opt-out requests been submitted to all identified brokers?', order: 1 },
  { id: 'P11-C02-Q02', control_id: 'P11-C02', text: 'Are opt-out request statuses tracked?', order: 2 },
  { id: 'P11-C02-Q03', control_id: 'P11-C02', text: 'Have confirmed removals been verified after the waiting period?', order: 3 },

  // P11-C03
  { id: 'P11-C03-Q01', control_id: 'P11-C03', text: 'Have you searched for your name, email, and phone on search engines?', order: 1 },
  { id: 'P11-C03-Q02', control_id: 'P11-C03', text: 'Have you documented what public information is discoverable?', order: 2 },
  { id: 'P11-C03-Q03', control_id: 'P11-C03', text: 'Are self-search results reviewed on a regular cadence?', order: 3 },

  // P12-C01
  { id: 'P12-C01-Q01', control_id: 'P12-C01', text: 'Have you established a recurring review schedule (weekly/monthly/quarterly)?', order: 1 },
  { id: 'P12-C01-Q02', control_id: 'P12-C01', text: 'Are review dates tracked and logged?', order: 2 },
  { id: 'P12-C01-Q03', control_id: 'P12-C01', text: 'Is the cadence reviewed periodically for effectiveness?', order: 3 },

  // P12-C02
  { id: 'P12-C02-Q01', control_id: 'P12-C02', text: 'Do you have a written containment plan for credential compromise?', order: 1 },
  { id: 'P12-C02-Q02', control_id: 'P12-C02', text: 'Does the plan include specific steps: isolate, rotate, verify, log?', order: 2 },
  { id: 'P12-C02-Q03', control_id: 'P12-C02', text: 'Has the containment plan been reviewed or rehearsed?', order: 3 },

  // P12-C03
  { id: 'P12-C03-Q01', control_id: 'P12-C03', text: 'Have you identified life events that should trigger an ad-hoc review?', order: 1 },
  { id: 'P12-C03-Q02', control_id: 'P12-C03', text: 'Are life event triggers documented and accessible?', order: 2 },
  { id: 'P12-C03-Q03', control_id: 'P12-C03', text: 'Do you know what actions to take for each trigger type?', order: 3 },
];

// ═══════════════════════════════════════════════════════════════
// EXPOSURE TYPES
// ═══════════════════════════════════════════════════════════════

export const EXPOSURE_TYPES: ExposureType[] = [
  { id: 'ACCOUNT_TAKEOVER', name: 'Account Takeover', description: 'Risk of unauthorized account access due to weak controls.', default_severity: 'P0', category: 'CONTROL' },
  { id: 'CREDENTIAL_REUSE', name: 'Credential Reuse', description: 'Passwords shared across services, amplifying breach impact.', default_severity: 'P0', category: 'CONTROL' },
  { id: 'MFA_GAP', name: 'MFA Gap', description: 'Critical accounts lack multi-factor authentication.', default_severity: 'P0', category: 'CONTROL' },
  { id: 'UNKNOWN_SURFACE', name: 'Unknown Surface Area', description: 'Active accounts exist that are not inventoried or governed.', default_severity: 'P1', category: 'COVERAGE' },
  { id: 'DORMANT_EXPOSURE', name: 'Dormant Account Exposure', description: 'Unused accounts remain open and ungoverned.', default_severity: 'P1', category: 'COVERAGE' },
  { id: 'PERMISSION_OVERREACH', name: 'Permission Overreach', description: 'Connected apps have excessive permissions.', default_severity: 'P1', category: 'COVERAGE' },
  { id: 'UNADDRESSED_BREACH', name: 'Unaddressed Breach', description: 'Known breach exposure without remediation.', default_severity: 'P0', category: 'DEFENSE' },
  { id: 'SESSION_EXPOSURE', name: 'Session Exposure', description: 'Unknown or stale sessions may exist on accounts.', default_severity: 'P1', category: 'DEFENSE' },
  { id: 'INBOX_COMPROMISE', name: 'Inbox Compromise Risk', description: 'Email forwarding or cloud sharing may be misconfigured.', default_severity: 'P1', category: 'DEFENSE' },
  { id: 'SOCIAL_EXPOSURE', name: 'Social Footprint Exposure', description: 'Personal data visible through social platforms.', default_severity: 'P2', category: 'MAINTENANCE' },
  { id: 'BROKER_LISTING', name: 'Data Broker Listing', description: 'Personal data available on data broker sites.', default_severity: 'P1', category: 'MAINTENANCE' },
  { id: 'GOVERNANCE_GAP', name: 'Governance Gap', description: 'No cadence or containment plan in place.', default_severity: 'P2', category: 'MAINTENANCE' },
];

// ═══════════════════════════════════════════════════════════════
// EXPOSURE-CONTROL MAPPINGS
// ═══════════════════════════════════════════════════════════════

export const EXPOSURE_CONTROL_MAPPINGS: ExposureControlMapping[] = [
  // ACCOUNT_TAKEOVER triggered by weak master key or recovery
  { exposure_type_id: 'ACCOUNT_TAKEOVER', control_id: 'P01-C01', threshold: 1 },
  { exposure_type_id: 'ACCOUNT_TAKEOVER', control_id: 'P01-C02', threshold: 1 },

  // CREDENTIAL_REUSE
  { exposure_type_id: 'CREDENTIAL_REUSE', control_id: 'P02-C01', threshold: 1 },
  { exposure_type_id: 'CREDENTIAL_REUSE', control_id: 'P02-C02', threshold: 1 },

  // MFA_GAP
  { exposure_type_id: 'MFA_GAP', control_id: 'P03-C01', threshold: 1 },
  { exposure_type_id: 'MFA_GAP', control_id: 'P03-C02', threshold: 1 },

  // UNKNOWN_SURFACE
  { exposure_type_id: 'UNKNOWN_SURFACE', control_id: 'P04-C01', threshold: 1 },
  { exposure_type_id: 'UNKNOWN_SURFACE', control_id: 'P04-C03', threshold: 1 },

  // DORMANT_EXPOSURE
  { exposure_type_id: 'DORMANT_EXPOSURE', control_id: 'P05-C01', threshold: 1 },
  { exposure_type_id: 'DORMANT_EXPOSURE', control_id: 'P05-C03', threshold: 1 },

  // PERMISSION_OVERREACH
  { exposure_type_id: 'PERMISSION_OVERREACH', control_id: 'P06-C01', threshold: 1 },
  { exposure_type_id: 'PERMISSION_OVERREACH', control_id: 'P06-C02', threshold: 1 },

  // UNADDRESSED_BREACH
  { exposure_type_id: 'UNADDRESSED_BREACH', control_id: 'P07-C01', threshold: 1 },
  { exposure_type_id: 'UNADDRESSED_BREACH', control_id: 'P07-C02', threshold: 1 },

  // SESSION_EXPOSURE
  { exposure_type_id: 'SESSION_EXPOSURE', control_id: 'P08-C01', threshold: 1 },
  { exposure_type_id: 'SESSION_EXPOSURE', control_id: 'P08-C02', threshold: 1 },

  // INBOX_COMPROMISE
  { exposure_type_id: 'INBOX_COMPROMISE', control_id: 'P09-C01', threshold: 1 },
  { exposure_type_id: 'INBOX_COMPROMISE', control_id: 'P09-C02', threshold: 1 },

  // SOCIAL_EXPOSURE
  { exposure_type_id: 'SOCIAL_EXPOSURE', control_id: 'P10-C01', threshold: 1 },
  { exposure_type_id: 'SOCIAL_EXPOSURE', control_id: 'P10-C02', threshold: 1 },

  // BROKER_LISTING
  { exposure_type_id: 'BROKER_LISTING', control_id: 'P11-C01', threshold: 1 },
  { exposure_type_id: 'BROKER_LISTING', control_id: 'P11-C02', threshold: 1 },

  // GOVERNANCE_GAP
  { exposure_type_id: 'GOVERNANCE_GAP', control_id: 'P12-C01', threshold: 1 },
  { exposure_type_id: 'GOVERNANCE_GAP', control_id: 'P12-C02', threshold: 1 },
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getControlsForPillar(pillarId: string): Control[] {
  return CONTROLS.filter(c => c.pillar_id === pillarId).sort((a, b) => a.order - b.order);
}

export function getQuestionsForControl(controlId: string): ControlQuestion[] {
  return CONTROL_QUESTIONS.filter(q => q.control_id === controlId).sort((a, b) => a.order - b.order);
}

export function getExposuresForCategory(category: string): ExposureType[] {
  return EXPOSURE_TYPES.filter(e => e.category === category);
}

export function getMappingsForControl(controlId: string): ExposureControlMapping[] {
  return EXPOSURE_CONTROL_MAPPINGS.filter(m => m.control_id === controlId);
}

export function getMappingsForExposure(exposureTypeId: string): ExposureControlMapping[] {
  return EXPOSURE_CONTROL_MAPPINGS.filter(m => m.exposure_type_id === exposureTypeId);
}

/** Pillar ID to readable layer name */
export function getPillarLayer(pillarId: string): string {
  const num = parseInt(pillarId.replace('P', ''), 10);
  if (num <= 3) return 'CONTROL';
  if (num <= 6) return 'COVERAGE';
  if (num <= 9) return 'DEFENSE';
  return 'MAINTENANCE';
}
