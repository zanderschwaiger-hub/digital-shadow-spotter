import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/lib/types';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { ExternalLink, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface AlertsCardProps {
  alerts: Alert[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const recentAlerts = alerts
    .filter(a => !a.resolved_at)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Latest Alerts
        </CardTitle>
        <Link to="/signals">
          <Button variant="ghost" size="sm" className="text-xs">
            View All
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No active alerts. Your footprint looks clean.
          </p>
        ) : (
          recentAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className="flex items-start justify-between rounded-lg border p-3 gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{alert.title}</p>
                {alert.details && (
                  <p className="text-xs text-muted-foreground truncate">{alert.details}</p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}