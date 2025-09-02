import { useState } from 'react';
import { useApiWithToasts } from '@/lib/http';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const api = useApiWithToasts();
  const toast = useToast().push;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
    } catch (e:any) {
      setError('Reset failed');
      toast.error('Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-[420px] bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-white mb-4 text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="token" className="text-white">Token</Label>
            <Input id="token" value={token} onChange={e => setToken(e.target.value)} required placeholder="Paste reset token" />
          </div>
          <div>
            <Label htmlFor="password" className="text-white">New Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="New strong password" />
          </div>
          <div>
            <Label htmlFor="confirm" className="text-white">Confirm Password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat password" />
          </div>
          {error && <div className="text-red-400 text-sm" role="alert">{error}</div>}
          <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600">Reset Password</Button>
          <div className="text-center text-xs text-gray-400">
            <Link to="/login" className="underline">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
