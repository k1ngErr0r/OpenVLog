import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiWithToasts } from '@/lib/http';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SetupPage() {
  const api = useApiWithToasts();
  const toast = useToast().push;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get('/api/setup/status');
        if (!resp.data.needsSetup) {
          navigate('/login');
        } else {
          setNeedsSetup(true);
        }
      } catch (err) {
        console.error('Failed to check setup status', err);
        toast.error('Failed to check setup status.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/setup/initialize', { username, password });
      toast.success('Admin user created. Please login.');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Setup failed.');
      toast.error('Setup failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-200">Checking setup status…</div>;
  }

  if (!needsSetup) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800/70 backdrop-blur p-6 rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Initial Setup</h1>
        <p className="text-gray-300 text-sm mb-6">Create the first administrator account for OpenVLog.</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="username" className="text-white">Username</Label>
            <Input id="username" value={username} onChange={e=>setUsername(e.target.value)} required placeholder="admin" autoFocus />
          </div>
          <div>
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Strong password" minLength={12} />
            <p className="text-xs text-gray-400 mt-1">At least 12 chars incl upper, lower, number & symbol.</p>
          </div>
            <div>
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
          </div>
          {error && <div className="bg-red-900/60 text-red-200 p-2 rounded text-sm" role="alert">{error}</div>}
          <Button disabled={submitting} type="submit" className="w-full">{submitting ? 'Creating…' : 'Create Admin'}</Button>
        </form>
      </div>
    </div>
  );
}

export default SetupPage;