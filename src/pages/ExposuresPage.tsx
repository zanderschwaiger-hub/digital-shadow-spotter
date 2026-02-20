import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAssessment } from '@/hooks/useAssessment';
import { EXPOSURE_TYPES, getMappingsForExposure, CONTROLS } from '@/lib/control-library';
import { AlertTriangle, AlertCircle, Info, Shield } from 'lucide-react';
import type { PLevel } from '@/lib/governance-policies';

const SEVERITY_CONFIG: Record<PLevel, { icon: typeof AlertTriangle; label: string; className: string }> = {
  P0: { icon: AlertTriangle, label: 'P0 — Immediate', className: 'bg-destructive text-destructive-foreground' },
  P1: { icon: AlertCircle, label: 'P1 — Action Required', className: 'bg-[hsl(var(--severity-medium))] text-[hsl(var(--severity-medium-foreground))]' },
  P2: { icon: Info, label: 'P2 — Informational', className: 'bg-[hsl(var(--severity-low))] text-[hsl(var(--severity-low-foreground))]' },
};

const CATEGORY_LABELS: Record<string, string> = {
  CONTROL: 'Control Layer',
  COVERAGE: 'Coverage Layer',
  DEFENSE: 'Defense Layer',
  MAINTENANCE: 'Maintenance Layer',
};

export default function ExposuresPage() {
  const { overallScore, loading } = useAssessment();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const triggered = overallScore?.triggeredExposures || [];
  const categories = ['CONTROL', 'COVERAGE', 'DEFENSE', 'MAINTENANCE'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Exposures</h1>
          <p className="text-muted-foreground">
            Computed from your assessment answers. Read-only view — exposures update when you save assessments.
          </p>
        </div>

        {triggered.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 py-8">
              <Shield className="h-8 w-8 text-[hsl(var(--severity-low))]" />
              <div>
                <p className="font-medium">No exposures triggered</p>
                <p className="text-sm text-muted-foreground">
                  Complete more assessments to identify exposures, or all controls are above threshold.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          categories.map(cat => {
            const catExposures = triggered.filter(t => t.exposureType.category === cat);
            if (catExposures.length === 0) return null;
            
            return (
              <div key={cat} className="space-y-3">
                <h2 className="text-lg font-semibold">{CATEGORY_LABELS[cat]}</h2>
                {catExposures.map(exposure => {
                  const config = SEVERITY_CONFIG[exposure.severity];
                  const Icon = config.icon;
                  
                  return (
                    <Card key={exposure.exposureType.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <CardTitle className="text-base">{exposure.exposureType.name}</CardTitle>
                          </div>
                          <Badge className={config.className}>{config.label}</Badge>
                        </div>
                        <CardDescription>{exposure.exposureType.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">Triggering controls:</p>
                        <div className="flex flex-wrap gap-2">
                          {exposure.triggeringControls.map(tc => (
                            <Badge key={tc.controlId} variant="outline" className="text-xs">
                              {tc.controlId} — {tc.controlName} (score: {tc.score.toFixed(1)})
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
