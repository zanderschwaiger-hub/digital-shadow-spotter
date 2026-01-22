import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Key, Check, X } from 'lucide-react';

interface MasterKeyCardProps {
  primaryEmail: string | null;
  checklistItems: {
    label: string;
    completed: boolean;
  }[];
}

export function MasterKeyCard({ primaryEmail, checklistItems }: MasterKeyCardProps) {
  const completedCount = checklistItems.filter(item => item.completed).length;
  const progress = checklistItems.length > 0 
    ? (completedCount / checklistItems.length) * 100 
    : 0;

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
            <p className="font-medium text-sm mb-3">{primaryEmail}</p>
            <Progress value={progress} className="mb-4" />
            <ul className="space-y-2">
              {checklistItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  {item.completed ? (
                    <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}