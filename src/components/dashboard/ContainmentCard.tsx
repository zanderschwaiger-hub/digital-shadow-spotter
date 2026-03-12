import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ContainmentCard() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Containment Playbooks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Step-by-step response checklists for account compromise, SIM swap, identity theft, and more.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate('/playbooks')}
        >
          View Playbooks
        </Button>
      </CardContent>
    </Card>
  );
}
