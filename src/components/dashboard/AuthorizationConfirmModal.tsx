import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

  const handleConfirm = async () => {
    if (!user || !checked || submitting) return;
    setSubmitting(true);

    // Step 1: Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        authorization_confirmed: true,
        authorization_confirmed_at: new Date().toISOString(),
        authorization_version: CURRENT_AUTHORIZATION_VERSION,
      })
      .eq('user_id', user.id);

    if (profileError) {
      toast({
        title: 'Confirmation failed',
        description: profileError.message,
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    // Step 2: Write audit log — must succeed
    const { error: auditError } = await supabase
      .from('authorization_audit_logs')
      .insert({
        user_id: user.id,
        authorization_version: CURRENT_AUTHORIZATION_VERSION,
        user_agent: navigator.userAgent,
        ip_address: null,
      });

    if (auditError) {
      toast({
        title: 'Audit log failed — confirmation not saved',
        description: auditError.message,
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    // Step 3: Sync profile context, then unlock
    await refreshProfile();
    setSubmitting(false);
    onConfirmed();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="[&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Before you begin</DialogTitle>
          <DialogDescription>
            Before accessing your dashboard, confirm you are authorized to manage the accounts and information in scope.
          </DialogDescription>
        </DialogHeader>

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

        <Button onClick={handleConfirm} disabled={!checked || submitting}>
          {submitting ? 'Confirming…' : 'Confirm'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
