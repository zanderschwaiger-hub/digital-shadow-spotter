import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRiskContext } from '@/hooks/useRiskContext';
import { useNavigate } from 'react-router-dom';
import {
  CATEGORY_PILLARS,
  getCategoryStatus,
  getTopRisks,
  getDecisionSummary,
  getSystemStatus,
  getDriftSignal,
  getRiskTag,
  type GovernanceCategory,
} from '@/lib/pillar-risks';
import { Shield, ChevronRight, Clock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_ORDER: GovernanceCategory[] = ['Control', 'Coverage', 'Defense', 'Maintenance'];

const STATUS_STYLE: Record<string, string> = {
  'Stable': 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
  'Needs Review': 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
  'High Priority': 'bg-[hsl(var(--severity-high))]/15 text-[hsl(var(--severity-high))]',
};

const IMPACT_STYLE: Record<string, string> = {
  High: 'bg-[hsl(var(--severity-high))]/15 text-[hsl(var(--severity-high))]',
  Medium: 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
  Low: 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
};

const SYSTEM_STATUS_STYLE: Record<string, string> = {
  'Stable': 'text-[hsl(var(--severity-low))]',
  'Needs attention': 'text-[hsl(var(--severity-medium))]',
  'High risk': 'text-[hsl(var(--severity-high))]',
};

const TAG_STYLE: Record<string, string> = {
  'New': 'bg-primary/15 text-primary',
  'Updated': 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
};

export default function GovernanceConsolePage() {
  const { risks, lastSystemReviewAt } = useRiskContext();
  const navigate = useNavigate();

  const topRisks = getTopRisks(risks, 3);
  const summary = getDecisionSummary(risks);
  const systemStatus = getSystemStatus(risks);
  const drift = getDriftSignal(risks, lastSystemReviewAt);
  const pendingReviewCount = risks.filter(r => r.decision_state === 'Pending').length;

  const lastReviewedLabel = lastSystemReviewAt
    ? `Last reviewed ${formatDistanceToNow(new Date(lastSystemReviewAt), { addSuffix: true })}`
    : 'No review recorded';

  const DriftIcon = drift === 'increasing' ? TrendingUp : drift === 'improving' ? TrendingDown : Minus;
  const driftLabel = drift === 'increasing' ? 'System drift increasing' : drift === 'improving' ? 'System improving' : 'System stable';
  const driftColor = drift === 'increasing' ? 'text-[hsl(var(--severity-medium))]' : drift === 'improving' ? 'text-[hsl(var(--severity-low))]' : 'text-muted-foreground';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Governance Status</h1>
          <p className="text-muted-foreground">Pillar-based risk overview and decision queue.</p>
        </div>

        {/* Status strip */}
        <Card className="border-border/50">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">{lastReviewedLabel}</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span className={SYSTEM_STATUS_STYLE[systemStatus]}>Status: {systemStatus}</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span className={`flex items-center gap-1 ${driftColor}`}>
                <DriftIcon className="h-3.5 w-3.5" />
                {driftLabel}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Review banner */}
        {pendingReviewCount > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-[hsl(var(--severity-medium))]/30 bg-[hsl(var(--severity-medium))]/5 px-4 py-2.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--severity-medium))] shrink-0" />
            <span>{pendingReviewCount} item{pendingReviewCount !== 1 ? 's' : ''} need{pendingReviewCount === 1 ? 's' : ''} review</span>
          </div>
        )}

        {/* Category cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_ORDER.map(cat => {
            const status = getCategoryStatus(risks, cat);
            return (
              <Card key={cat} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate('/pillar-directory')}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{cat}</CardTitle>
                    <Badge className={STATUS_STYLE[status.label] ?? ''} variant="outline">
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">{status.activeCount}</p>
                      <p className="text-xs text-muted-foreground">active risk{status.activeCount !== 1 ? 's' : ''}</p>
                    </div>
                    {status.highestImpact && (
                      <Badge variant="outline" className={`text-xs ${IMPACT_STYLE[status.highestImpact]}`}>
                        {status.highestImpact}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* What needs attention now */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">What needs attention now</h2>
          {topRisks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>All risks are resolved. Your governance posture is stable.</p>
              </CardContent>
            </Card>
          ) : (
            topRisks.map(risk => {
              const tag = getRiskTag(risk, lastSystemReviewAt);
              return (
                <Card key={risk.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium">{risk.pillar_name}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-sm text-muted-foreground">{risk.risk_type}</span>
                        {tag && (
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TAG_STYLE[tag]}`}>
                            {tag}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={IMPACT_STYLE[risk.impact_level]}>
                          {risk.impact_level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Confidence: {Math.round(risk.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/risk-detail/${risk.id}`)}>
                      Review <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Decision Summary */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Decision Summary</h2>
          <div className="grid gap-4 grid-cols-3">
            <Card>
              <CardContent className="py-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{summary.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-[hsl(var(--severity-low))]" />
                <p className="text-2xl font-bold">{summary.resolvedThisMonth}</p>
                <p className="text-xs text-muted-foreground">Resolved this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-[hsl(var(--severity-high))]" />
                <p className="text-2xl font-bold">{summary.highPriority}</p>
                <p className="text-xs text-muted-foreground">High priority</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/pillar-directory')}>
            Pillar Directory
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/decision-queue')}>
            Decision Queue
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/governance-audit')}>
            Audit History
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/governance-cadence')}>
            Governance Cadence
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
