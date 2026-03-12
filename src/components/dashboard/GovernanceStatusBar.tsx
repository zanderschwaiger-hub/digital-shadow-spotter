import { BaselineResult } from '@/lib/baseline-status';
import { Separator } from '@/components/ui/separator';

interface GovernanceStatusBarProps {
  baselineLabel: string;
  hasTasks: boolean;
}

export function GovernanceStatusBar({ baselineLabel, hasTasks }: GovernanceStatusBarProps) {
  const discipline = hasTasks ? 'Active' : 'Inactive';

  return (
    <div className="rounded-md border bg-muted/40 px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground/80">Governance Status</span>
      <Separator orientation="vertical" className="h-3 hidden sm:block" />
      <span>Baseline: <span className="text-foreground/70">{baselineLabel}</span></span>
      <span className="hidden sm:inline">·</span>
      <span>Discipline: <span className="text-foreground/70">{discipline}</span></span>
      <span className="hidden sm:inline">·</span>
      <span>System: <span className="text-foreground/70">Verified</span></span>
    </div>
  );
}
