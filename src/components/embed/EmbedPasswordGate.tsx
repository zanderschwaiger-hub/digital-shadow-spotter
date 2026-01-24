import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

interface EmbedPasswordGateProps {
  onSuccess: () => void;
}

// This is a simple access gate password - not for sensitive auth
const ACCESS_PASSWORD = 'freedom2024';

export function EmbedPasswordGate({ onSuccess }: EmbedPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      localStorage.setItem('embed-access-granted', 'true');
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-2">Access Required</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Enter the access code to continue
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access-code" className="sr-only">Access Code</Label>
          <Input
            id="access-code"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Enter access code"
            className={error ? 'border-destructive' : ''}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive">Invalid access code</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  );
}
