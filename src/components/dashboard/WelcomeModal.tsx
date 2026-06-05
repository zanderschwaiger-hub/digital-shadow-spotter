import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ListChecks, 
  Mail, 
  Lock, 
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const WELCOME_STEPS = [
  {
    icon: Shield,
    title: "You're in the right place",
    description: "Freedom Engine helps you clean up your digital life and stay in control — without becoming a security expert.",
    action: '/tasks',
    actionLabel: 'See my action plan'
  },
  {
    icon: ListChecks,
    title: 'Your action plan is ready',
    description: "We've built a starter set of tasks based on what most people need to fix first. Work through them at your own pace.",
    action: '/tasks',
    actionLabel: 'Start my first task'
  },
  {
    icon: Mail,
    title: 'Add your accounts',
    description: 'Add your emails and important accounts so we can check for breaches and track your coverage.',
    action: '/inventory',
    actionLabel: 'Add my accounts'
  },
  {
    icon: Lock,
    title: 'When things go wrong',
    description: "If something gets compromised, we have step-by-step response guides. You'll never have to figure it out alone.",
    action: '/playbooks',
    actionLabel: 'See response guides'
  },
];

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleAction = (path: string) => {
    onClose();
    navigate(path);
  };

  const step = WELCOME_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === WELCOME_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {currentStep === 0 ? 'Welcome to Freedom Engine!' : 'Next Step'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 0 
              ? "We've created starter tasks to guide you. Here's how to get started:"
              : `Step ${currentStep + 1} of ${WELCOME_STEPS.length}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-xl border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAction(step.action)}
              className="gap-2"
            >
              {step.actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {WELCOME_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentStep 
                    ? 'bg-primary' 
                    : idx < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} className="sm:mr-auto">
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {isLastStep ? (
              <>
                Get Started
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
