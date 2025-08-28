import { Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from 'react';
import api from '@/lib/http';
import { setCurrentUser } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

export const ProtectedRoute = () => {
  const [status, setStatus] = useState<'checking' | 'authed' | 'unauth'>('checking');

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setStatus('unauth'); return; }
      try {
        const decoded: any = jwtDecode(token);
        const expired = decoded.exp && Date.now() / 1000 > decoded.exp;
        if (expired) {
          try {
            const resp = await api.post('/api/auth/refresh');
            localStorage.setItem('token', resp.data.token);
            if (resp.data.user) setCurrentUser(resp.data.user);
            else {
              // fetch user info as fallback
              try {
                const me = await api.get('/api/auth/me');
                setCurrentUser(me.data);
              } catch {/* ignore */}
            }
            setStatus('authed');
            return;
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setStatus('unauth');
            return;
          }
        }
        // non-expired: ensure we have user cached (best-effort)
        if (!localStorage.getItem('user')) {
          try {
            const me = await api.get('/api/auth/me');
            setCurrentUser(me.data);
          } catch {/* ignore */}
        }
        setStatus('authed');
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setStatus('unauth');
      }
    };
    check();
  }, []);

  if (status === 'checking') {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }
  if (status === 'unauth') return <Navigate to="/login" />;
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
