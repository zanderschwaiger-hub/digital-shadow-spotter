import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import type { PillarWithProgress } from '@/hooks/useGovernance';

interface PillarCardProps {
  pillar: PillarWithProgress;
  onStart: (pillarId: string) => void;
  onContinue: (pillarId: string) => void;
}

const tierLabels: Record<number, string> = {
  1: 'Baseline',
  2: 'Guided Cleanup',
  3: 'Governance Agent',
};

export function PillarCard({ pillar, onStart, onContinue }: PillarCardProps) {
  const isCompleted = !!pillar.progress?.completed_at;
  const isStarted = !!pillar.progress && !isCompleted;
  const score = pillar.progress?.score ?? 0;

  if (!pillar.isAccessible) {
    return (
      <Card className="opacity-60 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{pillar.name}</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {tierLabels[pillar.minimum_tier]} required
            </Badge>
          </div>
          <CardDescription className="text-sm line-clamp-2">
            {pillar.description}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={isCompleted ? 'border-primary/30 bg-primary/5' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{pillar.name}</CardTitle>
          </div>
          {isCompleted && (
            <Badge className="bg-primary/10 text-primary border-0">
              Complete
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {pillar.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStarted && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{score}%</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        )}
        
        {!isCompleted && (
          <Button
            size="sm"
            variant={isStarted ? 'default' : 'outline'}
            className="w-full"
            onClick={() => isStarted ? onContinue(pillar.id) : onStart(pillar.id)}
          >
            {isStarted ? 'Continue' : 'Start Assessment'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
