import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Download, FileText, Clock, ShieldCheck, Info, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import {
  type GovernanceFileEntry,
  type PLevel,
  type ReviewCadence,
  type GovernanceResult,
  P_LEVEL_DEFINITIONS,
  CADENCE_DEFINITIONS,
  GOVERNANCE_FILE_ARTIFACT_TYPE,
  PRIVACY_HEADER,
} from '@/lib/governance-policies';

const RESULT_LABELS: Record<GovernanceResult, string> = {
  finding_logged: 'Finding Logged',
  none_found: 'None Found',
  action_taken: 'Action Taken',
  deferred: 'Deferred',
};

const PLEVEL_VARIANT: Record<PLevel, 'destructive' | 'secondary' | 'outline'> = {
  P0: 'destructive',
  P1: 'secondary',
  P2: 'outline',
};

export default function GovernanceFilePage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();

  const [entries, setEntries] = useState<GovernanceFileEntry[]>([]);
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New entry form state
  const [formWhat, setFormWhat] = useState('');
  const [formCadence, setFormCadence] = useState<ReviewCadence>('monthly');
  const [formSeverity, setFormSeverity] = useState<PLevel>('P2');
  const [formResult, setFormResult] = useState<GovernanceResult>('none_found');
  const [formSummary, setFormSummary] = useState('');

  useEffect(() => {
    if (user) loadGovernanceFile();
  }, [user]);

  const loadGovernanceFile = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('baseline_artifacts')
      .select('*')
      .eq('user_id', user.id)
      .eq('artifact_type', GOVERNANCE_FILE_ARTIFACT_TYPE)
      .maybeSingle();

    if (data) {
      setArtifactId(data.id);
      const content = data.content_json as unknown;
      if (Array.isArray(content)) {
        setEntries(content as GovernanceFileEntry[]);
      }
    }

    setLoading(false);
  };

  const saveEntries = async (updatedEntries: GovernanceFileEntry[]) => {
    if (!user) return;
    setSaving(true);

    if (artifactId) {
      const { error } = await supabase
        .from('baseline_artifacts')
        .update({ content_json: JSON.parse(JSON.stringify(updatedEntries)) })
        .eq('id', artifactId);

      if (error) {
        toast({ title: 'Error', description: 'Failed to save entry.', variant: 'destructive' });
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('baseline_artifacts')
        .insert([{
          user_id: user.id,
          artifact_type: GOVERNANCE_FILE_ARTIFACT_TYPE,
          content_json: JSON.parse(JSON.stringify(updatedEntries)),
        }])
        .select('id')
        .single();

      if (error || !data) {
        toast({ title: 'Error', description: 'Failed to create governance file.', variant: 'destructive' });
        setSaving(false);
        return;
      }
      setArtifactId(data.id);
    }

    setEntries(updatedEntries);
    setSaving(false);
  };

  const handleAddEntry = async () => {
    if (!formWhat.trim()) return;

    const newEntry: GovernanceFileEntry = {
      what_checked: formWhat.trim(),
      when_checked: new Date().toISOString(),
      cadence: formCadence,
      severity: formSeverity,
      result: formResult,
      summary: formSummary.trim() || (formResult === 'none_found' ? 'No issues found during review.' : ''),
    };

    const updated = [newEntry, ...entries];
    await saveEntries(updated);
    await logEvent('governance_entry_added', {
      what_checked: newEntry.what_checked,
      severity: newEntry.severity,
      result: newEntry.result,
    });

    // Reset form
    setFormWhat('');
    setFormCadence('monthly');
    setFormSeverity('P2');
    setFormResult('none_found');
    setFormSummary('');
    setDialogOpen(false);

    toast({ title: 'Entry logged', description: 'Governance record has been saved.' });
  };

  const exportGovernanceFile = async () => {
    if (!user) return;

    const lines = [
      PRIVACY_HEADER.title,
      ...PRIVACY_HEADER.lines.map(l => `  ${l}`),
      '',
      `FREEDOM ENGINE — GOVERNANCE FILE`,
      `Generated: ${format(new Date(), 'PPP pp')}`,
      `Entries: ${entries.length}`,
      '',
      '═══════════════════════════════════════════════════════════════',
      '',
    ];

    entries.forEach((entry, idx) => {
      lines.push(
        `ENTRY ${idx + 1}`,
        `─────────────────────────────────────────────────────────────────`,
        `What Checked:  ${entry.what_checked}`,
        `When Checked:  ${format(new Date(entry.when_checked), 'PPP pp')}`,
        `Cadence:       ${CADENCE_DEFINITIONS[entry.cadence].label}`,
        `Severity:      ${P_LEVEL_DEFINITIONS[entry.severity].label}`,
        `Result:        ${RESULT_LABELS[entry.result]}`,
        `Summary:       ${entry.summary || '—'}`,
        '',
      );
    });

    if (entries.length === 0) {
      lines.push('No governance entries have been logged yet.', '');
    }

    lines.push(
      '═══════════════════════════════════════════════════════════════',
      '',
      'This file is an audit record of your governance reviews.',
      '"Emotional safety through technical discipline."',
    );

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `governance-file-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    await logEvent('governance_file_exported', { entry_count: entries.length });
    toast({ title: 'Governance file exported', description: 'Downloaded to your device.' });
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Governance File
            </h1>
            <p className="text-muted-foreground">
              Your audit record of governance reviews — what was checked, when, and the result
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportGovernanceFile} disabled={entries.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log Governance Entry</DialogTitle>
                  <DialogDescription>
                    Record what you reviewed, the cadence, and the outcome.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">What was checked</label>
                    <Input
                      placeholder="e.g. Inbox for breach notifications"
                      value={formWhat}
                      onChange={(e) => setFormWhat(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cadence</label>
                      <Select value={formCadence} onValueChange={(v) => setFormCadence(v as ReviewCadence)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(CADENCE_DEFINITIONS) as ReviewCadence[]).map((c) => (
                            <SelectItem key={c} value={c}>{CADENCE_DEFINITIONS[c].label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Severity</label>
                      <Select value={formSeverity} onValueChange={(v) => setFormSeverity(v as PLevel)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(P_LEVEL_DEFINITIONS) as PLevel[]).map((p) => (
                            <SelectItem key={p} value={p}>{p} — {P_LEVEL_DEFINITIONS[p].definition.split('.')[0]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Result</label>
                    <Select value={formResult} onValueChange={(v) => setFormResult(v as GovernanceResult)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(RESULT_LABELS) as GovernanceResult[]).map((r) => (
                          <SelectItem key={r} value={r}>{RESULT_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Summary</label>
                    <Textarea
                      placeholder="Brief description of findings or confirmation of absence"
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEntry} disabled={!formWhat.trim() || saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Entry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{PRIVACY_HEADER.title}</AlertTitle>
          <AlertDescription>
            {PRIVACY_HEADER.lines[0]} {PRIVACY_HEADER.lines[1]}
          </AlertDescription>
        </Alert>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No entries yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                Your Governance File tracks what you've reviewed, when, and the outcome. 
                Start by logging your first review entry.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{entry.what_checked}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(entry.when_checked), { addSuffix: true })}
                        <span className="text-muted-foreground">·</span>
                        {CADENCE_DEFINITIONS[entry.cadence].label}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={PLEVEL_VARIANT[entry.severity]}>
                        {entry.severity}
                      </Badge>
                      <Badge variant="outline">
                        {RESULT_LABELS[entry.result]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                {entry.summary && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{entry.summary}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
