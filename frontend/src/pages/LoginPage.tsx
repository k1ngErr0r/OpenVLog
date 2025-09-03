import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApiWithToasts } from '@/lib/http';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const api = useApiWithToasts();
  const toast = useToast().push;

  // Setup status now handled globally by SetupGuard

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(`/api/auth/login`, { username, password });
      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      // Persist dark mode preference if set
      const darkPref = localStorage.getItem('theme');
      if (darkPref === 'dark') {
        document.documentElement.classList.add('dark');
      }
      navigate("/");
      toast.success('Logged in successfully.');
    } catch (err) {
      setError("Invalid username or password");
      toast.error('Login failed.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e1420] px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-transparent blur-xl" />
        <div className="relative rounded-2xl border border-white/5 bg-gradient-to-b from-[#182232] to-[#121a27] shadow-xl shadow-black/40 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome to OpenVLog</h1>
            <p className="mt-2 text-sm text-white/60">Sign in to manage your vulnerabilities</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5" aria-describedby={error ? 'login-error' : undefined} noValidate>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wide text-white/70">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-[#0f1824] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-600"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-white/70">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-[#0f1824] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-600"
                required
              />
            </div>
            {error && (
              <div id="login-error" role="alert" aria-live="polite" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 select-none text-white/60">
                <input type="checkbox" className="h-3 w-3 rounded border-white/20 bg-[#0f1824] text-blue-600 focus:ring-blue-600" />
                Remember me
              </label>
              <Link to="/request-password-reset" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
            </div>
            <Button type="submit" variant="primaryBlue" className="w-full font-medium tracking-wide">Log In</Button>
          </form>
          <div className="mt-8 text-center text-xs text-white/40">
            Have a reset token?{' '}
            <Link to="/reset-password" className="text-blue-400 hover:text-blue-300 font-medium">Reset now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}