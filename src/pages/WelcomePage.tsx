import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

const BAND_LABEL: Record<string, string> = {
  exposed: 'EXPOSED — You are one failure away from losing access.',
  fragile: 'FRAGILE — Your system works, until something goes wrong.',
  structured: 'STRUCTURED — You have a base, but it may not hold under pressure.',
};

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [check, setCheck] = useState<{ score: number; band: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from('exposure_checks')
        .select('score, band')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (data) setCheck({ score: data.score, band: data.band });
      setChecking(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-background p-4">
      <div className="mx-auto w-full max-w-md py-10">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <CardTitle className="text-2xl">Welcome — you're in.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {check ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Your saved result
                </p>
                <p className="mt-1 text-3xl font-medium">{check.score} / 18</p>
                <p className="text-sm">{BAND_LABEL[check.band] ?? check.band}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Saved to your account.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Your account is ready. You can run the exposure check any time.
              </p>
            )}

            <Button className="w-full" onClick={() => navigate('/dashboard', { replace: true })}>
              Go to my dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
