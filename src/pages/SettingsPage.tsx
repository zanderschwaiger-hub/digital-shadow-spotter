import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Bell, 
  Trash2, 
  Loader2,
  Shield,
  History
} from 'lucide-react';
import { NotificationSettings, AuditLogEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    setLoading(true);

    const [notifRes, auditRes] = await Promise.all([
      supabase.from('notification_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('audit_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    ]);

    if (notifRes.data) {
      setNotificationSettings(notifRes.data as NotificationSettings);
    }
    if (auditRes.data) {
      setAuditLog(auditRes.data as AuditLogEntry[]);
    }

    setLoading(false);
  };

  const updateNotificationSetting = async (key: keyof NotificationSettings, value: boolean | string) => {
    if (!user || !notificationSettings) return;
    setSaving(true);

    const { error } = await supabase
      .from('notification_settings')
      .update({ [key]: value })
      .eq('user_id', user.id);

    if (!error) {
      await logEvent('notification_settings_updated', { [key]: value });
      setNotificationSettings(prev => prev ? { ...prev, [key]: value } : null);
      toast({ title: 'Settings updated' });
    }

    setSaving(false);
  };

  const deleteAllData = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      // Delete all user data from all tables
      await Promise.all([
        supabase.from('inventory_emails').delete().eq('user_id', user.id),
        supabase.from('inventory_usernames').delete().eq('user_id', user.id),
        supabase.from('inventory_accounts').delete().eq('user_id', user.id),
        supabase.from('inventory_domains').delete().eq('user_id', user.id),
        supabase.from('inventory_phones').delete().eq('user_id', user.id),
        supabase.from('signals_settings').delete().eq('user_id', user.id),
        supabase.from('alerts').delete().eq('user_id', user.id),
        supabase.from('tasks').delete().eq('user_id', user.id),
        supabase.from('broker_sites').delete().eq('user_id', user.id),
        supabase.from('audit_log').delete().eq('user_id', user.id)
      ]);

      // Reset profile
      await supabase
        .from('profiles')
        .update({ onboarding_completed: false, consent_accepted_at: null })
        .eq('user_id', user.id);

      toast({ 
        title: 'Data deleted', 
        description: 'All your data has been permanently deleted.' 
      });

      // Sign out after deletion
      await signOut();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete all data. Please try again.',
        variant: 'destructive'
      });
    }

    setDeleting(false);
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and data
          </p>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how and when you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Switch
                checked={notificationSettings?.email_enabled ?? true}
                onCheckedChange={(checked) => updateNotificationSetting('email_enabled', checked)}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive high-severity alerts via SMS
                </p>
              </div>
              <Switch
                checked={notificationSettings?.sms_enabled ?? false}
                onCheckedChange={(checked) => updateNotificationSetting('sms_enabled', checked)}
                disabled={saving}
              />
            </div>

            {notificationSettings?.sms_enabled && (
              <div className="flex items-center justify-between pl-4 border-l-2">
                <div>
                  <Label>High Severity Only</Label>
                  <p className="text-sm text-muted-foreground">
                    Only send SMS for high-severity alerts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings?.sms_high_only ?? true}
                  onCheckedChange={(checked) => updateNotificationSetting('sms_high_only', checked)}
                  disabled={saving}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Digest Frequency</Label>
                <p className="text-sm text-muted-foreground">
                  How often to send non-urgent alert summaries
                </p>
              </div>
              <Select
                value={notificationSettings?.digest_frequency ?? 'daily'}
                onValueChange={(value) => updateNotificationSetting('digest_frequency', value)}
                disabled={saving}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>
              Immutable record of all actions in your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLog.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No audit log entries yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auditLog.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex items-start justify-between p-2 rounded text-sm border-b last:border-0"
                  >
                    <div>
                      <span className="font-mono text-xs bg-muted px-1 rounded">
                        {entry.event_type}
                      </span>
                      {Object.keys(entry.payload_json || {}).length > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {JSON.stringify(entry.payload_json)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Deletion */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete All Data
            </CardTitle>
            <CardDescription>
              Permanently delete all your data from Freedom Engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This action will permanently delete all your inventory data, alerts, tasks, 
              broker tracking, audit logs, and settings. This cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete All My Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your 
                    personal data including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All inventory items (emails, usernames, accounts, etc.)</li>
                      <li>All alerts and signal settings</li>
                      <li>All tasks and broker tracking data</li>
                      <li>All audit log entries</li>
                      <li>All notification preferences</li>
                    </ul>
                    <p className="mt-4">You will be signed out after deletion.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              About Freedom Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Tagline:</strong> "Emotional safety through technical discipline."</p>
            <p className="pt-2">
              Freedom Engine is a governance-first, human-in-the-loop digital footprint 
              maintenance tool. We never hack, scrape illegally, or access your accounts 
              without explicit consent. Every action is suggested and confirmed by you.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}