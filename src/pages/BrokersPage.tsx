import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { BrokerSite, BrokerStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG: Record<BrokerStatus, { label: string; icon: typeof Clock; className: string }> = {
  not_started: { label: 'Not Started', icon: Clock, className: 'bg-muted text-muted-foreground' },
  submitted: { label: 'Submitted', icon: AlertCircle, className: 'severity-medium' },
  pending: { label: 'Pending', icon: Clock, className: 'severity-medium' },
  confirmed: { label: 'Confirmed Removed', icon: CheckCircle2, className: 'severity-low' },
  failed: { label: 'Failed', icon: XCircle, className: 'severity-high' }
};

const COMMON_BROKERS = [
  { name: 'Spokeo', url: 'https://www.spokeo.com/optout' },
  { name: 'WhitePages', url: 'https://www.whitepages.com/suppression-requests' },
  { name: 'BeenVerified', url: 'https://www.beenverified.com/faq/opt-out/' },
  { name: 'Intelius', url: 'https://www.intelius.com/opt-out' },
  { name: 'PeopleFinder', url: 'https://www.peoplefinder.com/optout' },
  { name: 'TruePeopleSearch', url: 'https://www.truepeoplesearch.com/removal' },
  { name: 'FastPeopleSearch', url: 'https://www.fastpeoplesearch.com/removal' },
  { name: 'USSearch', url: 'https://www.ussearch.com/opt-out' }
];

export default function BrokersPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();

  const [brokers, setBrokers] = useState<BrokerSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingBroker, setAddingBroker] = useState(false);

  // Form state
  const [newSiteName, setNewSiteName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (user) loadBrokers();
  }, [user]);

  const loadBrokers = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('broker_sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setBrokers(data as BrokerSite[]);
    setLoading(false);
  };

  const addBroker = async () => {
    if (!user || !newSiteName) return;
    setAddingBroker(true);

    const { error } = await supabase.from('broker_sites').insert([{
      user_id: user.id,
      site_name: newSiteName,
      url: newUrl || null,
      notes: newNotes || null,
      status: 'not_started'
    }]);

    if (!error) {
      await logEvent('broker_added', { site_name: newSiteName });
      toast({ title: 'Broker added', description: 'Track your opt-out request.' });
      setNewSiteName('');
      setNewUrl('');
      setNewNotes('');
      loadBrokers();
    }
    setAddingBroker(false);
  };

  const addCommonBroker = async (broker: typeof COMMON_BROKERS[0]) => {
    if (!user) return;

    const exists = brokers.some(b => b.site_name.toLowerCase() === broker.name.toLowerCase());
    if (exists) {
      toast({ title: 'Already added', description: `${broker.name} is already in your list.`, variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('broker_sites').insert([{
      user_id: user.id,
      site_name: broker.name,
      url: broker.url,
      status: 'not_started'
    }]);

    if (!error) {
      await logEvent('broker_added', { site_name: broker.name });
      toast({ title: 'Broker added' });
      loadBrokers();
    }
  };

  const updateStatus = async (brokerId: string, status: BrokerStatus) => {
    const updates: Partial<BrokerSite> = { status };
    if (status === 'submitted') {
      updates.date_submitted = new Date().toISOString().split('T')[0];
    }

    const { error } = await supabase
      .from('broker_sites')
      .update(updates)
      .eq('id', brokerId);

    if (!error) {
      await logEvent('broker_status_updated', { broker_id: brokerId, status });
      setBrokers(prev => prev.map(b => 
        b.id === brokerId ? { ...b, ...updates } as BrokerSite : b
      ));
    }
  };

  const deleteBroker = async (brokerId: string) => {
    const { error } = await supabase
      .from('broker_sites')
      .delete()
      .eq('id', brokerId);

    if (!error) {
      await logEvent('broker_deleted', { broker_id: brokerId });
      setBrokers(prev => prev.filter(b => b.id !== brokerId));
      toast({ title: 'Broker removed' });
    }
  };

  const stats = {
    total: brokers.length,
    notStarted: brokers.filter(b => b.status === 'not_started').length,
    pending: brokers.filter(b => b.status === 'submitted' || b.status === 'pending').length,
    confirmed: brokers.filter(b => b.status === 'confirmed').length
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
          <h1 className="text-2xl font-bold">Data Broker Opt-outs</h1>
          <p className="text-muted-foreground">
            Track your opt-out requests to data broker and people-search sites
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Not Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.notStarted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[hsl(var(--success))]">{stats.confirmed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Add Common Brokers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Add Common Brokers</CardTitle>
            <CardDescription>Click to add these commonly-tracked data broker sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COMMON_BROKERS.map((broker) => (
                <Button
                  key={broker.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addCommonBroker(broker)}
                  disabled={brokers.some(b => b.site_name.toLowerCase() === broker.name.toLowerCase())}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {broker.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Broker List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Tracked Sites</CardTitle>
                <CardDescription>Manage your opt-out requests</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Add Custom</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Broker Site</DialogTitle>
                    <DialogDescription>
                      Track an opt-out request for a site not in the common list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Site Name</Label>
                      <Input 
                        value={newSiteName}
                        onChange={(e) => setNewSiteName(e.target.value)}
                        placeholder="Example Data Broker"
                      />
                    </div>
                    <div>
                      <Label>Opt-out URL (optional)</Label>
                      <Input 
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://example.com/optout"
                      />
                    </div>
                    <div>
                      <Label>Notes (optional)</Label>
                      <Textarea 
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Any notes about this site..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addBroker} disabled={addingBroker || !newSiteName}>
                      {addingBroker && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Broker
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {brokers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No broker sites tracked</p>
                <p className="text-muted-foreground">
                  Add sites from the quick list above or add custom sites
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {brokers.map((broker) => {
                  const statusConfig = STATUS_CONFIG[broker.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div key={broker.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{broker.site_name}</span>
                          <Badge className={statusConfig.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        {broker.url && (
                          <a 
                            href={broker.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Open opt-out page
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {broker.date_submitted && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {broker.date_submitted}
                          </p>
                        )}
                        {broker.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{broker.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={broker.status}
                          onValueChange={(value) => updateStatus(broker.id, value as BrokerStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteBroker(broker.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opt-out Request Templates</CardTitle>
            <CardDescription>
              Copy and customize these templates for your opt-out requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Standard Opt-out Request</h4>
              <pre className="text-xs text-muted-foreground bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
{`To Whom It May Concern,

I am writing to request the removal of my personal information from your database pursuant to applicable privacy laws.

My name is [YOUR NAME] and I would like all information associated with the following removed:
- Email: [YOUR EMAIL]
- Name: [YOUR FULL NAME]
- Any associated addresses or phone numbers

Please confirm removal within 30 days.

Thank you for your cooperation.

[YOUR NAME]`}
              </pre>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Follow-up Request</h4>
              <pre className="text-xs text-muted-foreground bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
{`To Whom It May Concern,

I am following up on my previous opt-out request submitted on [DATE].

I have not yet received confirmation that my data has been removed from your database. Please provide an update on the status of my request.

My original request was to remove all personal information associated with:
- Name: [YOUR NAME]
- Email: [YOUR EMAIL]

I would appreciate a response within 14 days.

Thank you,
[YOUR NAME]`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}