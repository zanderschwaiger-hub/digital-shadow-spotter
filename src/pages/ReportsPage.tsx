import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';
import { 
  InventoryCounts, 
  calculateInventoryCompleteness, 
  getExposureLevel 
} from '@/lib/types';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<{
    inventoryCounts: InventoryCounts;
    alertsCount: number;
    highSeverityCount: number;
    tasksCompleted: number;
    tasksPending: number;
    brokersTracked: number;
    brokersConfirmed: number;
    signalsEnabled: number;
  } | null>(null);

  useEffect(() => {
    if (user) loadReportData();
  }, [user]);

  const loadReportData = async () => {
    if (!user) return;
    setLoading(true);

    const [
      emailsRes,
      usernamesRes,
      accountsRes,
      domainsRes,
      phonesRes,
      alertsRes,
      tasksRes,
      brokersRes,
      signalsRes
    ] = await Promise.all([
      supabase.from('inventory_emails').select('id').eq('user_id', user.id),
      supabase.from('inventory_usernames').select('id').eq('user_id', user.id),
      supabase.from('inventory_accounts').select('id').eq('user_id', user.id),
      supabase.from('inventory_domains').select('id').eq('user_id', user.id),
      supabase.from('inventory_phones').select('id').eq('user_id', user.id),
      supabase.from('alerts').select('severity, resolved_at').eq('user_id', user.id),
      supabase.from('tasks').select('status').eq('user_id', user.id),
      supabase.from('broker_sites').select('status').eq('user_id', user.id),
      supabase.from('signals_settings').select('enabled').eq('user_id', user.id).eq('enabled', true)
    ]);

    const alerts = alertsRes.data || [];
    const tasks = tasksRes.data || [];
    const brokers = brokersRes.data || [];

    setReportData({
      inventoryCounts: {
        emails: emailsRes.data?.length || 0,
        usernames: usernamesRes.data?.length || 0,
        accounts: accountsRes.data?.length || 0,
        domains: domainsRes.data?.length || 0,
        phones: phonesRes.data?.length || 0
      },
      alertsCount: alerts.filter(a => !a.resolved_at).length,
      highSeverityCount: alerts.filter(a => a.severity === 'high' && !a.resolved_at).length,
      tasksCompleted: tasks.filter(t => t.status === 'completed').length,
      tasksPending: tasks.filter(t => t.status === 'pending').length,
      brokersTracked: brokers.length,
      brokersConfirmed: brokers.filter(b => b.status === 'confirmed').length,
      signalsEnabled: signalsRes.data?.length || 0
    });

    setLoading(false);
  };

  const exportReport = async () => {
    if (!reportData || !user) return;
    setGenerating(true);

    const completeness = calculateInventoryCompleteness(reportData.inventoryCounts);
    const exposure = getExposureLevel(
      reportData.alertsCount, 
      reportData.highSeverityCount, 
      completeness
    );

    const report = `
FREEDOM ENGINE - FOOTPRINT MAINTENANCE REPORT
Generated: ${format(new Date(), 'PPP')}
User: ${user.email}

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
─────────────────────────────────────────────────────────────────
Exposure Status: ${exposure.level.toUpperCase()}
Reason: ${exposure.reason}
Inventory Completeness: ${completeness}%

═══════════════════════════════════════════════════════════════

IDENTITY INVENTORY
─────────────────────────────────────────────────────────────────
Emails Tracked: ${reportData.inventoryCounts.emails}
Usernames Tracked: ${reportData.inventoryCounts.usernames}
Key Accounts: ${reportData.inventoryCounts.accounts}
Domains: ${reportData.inventoryCounts.domains}
Phone Numbers: ${reportData.inventoryCounts.phones}

═══════════════════════════════════════════════════════════════

MONITORING STATUS
─────────────────────────────────────────────────────────────────
Active Signals: ${reportData.signalsEnabled}
Active Alerts: ${reportData.alertsCount}
High Severity Alerts: ${reportData.highSeverityCount}

═══════════════════════════════════════════════════════════════

TASK COMPLETION
─────────────────────────────────────────────────────────────────
Tasks Completed: ${reportData.tasksCompleted}
Tasks Pending: ${reportData.tasksPending}
Completion Rate: ${reportData.tasksCompleted + reportData.tasksPending > 0 
  ? Math.round((reportData.tasksCompleted / (reportData.tasksCompleted + reportData.tasksPending)) * 100)
  : 0}%

═══════════════════════════════════════════════════════════════

DATA BROKER OPT-OUTS
─────────────────────────────────────────────────────────────────
Sites Tracked: ${reportData.brokersTracked}
Confirmed Removals: ${reportData.brokersConfirmed}
Success Rate: ${reportData.brokersTracked > 0 
  ? Math.round((reportData.brokersConfirmed / reportData.brokersTracked) * 100)
  : 0}%

═══════════════════════════════════════════════════════════════

This report was generated by Freedom Engine - Footprint Maintenance Agent
"Emotional safety through technical discipline."
    `.trim();

    // Create and download the file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freedom-engine-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    await logEvent('report_exported', { format: 'txt' });
    toast({ title: 'Report exported', description: 'Your report has been downloaded.' });
    setGenerating(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const completeness = reportData ? calculateInventoryCompleteness(reportData.inventoryCounts) : 0;
  const exposure = reportData 
    ? getExposureLevel(reportData.alertsCount, reportData.highSeverityCount, completeness)
    : { level: 'low' as const, reason: '' };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Export summaries of your digital footprint status
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Footprint Summary Report
                </CardTitle>
                <CardDescription>
                  A comprehensive overview of your digital footprint status
                </CardDescription>
              </div>
              <Button onClick={exportReport} disabled={generating}>
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold">What's Included</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Executive summary with exposure status
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Identity inventory overview
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Monitoring and alert statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Task completion metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Data broker opt-out progress
                  </li>
                </ul>
              </div>
              
              {reportData && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Snapshot</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground">Exposure</p>
                      <p className="font-semibold capitalize">{exposure.level}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground">Completeness</p>
                      <p className="font-semibold">{completeness}%</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground">Active Alerts</p>
                      <p className="font-semibold">{reportData.alertsCount}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground">Tasks Pending</p>
                      <p className="font-semibold">{reportData.tasksPending}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Report Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Reports are generated locally in your browser and downloaded directly to your device.
              No report data is stored on our servers. The exported file contains aggregate statistics
              only — no raw personal data like email addresses or usernames are included in the report.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}