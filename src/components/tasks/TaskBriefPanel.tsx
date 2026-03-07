import { TaskBrief, LockedBrief } from '@/lib/task-briefs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck, Clock, ListChecks, AlertTriangle,
  Lock, CheckCircle2, FileWarning, Target, Wrench,
} from 'lucide-react';

interface TaskBriefPanelProps {
  brief: TaskBrief;
  locked?: false;
}

interface LockedBriefPanelProps {
  brief: LockedBrief;
  locked: true;
  taskTitle: string;
}

type Props = TaskBriefPanelProps | LockedBriefPanelProps;

export function TaskBriefPanel(props: Props) {
  if (props.locked) {
    return <LockedPanel brief={props.brief} taskTitle={props.taskTitle} />;
  }
  return <UnlockedPanel brief={props.brief} />;
}

function LockedPanel({ brief, taskTitle }: { brief: LockedBrief; taskTitle: string }) {
  return (
    <Card className="border-border/50 bg-muted/30">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start gap-2">
          <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Task Locked</p>
            <p className="text-xs text-muted-foreground mt-1">{brief.reason}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Complete these first:</p>
          <ul className="space-y-1.5">
            {brief.blockedBy.map((dep, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />
                {dep}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function UnlockedPanel({ brief }: { brief: TaskBrief }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Why it matters */}
        <BriefSection
          icon={<Target className="h-4 w-4 text-primary" />}
          label="Why this matters"
          content={brief.whyItMatters}
        />

        {/* What it protects */}
        <BriefSection
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          label="What this protects"
          content={brief.whatItProtects}
        />

        <Separator />

        {/* Effort and prerequisites side by side */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Estimated effort</span>
            </div>
            <Badge variant="outline" className="text-xs">{brief.estimatedEffort}</Badge>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Prerequisites</span>
            </div>
            <ul className="space-y-1">
              {brief.prerequisites.map((p, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-muted-foreground/60 mt-px">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* What to prepare */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Prepare before starting</span>
          </div>
          <ul className="space-y-1.5">
            {brief.whatToPrepare.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-muted-foreground/60 mt-px">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Success condition */}
        <BriefSection
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          label="Success condition"
          content={brief.successCondition}
        />

        {/* Common mistake */}
        <div className="rounded-md bg-destructive/5 border border-destructive/10 p-3">
          <div className="flex items-start gap-2">
            <FileWarning className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-destructive">Common mistake</p>
              <p className="text-xs text-muted-foreground mt-1">{brief.commonMistake}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BriefSection({ icon, label, content }: { icon: React.ReactNode; label: string; content: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm mt-0.5">{content}</p>
      </div>
    </div>
  );
}
