import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AlertsCard } from '@/components/dashboard/AlertsCard';
import { MasterKeyCard } from '@/components/dashboard/MasterKeyCard';
import { IdentifierCoverageCard } from '@/components/dashboard/IdentifierCoverageCard';
import { WelcomeModal } from '@/components/dashboard/WelcomeModal';
import { AuthorizationConfirmModal, CURRENT_AUTHORIZATION_VERSION } from '@/components/dashboard/AuthorizationConfirmModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useAssessment } from '@/hooks/useAssessment';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, X, ArrowRight } from 'lucide-react';
import {
  Task,
  Alert,
  IdentifierCoverage,
  buildIdentifierCoverage,
} from '@/lib/types';

const WELCOME_SEEN_KEY = 'freedom-engine-welcome-seen';

function scoreStatusLabel(score: number): string {
  if (score < 40) return 'High exposure — action needed';
  if (score < 65) return 'Getting there — keep going';
  if (score < 85) return 'Good control — stay consistent';
  return 'Strong posture — maintain it';
}

const SEVERITY_BORDER: Record<string, string> = {
  P0: 'border-l-destructive',
  P1: 'border-l-amber-500',
  P2: 'border-l-muted-foreground/40',
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { logEvent } = useAuditLog();
  const { overallScore } = useAssessment();
  const { toast } = useToast();
  const navigate = useNavigate();

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
  const [showCadence, setShowCadence] = useState(false);
  const [daysSinceVisit, setDaysSinceVisit] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();

      const hasSeenWelcome = localStorage.getItem(`${WELCOME_SEEN_KEY}-${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  // Weekly cadence check + last-visit tracking
  useEffect(() => {
    if (!user || loading) return;
    const visitKey = `fe-last-visit-${user.id}`;
    const dismissedKey = `fe-cadence-dismissed-${user.id}`;
    const lastVisit = localStorage.getItem(visitKey);
    const dismissed = localStorage.getItem(dismissedKey);
    const now = Date.now();
    const doneCount = tasks.filter(t => t.status === 'done').length;

    if (lastVisit) {
      const days = Math.floor((now - parseInt(lastVisit, 10)) / (1000 * 60 * 60 * 24));
      setDaysSinceVisit(days);
      const dismissedRecently = dismissed
        ? (now - parseInt(dismissed, 10)) < 1000 * 60 * 60 * 24 * 7
        : false;
      if (days >= 7 && doneCount > 0 && !dismissedRecently) {
        setShowCadence(true);
      }
    }
    localStorage.setItem(visitKey, String(now));
  }, [user, loading, tasks]);

  const handleWelcomeClose = () => {
    if (user) {
      localStorage.setItem(`${WELCOME_SEEN_KEY}-${user.id}`, 'true');
      logEvent('welcome_tour_completed', {});
    }
    setShowWelcome(false);
  };

  const dismissCadence = () => {
    if (user) {
      localStorage.setItem(`fe-cadence-dismissed-${user.id}`, String(Date.now()));
    }
    setShowCadence(false);
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
        supabase.from('tasks').select('*').eq('user_id', user.id).order('priority', { ascending: true }),
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

  const score = Math.round(overallScore?.score ?? 0);
  const statusLabel = scoreStatusLabel(score);
  const triggered = overallScore?.triggeredExposures ?? [];

  const thisWeekTasks = useMemo(
    () =>
      tasks
        .filter(t => t.status !== 'done')
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
        .slice(0, 3),
    [tasks],
  );

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const allDone = tasks.length > 0 && thisWeekTasks.length === 0;

  const completeTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', task.id);
    if (error) {
      toast({ title: 'Could not update', description: error.message, variant: 'destructive' });
      return;
    }
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done', completed_at: new Date().toISOString() } : t));
    await logEvent('task_status_changed', { task_id: task.id, new_status: 'done' });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const needsAuthorization =
    !profile?.authorization_confirmed ||
    profile?.authorization_version !== CURRENT_AUTHORIZATION_VERSION;

  return (
    <AppLayout>
      <AuthorizationConfirmModal open={needsAuthorization} onConfirmed={() => {}} />
      {!needsAuthorization && <WelcomeModal open={showWelcome} onClose={handleWelcomeClose} />}

      {needsAuthorization ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weekly cadence prompt */}
          {showCadence && (
            <div className="flex items-start justify-between gap-3 rounded-md border border-l-4 border-l-primary bg-muted/30 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  It's been {daysSinceVisit} days — time for your weekly review.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => navigate('/tasks?tab=open')}
                >
                  Start review
                </Button>
              </div>
              <button
                onClick={dismissCadence}
                aria-label="Dismiss"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Score Hero */}
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <div>
                <div
                  className="text-foreground"
                  style={{ fontSize: '56px', fontWeight: 500, lineHeight: 1 }}
                >
                  {score}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{statusLabel}</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* This week */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">This week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your action plan is being built…</p>
              ) : allDone ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  You're up to date. Check back next week.
                </div>
              ) : (
                <>
                  <ul className="space-y-2">
                    {thisWeekTasks.map(task => (
                      <li key={task.id} className="flex items-start gap-3">
                        <Checkbox
                          className="mt-0.5"
                          checked={false}
                          onCheckedChange={() => completeTask(task)}
                          aria-label={`Mark "${task.title}" complete`}
                        />
                        <span className="text-sm">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    See all tasks <ArrowRight className="h-3 w-3" />
                  </button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Open problems */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {triggered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No critical problems found. Run your weekly review.
                </p>
              ) : (
                triggered.slice(0, 4).map((ex, i) => (
                  <div
                    key={ex.exposureType.id + i}
                    className={`flex items-center justify-between gap-3 rounded-md border border-l-4 ${SEVERITY_BORDER[ex.severity] || 'border-l-muted'} bg-card px-3 py-2`}
                  >
                    <span className="text-sm font-medium truncate">{ex.exposureType.name}</span>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Fix this →
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Coverage + Master Key side-by-side */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <MasterKeyCard primaryEmail={primaryEmail} />
            <IdentifierCoverageCard coverage={coverage} />
          </div>

          <AlertsCard alerts={alerts} />
        </div>
      )}
    </AppLayout>
  );
}
