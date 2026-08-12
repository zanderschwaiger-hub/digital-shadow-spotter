import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { FELogo } from '@/components/FELogo';

export default function MfaChallengePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [factorId, setFactorId] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(true);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let mounted = true;

    const prepare = async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === 'aal2') {
        if (mounted) navigate('/', { replace: true });
        return;
      }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === 'verified');

      if (!verified) {
        if (mounted) navigate('/mfa-setup', { replace: true });
        return;
      }

      if (mounted) {
        setFactorId(verified.id);
        setPreparing(false);
      }
    };

    prepare();

    return () => {
      mounted = false;
    };
  }, [user, loading, navigate]);

  const handleVerify = async () => {
    if (!factorId) return;
    setVerifying(true);
    setError(null);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });

    if (challengeError || !challenge) {
      setError(challengeError?.message ?? 'Could not check that code. Please try again.');
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });

    if (verifyError) {
      setError(verifyError.message);
      setVerifying(false);
      return;
    }

    // Root decides where a returning user lands (saved exposure result or check).
    navigate('/', { replace: true });
  };

  if (loading || preparing) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-background p-4">
      <div className="mx-auto w-full max-w-md py-8 space-y-6">
        <div className="text-center">
          <FELogo size="lg" className="mx-auto mb-4" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Confirm it's you</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              disabled={code.length !== 6 || verifying}
              onClick={handleVerify}
            >
              {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => signOut()}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
