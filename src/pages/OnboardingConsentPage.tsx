import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { createStarterTasks } from '@/lib/starterTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Loader2 } from 'lucide-react';
import { FELogo } from '@/components/FELogo';
import { useToast } from '@/hooks/use-toast';

const CONSENT_ITEMS = [
  {
    category: 'What We Collect',
    items: [
      'Email addresses you provide for breach checks',
      'Usernames and handles you add to your inventory',
      'Phone numbers (optional) for comprehensive review coverage',
      'Account names and categories for organization',
      'Domain names (optional) for business owners'
    ]
  },
  {
    category: 'What We Do',
    items: [
      'Check your emails against known breach databases (via lawful APIs)',
      'Provide guided checklists for securing your accounts',
      'Track your data broker opt-out requests',
      'Generate personalized security tasks with your approval',
      'Send alerts when new exposures are detected'
    ]
  },
  {
    category: 'What We NEVER Do',
    items: [
      'Access or log into your accounts on your behalf',
      'Store your passwords, session cookies, or credentials',
      'Perform hacking, exploitation, or unauthorized access',
      'Scrape websites in violation of their terms of service',
      'Share or sell your personal information to third parties',
      'Take any action without your explicit confirmation'
    ],
    isNegative: true
  }
];

export default function OnboardingConsentPage() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { logEvent } = useAuditLog();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!accepted || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          consent_accepted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Create starter tasks for the new user
      const { success: tasksCreated, error: tasksError } = await createStarterTasks(user.id);
      if (tasksError) {
        console.warn('Failed to create starter tasks:', tasksError);
      }

      await logEvent('consent_accepted', { 
        version: '1.0',
        starter_tasks_created: tasksCreated 
      });
      await refreshProfile();
      
      toast({
        title: 'Welcome to Freedom Engine',
        description: tasksCreated 
          ? 'Your starter tasks are ready. Let\'s secure your digital footprint!'
          : 'Your governance-first journey begins now.'
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save consent. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center text-center">
          <FELogo size="lg" className="mb-4" />
          <h1 className="text-2xl font-bold">Governance & Transparency</h1>
          <p className="text-muted-foreground mt-1">
            Before we begin, please review and accept our principles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Human-in-the-Loop Commitment</CardTitle>
            <CardDescription>
              Every action is suggested and confirmed by you. We never act without your explicit approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {CONSENT_ITEMS.map((section) => (
                  <div key={section.category}>
                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                      {section.category}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          {section.isNegative ? (
                            <X className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                          ) : (
                            <Check className="h-4 w-4 mt-0.5 text-[hsl(var(--success))] shrink-0" />
                          )}
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold mb-2">Data Minimization Promise</h3>
                  <p className="text-sm text-muted-foreground">
                    We only store what's absolutely necessary for your protection. 
                    You can delete all your data at any time from the Settings page.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <div className="flex items-start space-x-3 w-full">
              <Checkbox 
                id="consent" 
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
              />
              <label 
                htmlFor="consent" 
                className="text-sm leading-tight cursor-pointer"
              >
                I understand and accept these principles. I acknowledge that Freedom Engine 
                operates with my explicit consent and will never perform unauthorized actions.
              </label>
            </div>
            <Button 
              className="w-full" 
              disabled={!accepted || loading}
              onClick={handleAccept}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept & Continue to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}