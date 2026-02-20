import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAssessment } from '@/hooks/useAssessment';
import { useGovernance } from '@/hooks/useGovernance';
import { useToast } from '@/hooks/use-toast';
import { 
  getControlsForPillar, 
  getQuestionsForControl, 
  SCORE_LABELS,
  type ScoreValue 
} from '@/lib/control-library';
import { computeControlScore } from '@/lib/scoring-engine';
import { ChevronLeft, ChevronRight, Save, CheckCircle2 } from 'lucide-react';

export default function AssessmentPage() {
  const [searchParams] = useSearchParams();
  const pillarId = searchParams.get('pillar') || 'P01';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pillarAnswers, saveControlAnswers, loading: assessmentLoading } = useAssessment();
  const { pillars } = useGovernance();
  
  const controls = getControlsForPillar(pillarId);
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, ScoreValue>>(() => {
    return { ...(pillarAnswers[pillarId] || {}) };
  });
  const [saving, setSaving] = useState(false);

  const activeControl = controls[activeControlIndex];
  const questions = activeControl ? getQuestionsForControl(activeControl.id) : [];
  const pillar = pillars.find(p => p.id === pillarId);

  const handleAnswer = (questionId: string, value: ScoreValue) => {
    setLocalAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveControlAnswers(pillarId, localAnswers);
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Assessment saved', description: 'Your answers have been recorded.' });
    }
  };

  const controlScore = activeControl 
    ? computeControlScore(activeControl.id, localAnswers) 
    : null;

  if (assessmentLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/governance')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Pillars
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pillar?.name || pillarId}</h1>
            <p className="text-muted-foreground text-sm">
              Control {activeControlIndex + 1} of {controls.length}
            </p>
          </div>
        </div>

        {/* Control navigation */}
        <div className="flex gap-2 flex-wrap">
          {controls.map((c, i) => {
            const cs = computeControlScore(c.id, localAnswers);
            const isComplete = cs.answeredCount === cs.totalQuestions;
            return (
              <Button
                key={c.id}
                variant={i === activeControlIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveControlIndex(i)}
                className="gap-1"
              >
                {isComplete && <CheckCircle2 className="h-3 w-3" />}
                {c.id}
              </Button>
            );
          })}
        </div>

        {activeControl && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{activeControl.name}</CardTitle>
                  <CardDescription>{activeControl.description}</CardDescription>
                </div>
                {controlScore && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{controlScore.percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {controlScore.answeredCount}/{controlScore.totalQuestions} answered
                    </div>
                  </div>
                )}
              </div>
              {controlScore && (
                <Progress value={controlScore.percentage} className="h-2 mt-2" />
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="space-y-3 p-4 rounded-lg border bg-muted/30">
                  <p className="font-medium text-sm">{q.text}</p>
                  {q.help_text && (
                    <p className="text-xs text-muted-foreground">{q.help_text}</p>
                  )}
                  <RadioGroup
                    value={localAnswers[q.id]?.toString() ?? ''}
                    onValueChange={(v) => handleAnswer(q.id, parseInt(v) as ScoreValue)}
                  >
                    {([0, 1, 2, 3] as ScoreValue[]).map((val) => (
                      <div key={val} className="flex items-center space-x-2">
                        <RadioGroupItem value={val.toString()} id={`${q.id}-${val}`} />
                        <Label htmlFor={`${q.id}-${val}`} className="text-sm cursor-pointer">
                          <Badge variant={val === 3 ? 'default' : val >= 2 ? 'secondary' : 'outline'} className="mr-2">
                            {val}
                          </Badge>
                          {SCORE_LABELS[val]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={activeControlIndex === 0}
            onClick={() => setActiveControlIndex(i => i - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save Assessment'}
          </Button>

          <Button
            variant="outline"
            disabled={activeControlIndex === controls.length - 1}
            onClick={() => setActiveControlIndex(i => i + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
