import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Smartphone, Users, ShieldAlert, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { CONTAINMENT_PLAYBOOKS, type Playbook } from '@/lib/containment-playbooks';

const ICON_MAP: Record<string, React.ElementType> = {
  Mail, Smartphone, Users, ShieldAlert, Globe,
};

export default function PlaybooksPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_playbook_progress')
      .select('playbook_id, step_id')
      .eq('user_id', user.id);
    if (data) {
      setCompletedSteps(new Set(data.map(r => `${r.playbook_id}::${r.step_id}`)));
    }
    setLoading(false);
  };

  const toggleStep = useCallback(async (playbookId: string, stepId: string) => {
    if (!user) return;
    const key = `${playbookId}::${stepId}`;
    const isCompleted = completedSteps.has(key);

    if (isCompleted) {
      setCompletedSteps(prev => { const n = new Set(prev); n.delete(key); return n; });
      await supabase
        .from('user_playbook_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('playbook_id', playbookId)
        .eq('step_id', stepId);
      logEvent('playbook_step_unchecked', { playbook_id: playbookId, step_id: stepId });
    } else {
      setCompletedSteps(prev => new Set(prev).add(key));
      await supabase
        .from('user_playbook_progress')
        .insert({ user_id: user.id, playbook_id: playbookId, step_id: stepId });
      logEvent('playbook_step_completed', { playbook_id: playbookId, step_id: stepId });
    }
  }, [user, completedSteps, logEvent]);

  const getPlaybookProgress = (playbook: Playbook) => {
    const done = playbook.steps.filter(s => completedSteps.has(`${playbook.id}::${s.id}`)).length;
    return { done, total: playbook.steps.length };
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

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Containment Playbooks</h1>
          <p className="text-sm text-muted-foreground">
            Structured response checklists for when an account or identity element may be compromised. No automated actions — just guided steps you control.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {CONTAINMENT_PLAYBOOKS.map(playbook => {
            const Icon = ICON_MAP[playbook.icon] || ShieldAlert;
            const { done, total } = getPlaybookProgress(playbook);
            const allDone = done === total && total > 0;

            return (
              <AccordionItem key={playbook.id} value={playbook.id} className="border rounded-lg px-1">
                <AccordionTrigger className="hover:no-underline px-3">
                  <div className="flex items-center gap-3 text-left">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        {playbook.title}
                        {allDone && (
                          <Badge variant="secondary" className="text-xs">Complete</Badge>
                        )}
                        {done > 0 && !allDone && (
                          <Badge variant="outline" className="text-xs">{done}/{total}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{playbook.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-4">
                  <div className="space-y-3">
                    {playbook.steps.map((step, idx) => {
                      const checked = completedSteps.has(`${playbook.id}::${step.id}`);
                      return (
                        <div
                          key={step.id}
                          className="flex gap-3 items-start p-3 rounded-md border bg-muted/30"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleStep(playbook.id, step.id)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium ${checked ? 'line-through text-muted-foreground' : ''}`}>
                              <span className="text-muted-foreground mr-1.5">{idx + 1}.</span>
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                            {step.link && (
                              <button
                                onClick={() => navigate(step.link!)}
                                className="text-xs text-primary hover:underline mt-1 inline-block"
                              >
                                {step.linkLabel || 'Go to related page'} →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </AppLayout>
  );
}
