import { useState, useMemo } from 'react';
import { TaskBrief } from '@/lib/task-briefs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, ClipboardCheck } from 'lucide-react';

export interface ReadinessChecklistItem {
  id: string;
  label: string;
}

interface ReadinessChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  brief: TaskBrief;
  onConfirm: () => void;
}

/**
 * Derives a deterministic checklist from an existing TaskBrief.
 * No AI, no randomness — items map directly to brief fields.
 */
function deriveChecklistItems(brief: TaskBrief): ReadinessChecklistItem[] {
  const items: ReadinessChecklistItem[] = [];

  // 1. Prerequisites reviewed
  items.push({
    id: 'prereqs_reviewed',
    label: brief.prerequisites[0] === 'None — this task can be started immediately.'
      ? 'Confirmed: no prerequisites required for this task'
      : `Prerequisites reviewed: ${brief.prerequisites.join('; ')}`,
  });

  // 2. Required access/accounts ready — from whatToPrepare
  brief.whatToPrepare.forEach((prep, i) => {
    items.push({
      id: `prepare_${i}`,
      label: `Ready: ${prep}`,
    });
  });

  // 3. Success condition understood
  items.push({
    id: 'success_understood',
    label: `Success condition understood: ${brief.successCondition}`,
  });

  // 4. Common mistake acknowledged
  items.push({
    id: 'mistake_acknowledged',
    label: `Warning acknowledged: ${brief.commonMistake}`,
  });

  return items;
}

export function ReadinessChecklist({ open, onOpenChange, taskTitle, brief, onConfirm }: ReadinessChecklistProps) {
  const items = useMemo(() => deriveChecklistItems(brief), [brief]);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const allChecked = checked.size === items.length;

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!allChecked) return;
    setChecked(new Set());
    onConfirm();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setChecked(new Set());
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Pre-Start Readiness
          </DialogTitle>
          <DialogDescription>
            Confirm each item before starting <strong>"{taskTitle}"</strong>.
            All items must be checked to proceed.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-3 py-2">
          {items.map(item => (
            <div key={item.id} className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={checked.has(item.id)}
                onCheckedChange={() => toggle(item.id)}
                className="mt-0.5"
              />
              <Label
                htmlFor={item.id}
                className="text-sm leading-snug cursor-pointer font-normal text-foreground"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span>Readiness confirmation is logged. This does not start the task — an approval step follows.</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!allChecked}>
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            Confirm Ready ({checked.size}/{items.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
