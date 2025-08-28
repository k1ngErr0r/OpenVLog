import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/http';

let cachedNeedsSetup: boolean | null = null;
let checkedOnce = false;

export const SetupGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(!checkedOnce);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    if (!checkedOnce) {
      (async () => {
        try {
          const resp = await api.get('/api/setup/status');
          if (!active) return;
            cachedNeedsSetup = resp.data.needsSetup;
            checkedOnce = true;
            if (cachedNeedsSetup && location.pathname !== '/setup') {
              navigate('/setup', { replace: true });
            }
        } catch (err) {
          console.warn('Setup status check failed', err);
        } finally {
          if (active) setChecking(false);
        }
      })();
    } else {
      if (cachedNeedsSetup && location.pathname !== '/setup') {
        navigate('/setup', { replace: true });
      }
    }
    return () => { active = false; };
  }, [location.pathname, navigate]);

  if (checking) {
    return <div className="text-center py-10 text-sm text-gray-500">Loading…</div>;
  }
  return <>{children}</>;
};

export default SetupGuard;