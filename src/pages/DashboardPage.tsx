import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExposureCard } from '@/components/dashboard/ExposureCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { AlertsCard } from '@/components/dashboard/AlertsCard';
import { MasterKeyCard } from '@/components/dashboard/MasterKeyCard';
import { IdentifierCoverageCard } from '@/components/dashboard/IdentifierCoverageCard';
import { RecommendedActionCard } from '@/components/dashboard/RecommendedActionCard';
import { WelcomeModal } from '@/components/dashboard/WelcomeModal';
import { ContainmentCard } from '@/components/dashboard/ContainmentCard';
import { DigitalBaselineCard } from '@/components/dashboard/DigitalBaselineCard';
import { calculateBaseline } from '@/lib/baseline-status';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { 
  Task, 
  Alert, 
  IdentifierCoverage,
  buildIdentifierCoverage,
  calculateIdentifierCoverage,
  getExposureLevel,
} from '@/lib/types';

const WELCOME_SEEN_KEY = 'freedom-engine-welcome-seen';

export default function DashboardPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [coverage, setCoverage] = useState<IdentifierCoverage>({
    primaryEmail: false,
    recoveryEmail: false,
    phone: false,
    username: false,
    domain: false,
    recoveryPhone: false,
    recoveryMethod: false,
  });
  const [primaryEmail, setPrimaryEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      
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
      const [
        tasksRes,
        alertsRes,
        emailsRes,
        usernamesRes,
        domainsRes,
        phonesRes,
        covInputsRes,
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('priority', { ascending: false }),
        supabase.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('inventory_emails').select('id, is_primary, email').eq('user_id', user.id),
        supabase.from('inventory_usernames').select('id').eq('user_id', user.id),
        supabase.from('inventory_domains').select('id').eq('user_id', user.id),
        supabase.from('inventory_phones').select('id').eq('user_id', user.id),
        supabase.from('governance_coverage_inputs').select('recovery_phone, recovery_method').eq('user_id', user.id).maybeSingle(),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data as Task[]);
      if (alertsRes.data) setAlerts(alertsRes.data as Alert[]);
      
      const emails = emailsRes.data || [];
      const primary = emails.find(e => e.is_primary);
      if (primary) setPrimaryEmail(primary.email);

      const covRow = covInputsRes.data;
      setCoverage(buildIdentifierCoverage({
        emails: emails.map(e => ({ is_primary: e.is_primary })),
        phones: phonesRes.data?.length || 0,
        usernames: usernamesRes.data?.length || 0,
        domains: domainsRes.data?.length || 0,
        recoveryPhone: covRow?.recovery_phone ?? null,
        recoveryMethod: covRow?.recovery_method ?? null,
      }));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dashboard is read-only for task state.

  const { level, total } = calculateIdentifierCoverage(coverage);
  const coveragePercent = (level / total) * 100;
  const highSeverityCount = alerts.filter(a => a.severity === 'high' && !a.resolved_at).length;
  const unresolvedCount = alerts.filter(a => !a.resolved_at).length;
  const exposure = getExposureLevel(unresolvedCount, highSeverityCount, coveragePercent);
  const baseline = calculateBaseline(tasks, coverage);

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
          <IdentifierCoverageCard coverage={coverage} />
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RecommendedActionCard />
          <TaskCard tasks={tasks} />
          <AlertsCard alerts={alerts} />
          <MasterKeyCard primaryEmail={primaryEmail} />
          <ContainmentCard />
        </div>
      </div>
    </AppLayout>
  );
}
