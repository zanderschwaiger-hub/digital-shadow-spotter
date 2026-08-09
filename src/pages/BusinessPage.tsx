import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const LEADS_URL = 'https://gyyktrqkkqcasiykxuvt.supabase.co/rest/v1/b2b_leads';
const LEADS_KEY = 'sb_publishable__U5B2zB3HrkvAEIVdKA8Lw_zEa67dI-';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function BusinessPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    company_size: '',
    message: '',
  });

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch(LEADS_URL, {
        method: 'POST',
        headers: {
          apikey: LEADS_KEY,
          Authorization: `Bearer ${LEADS_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          company_name: form.company_name,
          contact_name: form.contact_name,
          email: form.email,
          company_size: form.company_size,
          message: form.message,
        }),
      });
      setStatus(res.status === 201 ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">For teams</p>
          <h1 className="text-2xl font-bold mt-2">Talk to us about your team</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tell us a little about your organisation and we'll get back to you.
          </p>
        </div>

        <Card className="p-6">
          {status === 'success' ? (
            <p className="text-sm font-medium">Thanks — we'll be in touch.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company name</Label>
                <Input id="company_name" required value={form.company_name} onChange={update('company_name')} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Your name</Label>
                <Input id="contact_name" required value={form.contact_name} onChange={update('contact_name')} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" required value={form.email} onChange={update('email')} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_size">Company size</Label>
                <select
                  id="company_size"
                  required
                  value={form.company_size}
                  onChange={update('company_size')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="201-1000">201–1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={form.message} onChange={update('message')} maxLength={1000} rows={4} />
              </div>

              {status === 'error' && (
                <p className="text-sm text-destructive">
                  Something went wrong. Please try again.
                </p>
              )}

              <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send enquiry'
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
