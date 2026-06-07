import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Freedom Engine</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Agreement</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>By creating an account, you agree to these Terms of Service and the Privacy Policy. If you do not agree, do not use the service.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>What the service is</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Digital Guardian is a personal digital safety platform. It guides you through tasks to reduce your digital exposure, organize your accounts, and prepare for incidents. We guide, you act.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>What the service is not</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Not a cybersecurity firm</li>
              <li>Not a legal advisor</li>
              <li>Not an incident response service</li>
              <li>Not an automated agent that acts on your accounts</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscription and billing</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscription: CA$13.99 per month</li>
              <li>7-day free trial; a valid card is required upfront</li>
              <li>Cancel any time before the trial ends to avoid charges</li>
              <li>Billing handled by Stripe</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your account</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Authentication uses email magic links — no passwords. The email used to sign in must match the email used for your subscription. You are responsible for keeping access to that email secure.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Acceptable use</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Use the service only for your own digital safety practice. Do not use it to track, surveil, or take action against any other person.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Limitation of liability</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>The service is provided "as is" without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Changes to these terms</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>We may update these terms from time to time. Material changes will be communicated through the app. Continued use after changes constitutes acceptance.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>For questions about these terms, contact us through the support channel in Settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
