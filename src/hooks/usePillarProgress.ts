import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TOTAL_PILLARS } from '@/lib/pillars';

export interface PillarProgressRow {
  pillar_index: number;
  completed: boolean;
  completed_at: string | null;
}

export function usePillarProgress() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PillarProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('pillar_progress' as any)
      .select('pillar_index, completed, completed_at')
      .eq('user_id', user.id);
    setRows((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Lowest incomplete pillar (1..12). Returns 13 if all complete.
  const currentPillar = (() => {
    for (let i = 1; i <= TOTAL_PILLARS; i++) {
      const row = rows.find((r) => r.pillar_index === i);
      if (!row || !row.completed) return i;
    }
    return TOTAL_PILLARS + 1;
  })();

  const allComplete = currentPillar > TOTAL_PILLARS;

  const completePillar = async (index: number) => {
    if (!user) return;
    await supabase
      .from('pillar_progress' as any)
      .upsert(
        {
          user_id: user.id,
          pillar_index: index,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,pillar_index' }
      );
    await load();
  };

  return { rows, loading, currentPillar, allComplete, completePillar, reload: load };
}
