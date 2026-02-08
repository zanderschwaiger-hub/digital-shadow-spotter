import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Radio,
  ShieldAlert,
  Key,
  Building2,
  Globe,
  Users,
  Smartphone,
  Info,
  Loader2
} from 'lucide-react';
import { SignalSetting, SignalType, Alert as AlertType } from '@/lib/types';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { formatDistanceToNow } from 'date-fns';

const SIGNAL_CONFIG: Record<SignalType, { 
  icon: typeof Radio; 
  title: string; 
  description: string;
  note: string;
}> = {
  breach_alerts: {
    icon: ShieldAlert,
    title: 'Breach Alerts',
    description: 'Check your emails against known data breach databases',
    note: 'Uses lawful breach notification APIs. Manual check available if API is not configured.'
  },
  password_exposure: {
    icon: Key,
    title: 'Password Exposure Indicators',
    description: 'Check if any of your passwords have appeared in known breaches',
    note: 'We NEVER store your passwords. Uses secure hash-based checking via reputable services.'
  },
  data_broker_tracking: {
    icon: Building2,
    title: 'Data Broker Tracking',
    description: 'Track your exposure on people-search and data broker sites',
    note: 'User-driven workflow. We provide opt-out links and track your removal requests.'
  },
  domain_spoofing: {
    icon: Globe,
    title: 'Domain Spoofing & Impersonation',
    description: 'Check for lookalike domains that could be used for phishing',
    note: 'Only for users who have added domains to their inventory.'
  },
  social_takeover: {
    icon: Users,
    title: 'Social Takeover Risk',
    description: 'Checklist-based assessment of social account security',
    note: 'Risk flags only - we never access your social accounts.'
  },
  device_permissions: {
    icon: Smartphone,
    title: 'Device/App Permissions',
    description: 'Guided review of app permissions on your devices',
    note: 'Periodic reminder to review permissions in your device settings.'
  }
};

const ALL_SIGNALS: SignalType[] = [
  'breach_alerts',
  'password_exposure', 
  'data_broker_tracking',
  'domain_spoofing',
  'social_takeover',
  'device_permissions'
];

export default function SignalsPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();

  const [settings, setSettings] = useState<Record<SignalType, boolean>>({
    breach_alerts: false,
    password_exposure: false,
    data_broker_tracking: false,
    domain_spoofing: false,
    social_takeover: false,
    device_permissions: false
  });
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<SignalType | null>(null);

  useEffect(() => {
    if (user) loadSignals();
  }, [user]);

  const loadSignals = async () => {
    if (!user) return;
    setLoading(true);

    const [signalsRes, alertsRes] = await Promise.all([
      supabase.from('signals_settings').select('*').eq('user_id', user.id),
      supabase.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    ]);

    if (signalsRes.data) {
      const newSettings = { ...settings };
      signalsRes.data.forEach((s: SignalSetting) => {
        if (s.signal_type in newSettings) {
          newSettings[s.signal_type as SignalType] = s.enabled;
        }
      });
      setSettings(newSettings);
    }

    if (alertsRes.data) {
      setAlerts(alertsRes.data as AlertType[]);
    }

    setLoading(false);
  };

  const toggleSignal = async (signalType: SignalType, enabled: boolean) => {
    if (!user) return;
    setUpdating(signalType);

    // Upsert the signal setting
    const { error } = await supabase
      .from('signals_settings')
      .upsert([{
        user_id: user.id,
        signal_type: signalType,
        enabled
      }], { onConflict: 'user_id,signal_type' });

    if (!error) {
      await logEvent('signal_toggled', { signal_type: signalType, enabled });
      setSettings(prev => ({ ...prev, [signalType]: enabled }));
      toast({
        title: enabled ? 'Signal enabled' : 'Signal disabled',
        description: `${SIGNAL_CONFIG[signalType].title} has been ${enabled ? 'enabled' : 'disabled'}.`
      });
    }

    setUpdating(null);
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
          <h1 className="text-2xl font-bold">Signals Overview</h1>
          <p className="text-muted-foreground">
            Configure which signals to review for your digital footprint
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Human-in-the-Loop</AlertTitle>
          <AlertDescription>
            All signals are checked using lawful methods. We never access your accounts or perform unauthorized actions.
            You control which signals are enabled and must confirm any suggested actions.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          {ALL_SIGNALS.map((signalType) => {
            const config = SIGNAL_CONFIG[signalType];
            const Icon = config.icon;
            const isEnabled = settings[signalType];

            return (
              <Card key={signalType} className={isEnabled ? 'border-primary/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{config.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => toggleSignal(signalType, checked)}
                      disabled={updating === signalType}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {config.note}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Alerts from your enabled signals</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No alerts yet. Enable signals and add items to your inventory to begin tracking.
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-lg border ${alert.resolved_at ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <SeverityBadge severity={alert.severity} />
                          {alert.resolved_at && <Badge variant="outline">Resolved</Badge>}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="font-medium">{alert.title}</p>
                        {alert.details && (
                          <p className="text-sm text-muted-foreground mt-1">{alert.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Source: {alert.source_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}