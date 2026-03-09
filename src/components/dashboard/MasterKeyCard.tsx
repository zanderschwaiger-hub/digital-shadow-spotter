import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CHECKLIST_ITEMS = [
  { id: 'mfa', label: 'Two-factor authentication enabled' },
  { id: 'password', label: 'Strong unique password set' },
  { id: 'recovery', label: 'Recovery options reviewed' },
  { id: 'app_passwords', label: 'App passwords audited' },
];

interface MasterKeyCardProps {
  primaryEmail: string | null;
}

export function MasterKeyCard({ primaryEmail }: MasterKeyCardProps) {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Load persisted state per user
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`fe-master-key-${user.id}`);
    if (stored) {
      try {
        setChecked(new Set(JSON.parse(stored)));
      } catch {
        // ignore corrupt data
      }
    }
  }, [user]);

  const toggle = (id: string) => {
    if (!user) return;
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(`fe-master-key-${user.id}`, JSON.stringify([...next]));
      return next;
    });
  };

  const completedCount = checked.size;
  const totalCount = CHECKLIST_ITEMS.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Key className="h-4 w-4" />
          Master Key Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!primaryEmail ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Add your primary email in the Inventory to enable this feature.
          </p>
        ) : (
          <>
            <p className="font-medium text-sm mb-1">{primaryEmail}</p>
            <p className="text-xs text-muted-foreground mb-3">
              Self-reported · {completedCount}/{totalCount} checked
            </p>
            <Progress value={progress} className="mb-4" />
            <ul className="space-y-2.5">
              {CHECKLIST_ITEMS.map(item => (
                <li key={item.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`mk-${item.id}`}
                    checked={checked.has(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <Label
                    htmlFor={`mk-${item.id}`}
                    className="text-sm cursor-pointer font-normal leading-snug"
                  >
                    {item.label}
                  </Label>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
