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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  X,
  ShieldCheck,
  ChevronRight,
  Mail,
  Smartphone,
  Users,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { CONTAINMENT_PLAYBOOKS } from '@/lib/containment-playbooks';
import {
  Task,
  Alert,
  IdentifierCoverage,
  buildIdentifierCoverage,
} from '@/lib/types';

const WELCOME_SEEN_KEY = 'freedom-engine-welcome-seen';

const ICON_MAP: Record<string, React.ElementType> = {
  Mail, Smartphone, Users, ShieldAlert, Globe,
};

function scoreLabel(score: number): string {
  if (score < 40) return 'Significant gaps — work through your action plan';
  if (score < 65) return 'Getting there — keep going this week';
  if (score < 85) return 'Good control — stay consistent';
  return 'Strong posture — maintain it';
}

function scoreBarClass(score: number): string {
  if (score < 40) return 'bg-destructive';
  if (score < 65) return 'bg-[hsl(var(--severity-medium))]';
  if (score < 85) return 'bg-[hsl(var(--severity-low))]';
  return 'bg-primary';
}

const SEVERITY_BORDER: Record<string, string> = {
  P0: 'border-l-destructive',
  P1: 'border-l-[hsl(var(--severity-medium))]',
  P2: 'border-l-muted-foreground/40',
};

const SEVERITY_LABEL: Record<string, string> = {
  P0: 'High',
  P1: 'Medium',
  P2: 'Low',
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { logEvent } = useAuditLog();
  const { overallScore, loading: scoreLoading } = useAssessment();
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
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCadence, setShowCadence] = useState(false);
  const [daysSinceVisit, setDaysSinceVisit] = useState(0);
  const [entryEmail1, setEntryEmail1] = useState('');
  const [entryEmail2, setEntryEmail2] = useState('');
  const [entryPhone, setEntryPhone] = useState('');
  const [entrySubmitting, setEntrySubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadDashboardData();

      const hasSeenWelcome = localStorage.getItem(`${WELCOME_SEEN_KEY}-${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user || loading) return;
    const visitKey = `fe-last-visit-${user.id}`;
    const dismissedKey = `fe-cadence-dismissed-${user.id}`;
    const lastVisit = localStorage.getItem(visitKey);
    const dismissed = localStorage.getItem(dismissedKey);
    const now = Date.now();
    const todayKey = new Date().toISOString().slice(0, 10);

    if (lastVisit) {
      const days = Math.floor((now - parseInt(lastVisit, 10)) / (1000 * 60 * 60 * 24));
      setDaysSinceVisit(days);
      const dismissedToday = dismissed === todayKey;
      if (days >= 7 && tasks.length > 0 && !dismissedToday) {
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
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`fe-cadence-dismissed-${user.id}`, todayKey);
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
      setEmailCount(emails.length);
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

  const healthScore = Math.round(overallScore?.score ?? 0);
  const triggered = overallScore?.triggeredExposures ?? [];

  const thisWeekTasks = useMemo(
    () =>
      tasks
        .filter(t => t.status !== 'done' && t.status !== 'completed')
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
        .slice(0, 3),
    [tasks],
  );

  const allDone = tasks.length > 0 && thisWeekTasks.length === 0;
  const showScorePlaceholder = scoreLoading || (healthScore === 0 && !overallScore);

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

  const playbookPreview = CONTAINMENT_PLAYBOOKS.slice(0, 3);

  const handleExposureEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const e1 = entryEmail1.trim();
    const e2 = entryEmail2.trim();
    const ph = entryPhone.trim();
    if (!e1) {
      toast({ title: 'Primary email is required', variant: 'destructive' });
      return;
    }
    setEntrySubmitting(true);
    try {
      const emailRows = [
        { user_id: user.id, email: e1, is_primary: true },
        ...(e2 ? [{ user_id: user.id, email: e2, is_primary: false }] : []),
      ];
      const { error: emailErr } = await supabase.from('inventory_emails').insert(emailRows);
      if (emailErr) throw emailErr;
      if (ph) {
        const { error: phoneErr } = await supabase
          .from('inventory_phones')
          .insert({ user_id: user.id, phone: ph });
        if (phoneErr) throw phoneErr;
      }
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't save your details",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setEntrySubmitting(false);
    }
  };

  if (!needsAuthorization && emailCount === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Let's find your exposure</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the email addresses and phone number you use most. We'll check what's out there.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExposureEntrySubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={entryEmail1}
                  onChange={(e) => setEntryEmail1(e.target.value)}
                  disabled={entrySubmitting}
                  required
                />
                <Input
                  type="email"
                  placeholder="another@email.com — optional"
                  value={entryEmail2}
                  onChange={(e) => setEntryEmail2(e.target.value)}
                  disabled={entrySubmitting}
                />
                <Input
                  type="tel"
                  placeholder="+1 555 000 0000 — optional"
                  value={entryPhone}
                  onChange={(e) => setEntryPhone(e.target.value)}
                  disabled={entrySubmitting}
                />
                <Button type="submit" className="w-full" disabled={entrySubmitting}>
                  {entrySubmitting ? 'Saving…' : 'Check my exposure'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We don't store passwords or access your accounts. Your data stays private.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
          {showCadence && (
            <div className="flex items-start justify-between gap-3 rounded-r-lg border-l-4 border-primary bg-muted/40 px-4 py-3">
              <p className="text-sm flex-1">
                It's been {daysSinceVisit} days — time for your weekly review.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/tasks?tab=open')}
              >
                Review now
              </Button>
              <button
                onClick={dismissCadence}
                aria-label="Dismiss"
                className="text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Health Score Hero */}
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Digital health score
              </p>
              {showScorePlaceholder ? (
                <div className="space-y-3">
                  <div className="text-5xl font-medium text-muted-foreground">--</div>
                  <p className="text-sm text-muted-foreground">
                    Complete your action plan to build your score
                  </p>
                  <Button variant="outline" onClick={() => navigate('/tasks')}>
                    Start my first task →
                  </Button>
                </div>
              ) : healthScore === 0 ? (
                <>
                  <div className="text-5xl font-medium text-muted-foreground">--</div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${scoreBarClass(healthScore)}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Add your accounts to build your score</p>
                </>
              ) : (
                <>
                  <div className="text-5xl font-medium">{healthScore}</div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${scoreBarClass(healthScore)}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{scoreLabel(healthScore)}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* This week */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">This week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  Building your plan…
                </div>
              ) : allDone ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  You're up to date. Check back next week.
                </div>
              ) : (
                <>
                  <ul className="divide-y">
                    {thisWeekTasks.map(task => (
                      <li
                        key={task.id}
                        onClick={() => navigate(`/tasks?highlight=${task.id}`)}
                        className="flex items-start gap-3 py-2.5 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
                      >
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {task.type || 'Action'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-sm text-primary hover:underline"
                  >
                    See all actions →
                  </button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Open risks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {triggered.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  No critical risks detected.
                </div>
              ) : (
                triggered.slice(0, 4).map((ex, i) => (
                  <div
                    key={ex.exposureType.id + i}
                    onClick={() => navigate('/tasks')}
                    className={`relative pl-4 py-2.5 border-b last:border-0 cursor-pointer hover:bg-muted/40 border-l-4 ${SEVERITY_BORDER[ex.severity] || 'border-l-muted'} flex items-center justify-between gap-3`}
                  >
                    <span className="text-sm font-medium truncate">{ex.exposureType.name}</span>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {SEVERITY_LABEL[ex.severity] || ex.severity}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Coverage */}
          <IdentifierCoverageCard coverage={coverage} />

          {/* Emergency / If something goes wrong */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">If something goes wrong</CardTitle>
              <p className="text-xs text-muted-foreground">
                Step-by-step guides for common situations
              </p>
            </CardHeader>
            <CardContent className="space-y-0">
              {playbookPreview.map(pb => {
                const Icon = ICON_MAP[pb.icon] || ShieldAlert;
                return (
                  <div
                    key={pb.id}
                    onClick={() => navigate('/playbooks')}
                    className="flex items-center gap-3 py-2.5 border-b last:border-0 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1 truncate">{pb.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
              <button
                onClick={() => navigate('/playbooks')}
                className="text-sm text-primary hover:underline mt-3"
              >
                See all playbooks →
              </button>
            </CardContent>
          </Card>

          {/* Master Key + Alerts */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <MasterKeyCard primaryEmail={primaryEmail} />
            <AlertsCard alerts={alerts} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
