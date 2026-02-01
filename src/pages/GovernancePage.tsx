import { AppLayout } from '@/components/layout/AppLayout';
import { useGovernance } from '@/hooks/useGovernance';
import { useToast } from '@/hooks/use-toast';
import { PillarCard } from '@/components/governance/PillarCard';
import { NextActionsCard } from '@/components/governance/NextActionsCard';
import { GovernanceProgressCard } from '@/components/governance/GovernanceProgressCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function GovernancePage() {
  const { 
    pillars, 
    loading, 
    error, 
    getNextActions, 
    getOverallProgress,
    startPillar,
    tierLevel,
  } = useGovernance();
  const { toast } = useToast();

  const handleStartPillar = async (pillarId: string) => {
    const { error } = await startPillar(pillarId);
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Pillar Started',
        description: 'Begin your assessment to strengthen this governance area.',
      });
    }
  };

  const handleContinuePillar = (pillarId: string) => {
    // For now, just show a toast - assessment flow will be built next
    toast({
      title: 'Continue Assessment',
      description: 'Assessment flow coming soon!',
    });
  };

  const handleActionClick = (pillarId: string) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (pillar?.progress) {
      handleContinuePillar(pillarId);
    } else {
      handleStartPillar(pillarId);
    }
  };

  const nextActions = getNextActions();
  const progress = getOverallProgress();

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Governance</h1>
          <p className="text-muted-foreground">
            Build your security posture through 12 governance pillars
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GovernanceProgressCard 
            total={progress.total}
            completed={progress.completed}
            percentage={progress.percentage}
            tierLevel={tierLevel}
          />
          <NextActionsCard 
            actions={nextActions} 
            onActionClick={handleActionClick}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">All Pillars</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map(pillar => (
              <PillarCard
                key={pillar.id}
                pillar={pillar}
                onStart={handleStartPillar}
                onContinue={handleContinuePillar}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
