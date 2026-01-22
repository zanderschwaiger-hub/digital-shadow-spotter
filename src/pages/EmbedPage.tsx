import { Shield } from 'lucide-react';

export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Freedom Engine</h1>
            <p className="text-xs text-muted-foreground">Footprint Maintenance Agent</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-muted-foreground mb-4">
            This is the embeddable version of Freedom Engine.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            To access the full application with all features, 
            please visit the main site and log in.
          </p>
          <a 
            href="/login" 
            target="_blank"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open Full Application
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground italic">
            "Emotional safety through technical discipline."
          </p>
        </div>
      </div>
    </div>
  );
}