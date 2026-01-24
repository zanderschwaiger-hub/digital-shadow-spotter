import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EmbedLoginForm } from '@/components/embed/EmbedLoginForm';
import { EmbedStatusWidget } from '@/components/embed/EmbedStatusWidget';

export default function EmbedPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Freedom Engine</h1>
            <p className="text-xs text-muted-foreground">Footprint Maintenance Agent</p>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border bg-card p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : user ? (
            <EmbedStatusWidget />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Sign in to view your security status
              </p>
              <EmbedLoginForm onSuccess={() => {}} />
            </>
          )}
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
