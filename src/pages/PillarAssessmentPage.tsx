import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePillarProgress } from '@/hooks/usePillarProgress';
import { PILLARS, TOTAL_PILLARS } from '@/lib/pillars';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function PillarAssessmentPage() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { currentPillar, allComplete, completePillar, loading } = usePillarProgress();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const requested = parseInt(index || '0', 10);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!requested || requested < 1 || requested > TOTAL_PILLARS) {
    return <Navigate to={`/assessment/pillar/${Math.min(currentPillar, TOTAL_PILLARS)}`} replace />;
  }

  if (allComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  // Block any pillar that isn't the current one (no skipping, no revisiting completed).
  if (requested !== currentPillar) {
    return <Navigate to={`/assessment/pillar/${currentPillar}`} replace />;
  }

  const pillar = PILLARS.find((p) => p.index === requested)!;

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await completePillar(requested);
      // If this was the last pillar, also call complete_baseline.
      if (requested === TOTAL_PILLARS) {
        const { error } = await supabase.rpc('complete_baseline');
        if (error) throw error;
        await refreshProfile();
        toast({ title: 'Baseline complete', description: 'You have unlocked Tier 1.' });
        navigate('/dashboard', { replace: true });
        return;
      }
      toast({ title: `Pillar ${requested} complete`, description: `Unlocked pillar ${requested + 1}.` });
      navigate(`/assessment/pillar/${requested + 1}`, { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      toast({ title: 'Could not complete pillar', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Pillar {requested} of {TOTAL_PILLARS}
        </p>
        <h1 className="text-2xl font-bold">{pillar.name}</h1>
        <p className="text-sm text-muted-foreground">{pillar.description}</p>

        <Card className="space-y-4 p-6">
          <p className="text-sm">
            Confirm you have reviewed and addressed this pillar in your own setup. You will unlock the
            next pillar once you complete this one. Pillars must be completed in order.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleComplete} disabled={submitting}>
              {submitting ? 'Saving…' : `Mark Pillar ${requested} complete`}
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        </Card>

        <div className="text-xs text-muted-foreground">
          Progress: {requested - 1} / {TOTAL_PILLARS} completed
        </div>
      </div>
    </AppLayout>
  );
}
