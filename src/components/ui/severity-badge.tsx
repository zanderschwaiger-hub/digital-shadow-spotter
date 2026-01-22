import { cn } from '@/lib/utils';
import { Severity } from '@/lib/types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
  className?: string;
}

export function SeverityBadge({ severity, showIcon = true, className }: SeverityBadgeProps) {
  const config = {
    high: {
      label: 'High',
      icon: AlertTriangle,
      className: 'severity-high'
    },
    medium: {
      label: 'Medium', 
      icon: AlertCircle,
      className: 'severity-medium'
    },
    low: {
      label: 'Low',
      icon: Info,
      className: 'severity-low'
    }
  };

  const { label, icon: Icon, className: severityClass } = config[severity];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      severityClass,
      className
    )}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
}