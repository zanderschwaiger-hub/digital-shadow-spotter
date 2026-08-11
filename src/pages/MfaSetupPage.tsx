import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Check } from 'lucide-react';
import { FELogo } from '@/components/FELogo';

export default function MfaSetupPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [preparing, setPreparing] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [savedAck, setSavedAck] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let mounted = true;

    const prepare = async () => {
      setPreparing(true);
      setError(null);

      // If a verified factor already exists, this step is done.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified');
      if (verifiedFactor) {
        if (mounted) navigate('/welcome', { replace: true });
        return;
      }

      // Clear any abandoned, unverified enrollments so enroll() succeeds.
      for (const f of factors?.totp?.filter((x) => x.status === 'unverified') ?? []) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Authenticator ${Date.now()}`,
      });

      if (!mounted) return;

      if (enrollError || !data) {
        setError(enrollError?.message ?? 'Could not start setup. Please try again.');
        setPreparing(false);
        return;
      }

      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setPreparing(false);
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
      setError(challengeError?.message ?? 'Could not verify that code. Please try again.');
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

    setVerified(true);
    setVerifying(false);
  };

  const copySecret = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || preparing) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-[100dvh] overflow-y-auto bg-background p-4">
        <div className="mx-auto w-full max-w-md py-8">
          <Card>
            <CardHeader>
              <CardTitle>Save your backup key</CardTitle>
              <p className="text-sm text-muted-foreground">
                Keep this key somewhere safe and private. It is the only way to set your authenticator
                up again if you lose your device. We will not show it again.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 font-mono text-sm break-all">
                {secret}
              </div>
              <Button variant="outline" className="w-full" onClick={copySecret}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied' : 'Copy backup key'}
              </Button>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={savedAck}
                  onChange={(e) => setSavedAck(e.target.checked)}
                />
                <span>I've saved these</span>
              </label>

              <Button
                className="w-full"
                disabled={!savedAck}
                onClick={() => navigate('/welcome', { replace: true })}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
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
            <CardTitle>Set up your account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Scan this with your authenticator app.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {qr && (
              <div className="flex justify-center rounded-lg bg-white p-4">
                <img src={qr} alt="Authenticator setup QR code" className="h-44 w-44" />
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Can't scan? Enter this key manually:
              </p>
              <div className="rounded-lg border bg-muted/40 p-3 font-mono text-xs break-all">
                {secret}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">Enter the 6-digit code from your app</p>
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              disabled={code.length !== 6 || verifying}
              onClick={handleVerify}
            >
              {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
