import { useState } from 'react';
import { useApiWithToasts } from '@/lib/http';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

export function RequestPasswordResetPage() {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const api = useApiWithToasts();
  const toast = useToast().push;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/request-password-reset', { username });
      setSubmitted(true);
      toast.success('If the user exists, a reset token was generated.');
    } catch (e) {
      // Still show success to avoid user enumeration
      setSubmitted(true);
      toast.info('If the user exists, a reset token was generated.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-[420px] bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-white mb-4 text-center">Request Password Reset</h1>
        {submitted ? (
          <div className="space-y-4 text-sm text-gray-200">
            <p>Check server logs or email integration (future) for the reset token.</p>
            <p>
              Proceed to the <Link to="/reset-password" className="underline text-yellow-400">Reset Password</Link> page once you have the token.
            </p>
            <Link to="/login" className="text-yellow-400 underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Your username" />
            </div>
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600">Request Reset</Button>
            <div className="text-center text-xs text-gray-400">
              <Link to="/login" className="underline">Back to login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
