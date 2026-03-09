import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExposureCard } from '@/components/dashboard/ExposureCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { AlertsCard } from '@/components/dashboard/AlertsCard';
import { MasterKeyCard } from '@/components/dashboard/MasterKeyCard';
import { InventoryCompletenessCard } from '@/components/dashboard/InventoryCompletenessCard';
import { RecommendedActionCard } from '@/components/dashboard/RecommendedActionCard';
import { WelcomeModal } from '@/components/dashboard/WelcomeModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { 
  Task, 
  Alert, 
  InventoryCounts, 
  getExposureLevel, 
  calculateInventoryCompleteness 
} from '@/lib/types';

const WELCOME_SEEN_KEY = 'freedom-engine-welcome-seen';

export default function DashboardPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCounts>({
    emails: 0,
    usernames: 0,
    accounts: 0,
    domains: 0,
    phones: 0
  });
  const [primaryEmail, setPrimaryEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      
      // Check if this is first visit
      const hasSeenWelcome = localStorage.getItem(`${WELCOME_SEEN_KEY}-${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  const handleWelcomeClose = () => {
    if (user) {
      localStorage.setItem(`${WELCOME_SEEN_KEY}-${user.id}`, 'true');
      logEvent('welcome_tour_completed', {});
    }
    setShowWelcome(false);
  };

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        tasksRes,
        alertsRes,
        emailsRes,
        usernamesRes,
        accountsRes,
        domainsRes,
        phonesRes
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('priority', { ascending: false }),
        supabase.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('inventory_emails').select('*').eq('user_id', user.id),
        supabase.from('inventory_usernames').select('*').eq('user_id', user.id),
        supabase.from('inventory_accounts').select('*').eq('user_id', user.id),
        supabase.from('inventory_domains').select('*').eq('user_id', user.id),
        supabase.from('inventory_phones').select('*').eq('user_id', user.id)
      ]);

      if (tasksRes.data) setTasks(tasksRes.data as Task[]);
      if (alertsRes.data) setAlerts(alertsRes.data as Alert[]);
      
      const emails = emailsRes.data || [];
      const primary = emails.find(e => e.is_primary);
      if (primary) setPrimaryEmail(primary.email);

      setInventoryCounts({
        emails: emails.length,
        usernames: usernamesRes.data?.length || 0,
        accounts: accountsRes.data?.length || 0,
        domains: domainsRes.data?.length || 0,
        phones: phonesRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // All task mutations are governed through the Tasks page.
  // Dashboard is read-only for task state.

  const completeness = calculateInventoryCompleteness(inventoryCounts);
  const highSeverityCount = alerts.filter(a => a.severity === 'high' && !a.resolved_at).length;
  const unresolvedCount = alerts.filter(a => !a.resolved_at).length;
  const exposure = getExposureLevel(unresolvedCount, highSeverityCount, completeness);

  // Master key readiness is user-confirmed inside the card.


  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <WelcomeModal open={showWelcome} onClose={handleWelcomeClose} />
      
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your digital footprint at a glance</p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <ExposureCard level={exposure.level} reason={exposure.reason} />
          <InventoryCompletenessCard counts={inventoryCounts} />
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RecommendedActionCard />
          <TaskCard tasks={tasks} />
          <AlertsCard alerts={alerts} />
          <MasterKeyCard primaryEmail={primaryEmail} />
        </div>
      </div>
    </AppLayout>
  );
}