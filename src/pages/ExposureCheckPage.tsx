import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const QUESTIONS = [
  'Do you use a password manager to store your passwords?',
  'Are your most important accounts — email, banking, social media — on unique passwords you have not reused anywhere else?',
  'Do you have two-factor authentication turned on for your email?',
  'Do you have two-factor authentication turned on for your bank or payment accounts?',
  'Do you know which phone number or backup email is attached to your primary email account?',
  'If you lost access to your phone right now, could you still get into your most important accounts?',
  'Have you checked which apps are connected to your Google or Apple account and removed ones you no longer use?',
  'Have you ever checked if your email address has appeared in a data breach?',
  'Do you get notified if someone logs into your accounts from a new device?',
  'Do you use a separate email address for newsletters, signups, and services you do not fully trust?',
  'Do you know what comes up when someone searches your full name online?',
  'Have you reviewed the privacy settings on your social media accounts in the last year?',
  'Do you know if your personal details — address, phone number, age — are listed on any data broker websites?',
  'Do you have a list — even a rough one — of your most important accounts and where to find them?',
  'Do you know what to do in the first hour if your email account gets hacked?',
  'Could someone you trust access your critical accounts or documents if something happened to you?',
  'Do you have a regular habit — even monthly — of checking your digital accounts and security settings?',
  'In the last year, have you taken any action to reduce your digital exposure or clean up old accounts?',
];

type Answer = 'yes' | 'no' | 'unsure';

function bandFor(score: number): 'high' | 'medium' | 'low' {
  if (score <= 6) return 'high';
  if (score <= 13) return 'medium';
  return 'low';
}

const PROBLEM_GROUPS: Array<{ indices: number[]; label: string; tip: string }> = [
  { indices: [0, 1, 2, 3], label: 'Credential gaps detected', tip: 'Passwords and access control' },
  { indices: [4, 5, 6], label: 'Recovery path weaknesses', tip: 'Account recovery and 2FA' },
  { indices: [7, 8, 9], label: 'Monitoring blind spots', tip: 'Breach awareness and alerts' },
  { indices: [10, 11, 12], label: 'Social & public exposure', tip: 'Privacy and footprint' },
  { indices: [13, 14, 15], label: 'No recovery plan documented', tip: 'What to do when things go wrong' },
  { indices: [16, 17], label: 'No review cadence set', tip: 'Regular maintenance' },
];

export default function ExposureCheckPage() {
  const { user, loading: authLoading } = useAuth();
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [submitted, setSubmitted] = useState<{ score: number; band: 'high' | 'medium' | 'low' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const allAnswered = QUESTIONS.every((_, i) => answers[i]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const score = QUESTIONS.reduce((acc, _, i) => acc + (answers[i] === 'yes' ? 1 : 0), 0);
    const band = bandFor(score);
    const answers_json = QUESTIONS.map((q, i) => ({ q, a: answers[i] }));
    await supabase.from('exposure_checks').insert({ score, band, answers_json });

    const notSureCount = Object.values(answers).filter(a => a === 'unsure').length;
    let adjustedBand = band;
    if (notSureCount > 3) {
      if (adjustedBand === 'low') adjustedBand = 'medium';
      else if (adjustedBand === 'medium') adjustedBand = 'high';
    }
    setSubmitted({ score, band: adjustedBand });
    setSubmitting(false);
  };

  if (submitted) {
    const bandLabels = {
      high: 'Significant gaps found',
      medium: 'Some gaps to address',
      low: 'Looking solid',
    } as const;

    const detected = PROBLEM_GROUPS.filter(g =>
      g.indices.some(i => answers[i] === 'no' || answers[i] === 'unsure')
    ).slice(0, 3);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Digital health check</p>
            <div className="text-4xl font-medium">{submitted.score} / 18</div>
            <h1 className="text-xl font-semibold">{bandLabels[submitted.band]}</h1>
            <p className="text-sm text-muted-foreground">
              Here's what your answers suggest.
            </p>
          </div>

          {detected.length > 0 && (
            <div className="space-y-2">
              {detected.map(g => (
                <div
                  key={g.label}
                  className="border-l-4 border-[hsl(var(--severity-medium))] bg-muted/40 rounded-r pl-3 py-2 text-sm"
                >
                  <p className="font-medium">{g.label}</p>
                  <p className="text-xs text-muted-foreground">{g.tip}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <Button asChild className="w-full">
              <Link to="/login">Build my action plan</Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Takes 2 minutes. No credit card needed.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Digital health check</p>
          <h1 className="text-2xl font-bold mt-2">How safe is your digital life?</h1>
          <p className="text-sm text-muted-foreground mt-2">
            18 honest questions about your digital life. No account needed. Takes 3 minutes.
          </p>
        </div>

        <div className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <Card key={i} className="p-4">
              <p className="text-sm font-medium">{i + 1}. {q}</p>
              <div className="flex gap-2 mt-3">
                {(['yes', 'no', 'unsure'] as Answer[]).map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    size="sm"
                    variant={answers[i] === opt ? 'default' : 'outline'}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                  >
                    {opt === 'yes' ? 'Yes' : opt === 'no' ? 'No' : 'Not sure'}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Button
          className="w-full"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Scoring…' : 'See my exposure level'}
        </Button>
      </div>
    </div>
  );
}
