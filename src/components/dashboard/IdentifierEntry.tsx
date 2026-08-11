import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Mail, Phone } from 'lucide-react';

export const MAX_EMAILS = 2;
export const MAX_PHONES = 1;

interface IdentifierEntryProps {
  userId: string;
  initialEmails?: string[];
  initialPhones?: string[];
  onDone: () => void;
}

type Kind = 'email' | 'phone';

export function IdentifierEntry({
  userId,
  initialEmails = [],
  initialPhones = [],
  onDone,
}: IdentifierEntryProps) {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [phones, setPhones] = useState<string[]>(initialPhones);
  const [kind, setKind] = useState<Kind>(initialEmails.length >= MAX_EMAILS ? 'phone' : 'email');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailsFull = emails.length >= MAX_EMAILS;
  const phonesFull = phones.length >= MAX_PHONES;
  const atCap = kind === 'email' ? emailsFull : phonesFull;

  const handleAdd = async () => {
    const entry = value.trim();
    if (!entry) return;

    setSaving(true);
    setError(null);

    if (kind === 'email') {
      const { error: insertError } = await supabase.from('inventory_emails').insert({
        user_id: userId,
        email: entry,
        is_primary: emails.length === 0,
      });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setEmails((prev) => [...prev, entry]);
    } else {
      const { error: insertError } = await supabase.from('inventory_phones').insert({
        user_id: userId,
        phone: entry,
      });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setPhones((prev) => [...prev, entry]);
    }

    setValue('');
    setSaving(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Add what you use</CardTitle>
        <p className="text-sm text-muted-foreground">
          One at a time. Add an email you use most, then a phone number if you'd like.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={kind === 'email' ? 'default' : 'outline'}
            onClick={() => {
              setKind('email');
              setValue('');
              setError(null);
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kind === 'phone' ? 'default' : 'outline'}
            onClick={() => {
              setKind('phone');
              setValue('');
              setError(null);
            }}
          >
            <Phone className="mr-2 h-4 w-4" />
            Phone
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {kind === 'email'
              ? `${emails.length} of ${MAX_EMAILS} emails added`
              : `${phones.length} of ${MAX_PHONES} phone numbers added`}
          </p>

          <Input
            type={kind === 'email' ? 'email' : 'tel'}
            placeholder={kind === 'email' ? 'you@example.com' : '+1 555 000 0000'}
            value={value}
            disabled={saving || atCap}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />

          {atCap ? (
            <p className="text-xs text-muted-foreground">
              You've added the maximum for your account.
            </p>
          ) : (
            <Button className="w-full" onClick={handleAdd} disabled={saving || !value.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {kind === 'email' ? 'Add this email' : 'Add this phone number'}
            </Button>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {(emails.length > 0 || phones.length > 0) && (
          <div className="space-y-2">
            {emails.map((e) => (
              <div key={e} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span className="break-all">{e}</span>
              </div>
            ))}
            {phones.map((p) => (
              <div key={p} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}

        <Button className="w-full" variant="secondary" disabled={emails.length === 0} onClick={onDone}>
          Continue to my action plan
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          We don't store passwords or access your accounts. Your data stays private.
        </p>
      </CardContent>
    </Card>
  );
}
