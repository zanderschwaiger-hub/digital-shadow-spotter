import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, Clock, LogOut, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { calculateInventoryCompleteness, getExposureLevel, InventoryCounts } from '@/lib/types';

interface AlertData {
  severity: string;
}

interface TaskData {
  status: string;
}

export function EmbedStatusWidget() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exposureLevel, setExposureLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [taskStats, setTaskStats] = useState({ completed: 0, pending: 0 });

  useEffect(() => {
    if (user) {
      loadStatus();
    }
  }, [user]);

  const loadStatus = async () => {
    if (!user) return;
    
    try {
      // Fetch alerts using RPC pattern to avoid deep type issue
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('severity')
        .eq('user_id', user.id)
        .filter('dismissed', 'eq', false);
      
      if (alertsError) throw alertsError;
      const alerts: AlertData[] = alertsData || [];

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id);
        
      if (tasksError) throw tasksError;
      const tasks: TaskData[] = tasksData || [];

      // Fetch inventory counts
      const [emails, usernames, accounts, domains, phones] = await Promise.all([
        supabase.from('inventory_emails').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('inventory_usernames').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('inventory_accounts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('inventory_domains').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('inventory_phones').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const inventoryCounts: InventoryCounts = {
        emails: emails.count || 0,
        usernames: usernames.count || 0,
        accounts: accounts.count || 0,
        domains: domains.count || 0,
        phones: phones.count || 0,
      };

      const alertsCount = alerts.length;
      const highSeverityCount = alerts.filter(a => a.severity === 'high').length;
      const completeness = calculateInventoryCompleteness(inventoryCounts);
      
      const exposure = getExposureLevel(alertsCount, highSeverityCount, completeness);
      setExposureLevel(exposure.level);

      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      setTaskStats({ completed, pending });

    } catch (error) {
      console.error('Error loading status:', error);
    } finally {
      setLoading(false);
    }
  };

  const exposureConfig = {
    low: {
      icon: ShieldCheck,
      label: 'Low Exposure',
      bg: 'bg-[hsl(var(--severity-low))]',
      text: 'text-[hsl(var(--severity-low-foreground))]',
    },
    medium: {
      icon: Shield,
      label: 'Medium Exposure',
      bg: 'bg-[hsl(var(--severity-medium))]',
      text: 'text-[hsl(var(--severity-medium-foreground))]',
    },
    high: {
      icon: ShieldAlert,
      label: 'High Exposure',
      bg: 'bg-[hsl(var(--severity-high))]',
      text: 'text-[hsl(var(--severity-high-foreground))]',
    },
  };

  const { icon: ExposureIcon, label, bg, text } = exposureConfig[exposureLevel];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading status...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exposure Status */}
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bg)}>
          <ExposureIcon className={cn('h-5 w-5', text)} />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">Current exposure status</p>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
          <div>
            <p className="text-lg font-bold">{taskStats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
          <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
          <div>
            <p className="text-lg font-bold">{taskStats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild className="flex-1" size="sm">
          <a href="/dashboard" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Dashboard
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
