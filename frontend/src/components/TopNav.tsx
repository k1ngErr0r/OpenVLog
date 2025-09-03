import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface TopNavProps {
  user?: { role?: string; email?: string } | null;
  onLogout?: () => void;
}

export function TopNav({ user, onLogout }: TopNavProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const baseLink = 'text-sm font-medium transition-colors px-3 py-2 rounded-md';
  const inactive = 'text-gray-400 hover:text-white hover:bg-white/5';
  const active = 'text-white bg-white/10';

  return (
  <nav className="fixed top-0 left-0 right-0 h-14 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/60 border-b border-white/10 z-40 flex items-center" role="navigation" aria-label="Primary">
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>          
          <span className="text-lg font-semibold tracking-tight">OpenVLog</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={({ isActive }) => cn(baseLink, isActive ? active : inactive)}>Dashboard</NavLink>
          <NavLink to="/vulnerabilities/new" className={({ isActive }) => cn(baseLink, isActive ? active : inactive)}>Add Vulnerability</NavLink>
          {isAdmin && (
            <NavLink to="/users" className={({ isActive }) => cn(baseLink, isActive ? active : inactive)}>Users</NavLink>
          )}
          <NavLink to="/help" className={({ isActive }) => cn(baseLink, isActive ? active : inactive)}>Help</NavLink>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-3">
          {user?.email && <span className="text-xs text-gray-400">{user.email}</span>}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onLogout}>Logout</Button>
        </div>
        {/* Mobile trigger */}
        <button className="md:hidden ml-auto p-2 rounded-md hover:bg-white/10 text-gray-300" onClick={() => setOpen(o => !o)} aria-label="Toggle navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-black/90 border-b border-white/10 px-4 pb-4 pt-3 space-y-1">
          <NavLink onClick={() => setOpen(false)} to="/" end className={({ isActive }) => cn('block', baseLink, isActive ? active : inactive)}>Dashboard</NavLink>
          <NavLink onClick={() => setOpen(false)} to="/vulnerabilities/new" className={({ isActive }) => cn('block', baseLink, isActive ? active : inactive)}>Add Vulnerability</NavLink>
          {isAdmin && (
            <NavLink onClick={() => setOpen(false)} to="/users" className={({ isActive }) => cn('block', baseLink, isActive ? active : inactive)}>Users</NavLink>
          )}
          <NavLink onClick={() => setOpen(false)} to="/help" className={({ isActive }) => cn('block', baseLink, isActive ? active : inactive)}>Help</NavLink>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            {user?.email && <span className="text-xs text-gray-400">{user.email}</span>}
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => { setOpen(false); onLogout?.(); }}>Logout</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
