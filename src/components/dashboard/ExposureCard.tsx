import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExposureCardProps {
  level: 'low' | 'medium' | 'high';
  reason: string;
}

export function ExposureCard({ level, reason }: ExposureCardProps) {
  const config = {
    low: {
      icon: ShieldCheck,
      label: 'Low Exposure',
      bg: 'bg-[hsl(var(--severity-low))]',
      text: 'text-[hsl(var(--severity-low-foreground))]',
      border: 'border-[hsl(var(--severity-low))]'
    },
    medium: {
      icon: Shield,
      label: 'Medium Exposure',
      bg: 'bg-[hsl(var(--severity-medium))]',
      text: 'text-[hsl(var(--severity-medium-foreground))]',
      border: 'border-[hsl(var(--severity-medium))]'
    },
    high: {
      icon: ShieldAlert,
      label: 'High Exposure',
      bg: 'bg-[hsl(var(--severity-high))]',
      text: 'text-[hsl(var(--severity-high-foreground))]',
      border: 'border-[hsl(var(--severity-high))]'
    }
  };

  const { icon: Icon, label, bg, text, border } = config[level];

  return (
    <Card className={cn('border-2', border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Exposure Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl', bg)}>
            <Icon className={cn('h-7 w-7', text)} />
          </div>
          <div>
            <p className="text-xl font-bold">{label}</p>
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}