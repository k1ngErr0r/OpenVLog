import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, ShieldAlert, Users, HelpCircle, Sun, Moon, Monitor, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/http';
import { Notifications } from '@/components/Notifications';

const SIDEBAR_COLLAPSE_KEY = 'sidebar:collapsed';

type ThemePref = 'light' | 'dark' | 'system';

function useThemePreference() {
  const [pref, setPref] = useState<ThemePref>(() => {
    const stored = localStorage.getItem('themePreference');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const apply = useCallback((effective: 'light' | 'dark') => {
    document.documentElement.classList.toggle('dark', effective === 'dark');
  }, []);
  // Apply on mount & when media changes (if system) or pref changes.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const dark = pref === 'dark' || (pref === 'system' && media.matches);
      apply(dark ? 'dark' : 'light');
    };
    sync();
    if (pref === 'system') {
      media.addEventListener('change', sync);
      return () => media.removeEventListener('change', sync);
    }
  }, [pref, apply]);
  const cycle = () => {
    setPref(p => {
      const next: ThemePref = p === 'light' ? 'dark' : p === 'dark' ? 'system' : 'light';
      localStorage.setItem('themePreference', next);
      return next;
    });
  };
  const icon = pref === 'light' ? <Sun className="h-5 w-5" /> : pref === 'dark' ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />;
  const label = `Theme: ${pref.charAt(0).toUpperCase() + pref.slice(1)}`;
  const effectiveDark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return { pref, cycle, icon, label, effectiveDark };
}

const navItems = [
  { to: '/', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
  { to: '/users', icon: <Users className="h-5 w-5" />, label: 'User Management', adminOnly: true },
  { to: '/help', icon: <HelpCircle className="h-5 w-5" />, label: 'Help' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pref, cycle, icon, label, effectiveDark } = useThemePreference();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => { try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, isCollapsed ? '1' : '0'); } catch {} }, [isCollapsed]);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    localStorage.removeItem('token');
    navigate('/login');
  };

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className={cn('flex flex-col gap-2', isMobile ? 'px-4' : 'px-2')} aria-label="Main navigation">
      {navItems.map(item => (
        <NavLink
          key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-50',
              isActive && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50',
              isCollapsed && !isMobile && 'justify-center'
            )}
          >
          {item.icon}
          <span className={cn(isCollapsed && !isMobile ? 'sr-only' : 'transition-opacity group-hover:opacity-100')}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <div className={cn('hidden md:flex flex-col border-r bg-gray-100/40 dark:bg-gray-800/40 transition-all duration-300', isCollapsed ? 'w-20' : 'w-64')} aria-label="Sidebar">
        <div className={cn('flex h-[60px] items-center gap-2 border-b', isCollapsed ? 'px-2 justify-center' : 'px-4')}>
          <Button variant="outline" size="icon" onClick={() => setIsCollapsed(c => !c)} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <NavLink to="/" className={cn('flex items-center gap-2 font-semibold flex-1', isCollapsed && 'justify-center')}>
            <ShieldAlert className="h-6 w-6" />
            <span className={cn(isCollapsed ? 'sr-only' : '')}>OpenVulog</span>
          </NavLink>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={cycle} aria-label={label} title={label}>
                {icon}
              </Button>
              <Notifications />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto py-2">
          <NavLinks />
        </div>
        <div className="mt-auto p-2 border-t flex flex-col gap-2">
          <Button variant="ghost" size={isCollapsed ? 'icon' : undefined} className={cn('w-full justify-start gap-3', isCollapsed && 'justify-center')} onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
            <span className={cn(isCollapsed ? 'sr-only' : '')}>Logout</span>
          </Button>
          {isCollapsed && (
            <Button variant="ghost" size="icon" onClick={cycle} aria-label={label} title={label}>
              {icon}
            </Button>
          )}
        </div>
      </div>
  <header className="flex md:hidden h-14 items-center justify-between gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>
                <NavLink to="/" className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="h-6 w-6" />
                  <span>OpenVulog</span>
                </NavLink>
              </SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <NavLinks isMobile />
            </div>
            <div className="mt-auto p-4 border-t">
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Notifications />
      </header>
    </>
  );
}
// stray fragment removed
