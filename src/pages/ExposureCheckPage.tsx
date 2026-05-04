import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const QUESTIONS = [
  'Do you use a password manager for most of your accounts?',
  'Is two-factor authentication enabled on your primary email?',
  'Is two-factor authentication enabled on your bank or financial accounts?',
  'Do you use unique passwords for every important account?',
  'Have you reviewed which apps have access to your Google/Apple account in the last year?',
  'Do you know which email address is the recovery contact for your bank account?',
  'Do you have a recovery phone number set on your primary email?',
  'Is your phone protected with a PIN, passcode, or biometric lock?',
  'Have you checked HaveIBeenPwned (or similar) for your primary email?',
  'Do you avoid reusing your primary email for low-trust signups?',
  'Have you removed yourself from any data broker site in the past year?',
  'Do you know what personal information appears when someone Googles your name?',
  'Are your social media profiles set to the privacy level you actually want?',
  'Do you have a written list of which accounts matter most to you?',
  'Do you know what to do in the first hour if your email is compromised?',
  'Have you set up account recovery methods you can actually access?',
  'Do you regularly review login alerts from your important accounts?',
  'Do you have a backup of your most important documents?',
];

type Answer = 'yes' | 'no' | 'unsure';

function bandFor(score: number): 'high' | 'medium' | 'low' {
  if (score <= 6) return 'high';
  if (score <= 13) return 'medium';
  return 'low';
}

export default function ExposureCheckPage() {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [submitted, setSubmitted] = useState<{ score: number; band: 'high' | 'medium' | 'low' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = QUESTIONS.every((_, i) => answers[i]);

  const handleSubmit = async () => {
    setSubmitting(true);
    // "Not sure" counts as No. Score = number of Yes answers (0..18).
    const score = QUESTIONS.reduce((acc, _, i) => acc + (answers[i] === 'yes' ? 1 : 0), 0);
    const band = bandFor(score);
    const answers_json = QUESTIONS.map((q, i) => ({ q, a: answers[i] }));
    await supabase.from('exposure_checks').insert({ score, band, answers_json });
    setSubmitted({ score, band });
    setSubmitting(false);
  };

  if (submitted) {
    const labels = {
      high: 'High exposure',
      medium: 'Medium exposure',
      low: 'Low exposure',
    } as const;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Tier 0 — Exposure Check</p>
            <h1 className="text-3xl font-bold mt-2">{labels[submitted.band]}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Score: {submitted.score} / 18
            </p>
          </div>
          <p className="text-sm">
            This is a starting signal, not a verdict. The next step is to establish a baseline so you have
            a written record of your controls and recovery paths.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Start Baseline</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Tier 0 — Exposure Check</p>
          <h1 className="text-2xl font-bold mt-2">18 questions. No account needed.</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Answer honestly. "Not sure" counts as No. Your answers are not linked to your identity.
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
