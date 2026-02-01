import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NextAction {
  pillarId: string;
  pillarName: string;
  action: string;
  priority: number;
}

interface NextActionsCardProps {
  actions: NextAction[];
  onActionClick: (pillarId: string) => void;
}

export function NextActionsCard({ actions, onActionClick }: NextActionsCardProps) {
  if (actions.length === 0) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>All Caught Up!</CardTitle>
          </div>
          <CardDescription>
            You've completed all available governance pillars. Great work maintaining your digital footprint!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Next Actions</CardTitle>
        <CardDescription>
          Prioritized steps to strengthen your governance posture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={action.pillarId}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-sm">{action.pillarName}</p>
                <p className="text-xs text-muted-foreground">{action.action}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onActionClick(action.pillarId)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
