import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

export function PaymentReminderBanner() {
  const { profile } = useAuth();
  const { subscription, dueSoon, pastDue } = useSubscription();

  // Only relevant for Tier 3 users with a subscription record.
  if (!profile || profile.tier_level < 3 || !subscription) return null;

  if (pastDue) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-destructive">Access restricted until payment is updated</p>
            <p className="text-xs text-muted-foreground">
              Tier 3 actions are read-only until your subscription is current.
            </p>
          </div>
          <Button size="sm" variant="destructive">Update Payment</Button>
        </div>
      </Card>
    );
  }

  if (dueSoon) {
    return (
      <Card className="border-amber-500/40 bg-amber-500/5 p-4">
        <p className="text-sm font-semibold">Payment due soon</p>
        <p className="text-xs text-muted-foreground">
          Your subscription renews within 3 days.
        </p>
      </Card>
    );
  }

  return null;
}
