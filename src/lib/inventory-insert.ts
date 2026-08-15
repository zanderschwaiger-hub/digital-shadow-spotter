import { supabase } from '@/integrations/supabase/client';

/**
 * Inventory writes go through here so an insert can never fail silently.
 *
 * Two failure modes are handled:
 *  1. A hard error from the database (RLS denial, tier/limit trigger, duplicate).
 *  2. A "successful" insert that returns no row — which happens when the write
 *     policy allows the row but the read policy (tier gate) hides it. That used
 *     to look like success in the UI while nothing was visible to the user.
 */

export type InventoryTable =
  | 'inventory_emails'
  | 'inventory_phones'
  | 'inventory_usernames'
  | 'inventory_accounts'
  | 'inventory_domains';

export interface InventoryWriteResult {
  ok: boolean;
  /** Always set when ok === false. Safe to show to the user. */
  message?: string;
}

const LABELS: Record<InventoryTable, string> = {
  inventory_emails: 'email',
  inventory_phones: 'phone number',
  inventory_usernames: 'username',
  inventory_accounts: 'account',
  inventory_domains: 'domain',
};

export function describeInventoryError(
  table: InventoryTable,
  error: { code?: string; message?: string } | null,
): string {
  const label = LABELS[table];
  const message = error?.message ?? '';

  // Limit triggers raise a plain-language message already — pass it through.
  if (/maximum/i.test(message)) return message;

  if (error?.code === '23505' || /duplicate key/i.test(message)) {
    return `That ${label} is already on your list.`;
  }

  if (
    error?.code === '42501' ||
    error?.code === 'PGRST301' ||
    /row-level security|permission denied|violates row-level/i.test(message)
  ) {
    return `Your account isn't allowed to save this ${label} right now. If you're within your plan's limit, sign out and back in, then try again.`;
  }

  return message || `We couldn't save that ${label}. Please try again.`;
}

export async function insertInventoryRow<T extends Record<string, unknown>>(
  table: InventoryTable,
  row: T,
): Promise<InventoryWriteResult> {
  const { data, error } = await supabase
    .from(table as string)
    .insert([row] as never)
    .select('id');

  if (error) {
    return { ok: false, message: describeInventoryError(table, error) };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      message: `That ${LABELS[table]} didn't save. Your plan may not allow it yet — check your limits, then try again.`,
    };
  }

  return { ok: true };
}
