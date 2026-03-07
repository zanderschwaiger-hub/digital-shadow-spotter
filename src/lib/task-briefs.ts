import { TaskCatalogItem } from '@/lib/types';

/**
 * Deterministic Task Brief Generator
 * 
 * Produces structured, governance-first briefs from catalog metadata.
 * No AI, no randomness, no motivational filler.
 * Every field is derived from task_catalog + pillar context.
 */

export interface TaskBrief {
  title: string;
  whyItMatters: string;
  whatItProtects: string;
  estimatedEffort: string;
  prerequisites: string[];
  whatToPrepare: string[];
  successCondition: string;
  commonMistake: string;
}

export interface LockedBrief {
  reason: string;
  blockedBy: string[];
}

// ── Pillar protection domains ──────────────────────────────────

const PILLAR_PROTECTION: Record<string, { domain: string; risk: string }> = {
  'master-key-control': {
    domain: 'Primary email account security',
    risk: 'Compromise of your master email enables cascading account takeover across all linked services.',
  },
  'credential-system': {
    domain: 'Password and credential integrity',
    risk: 'Weak or reused credentials are the #1 vector for account compromise.',
  },
  'mfa-standard': {
    domain: 'Multi-factor authentication coverage',
    risk: 'Accounts without MFA can be accessed with only a stolen password.',
  },
  'account-inventory': {
    domain: 'Complete identity asset visibility',
    risk: 'Unknown accounts create unmonitored attack surface.',
  },
  'account-closure': {
    domain: 'Attack surface reduction',
    risk: 'Dormant accounts with stored data are easy targets for breach and impersonation.',
  },
  'breach-reality': {
    domain: 'Breach awareness and response readiness',
    risk: 'Undetected breaches allow attackers prolonged access to your data.',
  },
  'session-device-control': {
    domain: 'Active session and device trust',
    risk: 'Unmanaged sessions on old devices leave persistent access to your accounts.',
  },
  'connected-apps': {
    domain: 'Third-party integration permissions',
    risk: 'Over-permissioned connected apps can read, modify, or exfiltrate your data.',
  },
  'inbox-cloud-hygiene': {
    domain: 'Email and cloud storage security',
    risk: 'Sensitive data in unprotected inboxes and cloud drives is a high-value target.',
  },
  'personal-content': {
    domain: 'Personal content and social footprint exposure',
    risk: 'Public or semi-public personal content enables social engineering and identity reconstruction.',
  },
  'public-footprint': {
    domain: 'Public data exposure via brokers and search',
    risk: 'Data brokers aggregate and sell personal information, enabling targeting and fraud.',
  },
  'governance-cadence': {
    domain: 'Ongoing governance and containment discipline',
    risk: 'Without regular review cycles, security posture degrades over time.',
  },
};

// ── Blast radius context ───────────────────────────────────────

const BLAST_RADIUS_CONTEXT: Record<string, string> = {
  high: 'Failure to complete this task leaves a wide impact zone — multiple accounts or identity vectors are affected.',
  medium: 'This task affects a moderate scope of your digital footprint.',
  low: 'This task has a narrow, contained impact area.',
};

// ── Pillar-specific preparation guidance ───────────────────────

const PILLAR_PREPARATION: Record<string, string[]> = {
  'master-key-control': [
    'Access to your primary email account settings',
    'Your current recovery email and phone number',
    'A FIDO2 security key or authenticator app ready',
  ],
  'credential-system': [
    'Access to your password manager (or plan to set one up)',
    'List of accounts you access most frequently',
  ],
  'mfa-standard': [
    'An authenticator app installed on your phone',
    'A FIDO2 security key if available',
    'Access to each account\'s security settings',
  ],
  'account-inventory': [
    'Your email inbox open to search for account registration emails',
    'A browser with your saved passwords accessible',
  ],
  'account-closure': [
    'Your completed account inventory',
    'Access to accounts you plan to close',
    'Time to submit deletion requests (some require verification)',
  ],
  'breach-reality': [
    'Your primary email addresses',
    'Access to haveibeenpwned.com or similar services',
  ],
  'session-device-control': [
    'Access to security settings of your major accounts (Google, Apple, Microsoft)',
    'Physical access to trusted devices',
  ],
  'connected-apps': [
    'Access to your Google, Microsoft, and social account permission settings',
    'List of apps and services you actively use',
  ],
  'inbox-cloud-hygiene': [
    'Access to your email and cloud storage accounts',
    'Time to review stored files and emails',
  ],
  'personal-content': [
    'Access to your social media accounts',
    'Privacy settings pages for each platform',
  ],
  'public-footprint': [
    'Your full legal name and known aliases',
    'Previous addresses if applicable',
    'Time to submit opt-out requests (15-30 min per broker)',
  ],
  'governance-cadence': [
    'Calendar access to schedule recurring reviews',
    'Completed progress on prior pillars',
  ],
};

// ── Pillar-specific common mistakes ────────────────────────────

const PILLAR_MISTAKES: Record<string, string> = {
  'master-key-control': 'Using SMS-based 2FA instead of an authenticator app or security key. SMS can be SIM-swapped.',
  'credential-system': 'Storing the password manager master password in a browser or notes app. This creates a single point of failure.',
  'mfa-standard': 'Enabling MFA on secondary accounts but not on the primary email that controls password resets.',
  'account-inventory': 'Only listing accounts you actively use. Dormant accounts are the highest-risk targets.',
  'account-closure': 'Deleting the account without first downloading your data or revoking connected app permissions.',
  'breach-reality': 'Checking for breaches once and assuming you\'re clear. New breaches are disclosed continuously.',
  'session-device-control': 'Signing out of sessions without also revoking app-specific passwords or API tokens.',
  'connected-apps': 'Revoking a connected app without checking if it controls critical functionality (e.g., calendar sync, backup).',
  'inbox-cloud-hygiene': 'Bulk-deleting emails without checking for accounts tied to those email addresses.',
  'personal-content': 'Making profiles private without reviewing what\'s already been cached or archived publicly.',
  'public-footprint': 'Submitting opt-out requests without documenting them. If you can\'t prove you submitted, you can\'t follow up.',
  'governance-cadence': 'Setting review intervals too far apart. Monthly is the minimum for meaningful governance.',
};

// ── Brief generator ────────────────────────────────────────────

export function generateTaskBrief(
  catalogItem: TaskCatalogItem,
  catalogMap: Map<string, TaskCatalogItem>,
): TaskBrief {
  const pillarId = catalogItem.pillar_id || 'master-key-control';
  const protection = PILLAR_PROTECTION[pillarId] || PILLAR_PROTECTION['master-key-control'];
  const blastContext = BLAST_RADIUS_CONTEXT[catalogItem.blast_radius || 'medium'] || BLAST_RADIUS_CONTEXT.medium;

  // Prerequisites — resolve dependency names
  const prereqs: string[] = (catalogItem.dependency_task_ids || []).map(depId => {
    const dep = catalogMap.get(depId);
    return dep ? dep.title : depId;
  });

  // Effort
  const effort = catalogItem.effort_minutes
    ? `${catalogItem.effort_minutes} minutes`
    : '15–30 minutes (estimated)';

  // Preparation
  const preparation = PILLAR_PREPARATION[pillarId] || ['Access to relevant account settings'];

  // Success condition — derived from task description
  const successCondition = deriveSuccessCondition(catalogItem);

  // Common mistake
  const mistake = PILLAR_MISTAKES[pillarId] || 'Skipping this task because it feels low priority. Every gap in governance is a potential entry point.';

  return {
    title: catalogItem.title,
    whyItMatters: `${protection.risk} ${blastContext}`,
    whatItProtects: protection.domain,
    estimatedEffort: effort,
    prerequisites: prereqs.length > 0 ? prereqs : ['None — this task can be started immediately.'],
    whatToPrepare: preparation,
    successCondition,
    commonMistake: mistake,
  };
}

function deriveSuccessCondition(item: TaskCatalogItem): string {
  const desc = item.description.toLowerCase();

  // Pattern-match against common task verbs to produce a concrete condition
  if (desc.includes('enable') || desc.includes('turn on') || desc.includes('activate')) {
    return `The feature or setting described in "${item.title}" is confirmed enabled in your account security settings.`;
  }
  if (desc.includes('review') || desc.includes('audit') || desc.includes('check')) {
    return `You have reviewed every item in scope and documented your findings or taken corrective action.`;
  }
  if (desc.includes('remove') || desc.includes('revoke') || desc.includes('delete') || desc.includes('close')) {
    return `The target item has been removed, revoked, or confirmed deleted. Verification screenshot or confirmation email saved.`;
  }
  if (desc.includes('create') || desc.includes('set up') || desc.includes('install') || desc.includes('configure')) {
    return `The system, tool, or configuration described is fully set up and verified working.`;
  }
  if (desc.includes('document') || desc.includes('record') || desc.includes('log') || desc.includes('list')) {
    return `A complete, dated record has been created and stored in your governance file.`;
  }
  if (desc.includes('update') || desc.includes('change') || desc.includes('rotate')) {
    return `The credential, setting, or information has been updated and the old value is no longer valid.`;
  }
  if (desc.includes('schedule') || desc.includes('calendar') || desc.includes('recurring')) {
    return `A recurring calendar event or reminder has been created and confirmed on your schedule.`;
  }

  // Default — still deterministic
  return `The action described in "${item.title}" is fully completed, verified, and no follow-up is required.`;
}

// ── Locked brief generator ─────────────────────────────────────

export function generateLockedBrief(
  catalogItem: TaskCatalogItem,
  catalogMap: Map<string, TaskCatalogItem>,
  completedSourceIds: Set<string>,
): LockedBrief {
  const deps = catalogItem.dependency_task_ids || [];
  const unmet = deps.filter(d => !completedSourceIds.has(d));

  const blockedBy = unmet.map(depId => {
    const dep = catalogMap.get(depId);
    return dep ? dep.title : depId;
  });

  return {
    reason: `This task requires ${unmet.length} prerequisite${unmet.length === 1 ? '' : 's'} to be completed first. Tasks are sequenced to ensure each action builds on a secure foundation.`,
    blockedBy,
  };
}
