import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  IdentifierCoverage,
  IDENTIFIER_META,
  calculateIdentifierCoverage,
} from '@/lib/types';

interface IdentifierCoverageCardProps {
  coverage: IdentifierCoverage;
}

export function IdentifierCoverageCard({ coverage }: IdentifierCoverageCardProps) {
  const { level, total } = calculateIdentifierCoverage(coverage);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Coverage Level
        </CardTitle>
        <Link to="/inventory">
          <Button variant="ghost" size="sm" className="text-xs">
            Manage
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Level display */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{level}</span>
            <span className="text-sm text-muted-foreground">/ {total} identifiers</span>
            {level === total && (
              <Badge variant="default" className="ml-auto text-xs">Full Coverage</Badge>
            )}
          </div>

          {/* Level bar */}
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < level ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          {/* Identifier checklist */}
          <div className="space-y-2 text-sm">
            {IDENTIFIER_META.map(({ key, label, description }) => {
              const present = coverage[key];
              return (
                <div key={key} className="flex items-start gap-2">
                  {present ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 mt-0.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <div>
                    <span className={present ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
                    {!present && (
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
