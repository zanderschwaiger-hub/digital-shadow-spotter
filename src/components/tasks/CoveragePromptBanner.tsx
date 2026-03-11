import { useNavigate } from 'react-router-dom';
import { IdentifierCoverage } from '@/lib/types';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoveragePrompt {
  field: keyof IdentifierCoverage;
  message: string;
}

/**
 * Maps pillar IDs to the coverage inputs that improve guidance for tasks
 * within that pillar. Only pillars with relevant coverage gaps are mapped.
 */
const PILLAR_COVERAGE_PROMPTS: Record<string, CoveragePrompt[]> = {
  'master-key-control': [
    { field: 'recoveryMethod', message: 'Add your primary recovery method to improve guidance for this task.' },
    { field: 'recoveryPhone', message: 'Add your recovery number to assess SMS dependency and recovery exposure.' },
  ],
  'mfa-standard': [
    { field: 'recoveryMethod', message: 'Add your primary recovery method to improve MFA fallback guidance.' },
    { field: 'recoveryPhone', message: 'Add your recovery number to evaluate phone-based recovery risk.' },
  ],
  'credential-system': [
    { field: 'recoveryMethod', message: 'Add your primary recovery method to assess credential recovery posture.' },
  ],
  'breach-reality': [
    { field: 'recoveryPhone', message: 'Add your recovery number to detect SMS-based account recovery exposure.' },
    { field: 'phone', message: 'Add your phone number to enable SIM-swap awareness checks.' },
  ],
  'session-device-control': [
    { field: 'recoveryMethod', message: 'Add your primary recovery method to assess session recovery risk.' },
  ],
  'governance-cadence': [
    { field: 'recoveryMethod', message: 'Add your primary recovery method to strengthen your governance review baseline.' },
    { field: 'recoveryPhone', message: 'Add your recovery number to include recovery exposure in periodic reviews.' },
  ],
};

interface CoveragePromptBannerProps {
  pillarId: string | null;
  coverage: IdentifierCoverage;
}

export function CoveragePromptBanner({ pillarId, coverage }: CoveragePromptBannerProps) {
  const navigate = useNavigate();

  if (!pillarId) return null;

  const prompts = PILLAR_COVERAGE_PROMPTS[pillarId];
  if (!prompts) return null;

  // Only show prompts for missing coverage
  const missing = prompts.filter(p => !coverage[p.field]);
  if (missing.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      {missing.map((prompt) => (
        <div
          key={prompt.field}
          className="flex items-start gap-2.5 rounded-md border border-primary/10 bg-primary/5 p-3"
        >
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground">{prompt.message}</p>
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 text-xs text-primary mt-1"
              onClick={() => navigate('/inventory')}
            >
              Go to Inventory →
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
