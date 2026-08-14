import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { FELogo } from '@/components/FELogo';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signup' | 'signin'>(
    searchParams.get('mode') === 'signin' ? 'signin' : 'signup',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUpWithPassword, signInWithPassword, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);

    const { error: authError } =
      mode === 'signup'
        ? await signUpWithPassword(parsed.data.email, parsed.data.password)
        : await signInWithPassword(parsed.data.email, parsed.data.password);

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    localStorage.setItem('fe_has_account', '1');

    // The session is created immediately; routing is handled by the protected routes.
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-background p-4">
      <div className="mx-auto w-full max-w-md py-10 space-y-6">
        <div className="text-center">
          <FELogo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Freedom Engine</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{mode === 'signup' ? 'Create your account' : 'Sign in'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {mode === 'signup'
                  ? 'Save your result and get your action plan.'
                  : 'Welcome back.'}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </Button>

              <button
                type="button"
                className="w-full text-sm text-muted-foreground underline"
                onClick={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup');
                  setError(null);
                }}
              >
                {mode === 'signup'
                  ? 'Already have an account? Sign in'
                  : 'Need an account? Create one'}
              </button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
