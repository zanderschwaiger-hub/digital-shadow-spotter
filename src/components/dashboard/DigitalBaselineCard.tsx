import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BaselineResult } from '@/lib/baseline-status';

const STATUS_VARIANT: Record<string, 'destructive' | 'secondary' | 'default' | 'outline'> = {
  not_established: 'outline',
  in_progress: 'secondary',
  established: 'default',
};

export function DigitalBaselineCard({ baseline }: { baseline: BaselineResult }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Digital Baseline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant={STATUS_VARIANT[baseline.status]}>
          {baseline.label}
        </Badge>

        {baseline.status !== 'not_established' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Guided task completion</span>
              <span>{baseline.taskPercent}%</span>
            </div>
            <Progress value={baseline.taskPercent} className="h-2" />
          </div>
        )}

        <p className="text-sm text-muted-foreground">{baseline.description}</p>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate(baseline.navigateTo)}
        >
          {baseline.buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
