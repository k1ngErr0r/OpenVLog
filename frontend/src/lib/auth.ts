import { jwtDecode } from 'jwt-decode';

export interface CurrentUser { id: number; username?: string; isAdmin: boolean; }

export function getCurrentUser(): CurrentUser | null {
  // Prefer cached user object (kept in sync via login/refresh)
  const cached = localStorage.getItem('user');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (typeof parsed.id === 'number') return { id: parsed.id, username: parsed.username, isAdmin: !!parsed.isAdmin };
    } catch {/* ignore */}
  }
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp && Date.now()/1000 > decoded.exp) return null;
    return { id: decoded.userId, isAdmin: !!decoded.isAdmin };
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getCurrentUser()?.isAdmin || false;
}

export function setCurrentUser(user: CurrentUser) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}