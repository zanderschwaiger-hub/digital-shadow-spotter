import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Who we are</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Digital Guardian is a digital safety platform powered by Freedom Engine. We help individuals reduce their digital exposure through guided, human-in-the-loop actions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>What we collect</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address (for magic link sign-in)</li>
              <li>Account type (personal, creator, or business)</li>
              <li>Inventory data you choose to add (emails, usernames, accounts, domains, phones)</li>
              <li>Task progress and completion history</li>
              <li>Subscription status (via Stripe)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>What we do not collect</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Passwords or MFA codes — ever</li>
              <li>Access to your accounts</li>
              <li>Browsing history or device tracking</li>
              <li>Advertising identifiers</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>How we use your data</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Your data is used solely to power the features you see: tracking your inventory, generating tasks, and showing your progress. We do not sell your data, share it with advertisers, or use it for any purpose unrelated to your account.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Data storage and security</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Data is stored in Supabase (SOC 2 compliant infrastructure), encrypted in transit (TLS) and at rest. Access is restricted by row-level security policies — only you can read your data.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Payments are processed by Stripe. We never see or store your card details. We receive only your subscription status.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your rights</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>You can export, correct, or delete your data at any time from the Settings page. Account deletion removes all associated records permanently.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>For privacy questions or data requests, contact us through the support channel in Settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
