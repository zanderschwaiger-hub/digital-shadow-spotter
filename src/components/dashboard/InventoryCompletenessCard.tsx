import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { InventoryCounts, calculateInventoryCompleteness } from '@/lib/types';
import { User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InventoryCompletenessCardProps {
  counts: InventoryCounts;
}

export function InventoryCompletenessCard({ counts }: InventoryCompletenessCardProps) {
  const completeness = calculateInventoryCompleteness(counts);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Inventory Completeness
        </CardTitle>
        <Link to="/inventory">
          <Button variant="ghost" size="sm" className="text-xs">
            Manage
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-bold">{completeness}%</span>
              <span className="text-sm text-muted-foreground">of recommended data</span>
            </div>
            <Progress value={completeness} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emails</span>
              <span className="font-medium">{counts.emails}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accounts</span>
              <span className="font-medium">{counts.accounts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usernames</span>
              <span className="font-medium">{counts.usernames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phones</span>
              <span className="font-medium">{counts.phones}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Domains</span>
              <span className="font-medium">{counts.domains}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}