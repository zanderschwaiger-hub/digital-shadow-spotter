export type Severity = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'reminded';

export type BrokerStatus = 'not_started' | 'submitted' | 'pending' | 'confirmed' | 'failed';

export type SignalType = 
  | 'breach_alerts' 
  | 'password_exposure' 
  | 'data_broker_tracking' 
  | 'domain_spoofing' 
  | 'social_takeover' 
  | 'device_permissions';

export interface Profile {
  id: string;
  user_id: string;
  tier: string;
  tier_level: number;
  onboarding_completed: boolean;
  consent_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryEmail {
  id: string;
  user_id: string;
  email: string;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
}

export interface InventoryUsername {
  id: string;
  user_id: string;
  username: string;
  platform: string | null;
  notes: string | null;
  created_at: string;
}

export interface InventoryAccount {
  id: string;
  user_id: string;
  account_name: string;
  category: string;
  notes: string | null;
  created_at: string;
}

export interface InventoryDomain {
  id: string;
  user_id: string;
  domain: string;
  notes: string | null;
  created_at: string;
}

export interface InventoryPhone {
  id: string;
  user_id: string;
  phone: string;
  notes: string | null;
  created_at: string;
}

export interface SignalSetting {
  id: string;
  user_id: string;
  signal_type: SignalType;
  enabled: boolean;
  frequency: string;
  last_check_at: string | null;
  next_check_at: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  severity: Severity;
  title: string;
  details: string | null;
  source_type: string;
  read_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  steps_json: unknown;
  status: string;
  priority: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  source_type?: string | null;
  source_id?: string | null;
  sequence_order?: number | null;
}

export interface TaskCatalogItem {
  id: string;
  pillar_id: string;
  title: string;
  description: string;
  course_order: number;
  effort_minutes: number | null;
  blast_radius: string | null;
  dependency_task_ids: string[];
}

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  link?: string;
  completed: boolean;
}

export interface BrokerSite {
  id: string;
  user_id: string;
  site_name: string;
  url: string | null;
  date_submitted: string | null;
  status: BrokerStatus;
  notes: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  event_type: string;
  payload_json: Record<string, unknown>;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  sms_high_only: boolean;
  digest_frequency: string;
  created_at: string;
}

// Inventory completeness calculation
export interface InventoryCounts {
  emails: number;
  usernames: number;
  accounts: number;
  domains: number;
  phones: number;
}

export function calculateInventoryCompleteness(counts: InventoryCounts): number {
  const weights = {
    emails: 30,      // Most important
    accounts: 25,    // Key accounts
    usernames: 20,   // Social handles
    phones: 15,      // Optional but useful
    domains: 10      // Business owners
  };
  
  let score = 0;
  if (counts.emails >= 1) score += weights.emails;
  if (counts.accounts >= 3) score += weights.accounts;
  if (counts.usernames >= 1) score += weights.usernames;
  if (counts.phones >= 1) score += weights.phones;
  if (counts.domains >= 1) score += weights.domains;
  
  return score;
}

export function getExposureLevel(
  alertsCount: number, 
  highSeverityCount: number,
  inventoryCompleteness: number
): { level: 'low' | 'medium' | 'high'; reason: string } {
  if (highSeverityCount > 0) {
    return { 
      level: 'high', 
      reason: `${highSeverityCount} high-severity alert(s) require immediate attention` 
    };
  }
  
  if (alertsCount > 3 || inventoryCompleteness < 50) {
    return { 
      level: 'medium', 
      reason: inventoryCompleteness < 50 
        ? 'Your identity inventory is incomplete - add more data to improve review coverage'
        : `${alertsCount} alerts pending review`
    };
  }
  
  return { 
    level: 'low', 
    reason: 'Your digital footprint is well-maintained' 
  };
}