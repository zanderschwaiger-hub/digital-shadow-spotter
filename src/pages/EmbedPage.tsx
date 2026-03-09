import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EmbedPasswordGate } from '@/components/embed/EmbedPasswordGate';
import { EmbedLoginForm } from '@/components/embed/EmbedLoginForm';
import { EmbedStatusWidget } from '@/components/embed/EmbedStatusWidget';
import { FELogo } from '@/components/FELogo';

export default function EmbedPage() {
  const { user, loading } = useAuth();
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('embed-access-granted');
    if (stored === 'true') {
      setAccessGranted(true);
    }
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      );
    }

    // Step 1: Password gate
    if (!accessGranted) {
      return <EmbedPasswordGate onSuccess={() => setAccessGranted(true)} />;
    }

    // Step 2: Login form or status widget
    if (user) {
      return <EmbedStatusWidget />;
    }

    return (
      <>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Sign in to view your security status
        </p>
        <EmbedLoginForm onSuccess={() => {}} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FELogo size="md" />
          <div>
            <h1 className="text-lg font-bold">Freedom Engine</h1>
            <p className="text-xs text-muted-foreground">Footprint Maintenance Agent</p>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border bg-card p-4">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground italic">
            "Emotional safety through technical discipline."
          </p>
        </div>
      </div>
    </div>
  );
}
