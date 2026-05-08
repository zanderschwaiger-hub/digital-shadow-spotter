import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
    if (!user || !checked) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ authorization_confirmed: true })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Could not save confirmation', description: error.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

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
            I confirm that I own or am authorized to manage the accounts and information in scope.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 py-2">
          <Checkbox
            id="authorization-confirm"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
          />
          <Label htmlFor="authorization-confirm" className="leading-snug cursor-pointer">
            I confirm I am authorized to manage these accounts and information.
          </Label>
        </div>

        <Button onClick={handleConfirm} disabled={!checked || submitting}>
          {submitting ? 'Confirming…' : 'Confirm'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
