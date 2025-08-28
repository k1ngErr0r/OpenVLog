import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiWithToasts } from '@/lib/http';
import { useToast } from '@/components/ui/toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const api = useApiWithToasts();
  const { push } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(`/api/auth/login`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      // Persist dark mode preference if set
      const darkPref = localStorage.getItem('theme');
      if (darkPref === 'dark') {
        document.documentElement.classList.add('dark');
      }
      navigate("/");
      push({ type: 'success', message: 'Logged in successfully.' });
    } catch (err) {
      setError("Invalid username or password");
      push({ type: 'error', message: 'Login failed.' });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="w-[400px] bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4 bg-yellow-100 text-yellow-800 p-3 rounded-md">
          <p>
            Authentication has been improved for security. All users are required
            to re-login.{" "}
            <a href="#" className="underline">
              More Info
            </a>
          </p>
        </div>
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4" aria-describedby={error ? 'login-error' : undefined} noValidate>
          <div>
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          {error && (
            <div id="login-error" role="alert" aria-live="polite" className="bg-red-100 text-red-700 p-2 rounded-md dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}