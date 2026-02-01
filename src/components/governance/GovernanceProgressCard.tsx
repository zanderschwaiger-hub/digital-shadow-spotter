import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Target } from 'lucide-react';

interface GovernanceProgressCardProps {
  total: number;
  completed: number;
  percentage: number;
  tierLevel: number;
}

const tierNames: Record<number, string> = {
  1: 'Baseline',
  2: 'Guided Cleanup',
  3: 'Governance Agent',
};

export function GovernanceProgressCard({ 
  total, 
  completed, 
  percentage,
  tierLevel 
}: GovernanceProgressCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Governance Progress</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            <span>Tier: {tierNames[tierLevel]}</span>
          </div>
        </div>
        <CardDescription>
          Your journey through the 12 governance pillars
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Completion</span>
            <span className="font-medium">{completed} of {total} pillars</span>
          </div>
          <Progress value={percentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {percentage}% complete
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-background border">
            <p className="text-2xl font-bold text-primary">{completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background border">
            <p className="text-2xl font-bold">{total - completed}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background border">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
