import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const CURRENT_AUTHORIZATION_VERSION = 'v1.0';

interface Props {
  open: boolean;
  onConfirmed: () => void;
}

export function AuthorizationConfirmModal({ open, onConfirmed }: Props) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!user || !checked || submitting) return;
    setSubmitting(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        authorization_confirmed: true,
        authorization_confirmed_at: new Date().toISOString(),
        authorization_version: CURRENT_AUTHORIZATION_VERSION,
      })
      .eq('user_id', user.id);

    if (profileError) {
      toast({ title: 'Confirmation failed', description: profileError.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    const { error: auditError } = await supabase
      .from('authorization_audit_logs')
      .insert({
        user_id: user.id,
        authorization_version: CURRENT_AUTHORIZATION_VERSION,
        user_agent: navigator.userAgent,
        ip_address: null,
      });

    if (auditError) {
      toast({ title: 'Audit log failed', description: auditError.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    await refreshProfile();
    setSubmitting(false);
    onConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-y-auto max-h-[90vh] rounded-lg border bg-background p-6 shadow-lg">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Before you begin</h2>
            <p className="text-sm text-muted-foreground">
              Before accessing your dashboard, confirm you are authorized to manage the accounts and information in scope.
            </p>
          </div>

          <div className="flex items-start gap-3 py-2">
            <Checkbox
              id="authorization-confirm"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              disabled={submitting}
            />
            <Label htmlFor="authorization-confirm" className="leading-snug cursor-pointer">
              Freedom Engine only works properly when you are authorized to manage the accounts and information being scanned. I confirm I have that authorization.
            </Label>
          </div>

          <Button onClick={handleConfirm} disabled={!checked || submitting} className="w-full mt-6">
            {submitting ? 'Confirming…' : 'Continue to Freedom Engine'}
          </Button>
        </div>
      </div>
    </div>
  );
}
