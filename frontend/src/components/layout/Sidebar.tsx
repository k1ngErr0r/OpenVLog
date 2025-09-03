import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, ShieldAlert, Users, HelpCircle, Sun, Moon, Monitor, LogOut, Menu, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
  const setPreference = (p: ThemePref) => {
    setPref(p);
    localStorage.setItem('themePreference', p);
  };
  const icon = pref === 'light' ? <Sun className="h-4 w-4" /> : pref === 'dark' ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  const label = `Theme: ${pref.charAt(0).toUpperCase() + pref.slice(1)}`;
  return { pref, setPreference, icon, label };
}

const ThemeSelector: React.FC<{ collapsed: boolean; pref: ThemePref; onChange: (p: ThemePref)=>void; icon: React.ReactNode; label: string; }> = ({ collapsed, pref, onChange, icon, label }) => {
  const [open, setOpen] = useState(false);
  const handleSelect = (val: ThemePref) => { onChange(val); setOpen(false); };
  return (
    <div className="relative w-full">
      <Button variant="ghost" size={collapsed ? 'icon' : 'sm'} className={cn('w-full justify-start gap-2', collapsed && 'justify-center')} aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={()=>setOpen(o=>!o)}>
        {icon}
        {!collapsed && <span className="flex-1 text-left">{pref.charAt(0).toUpperCase()+pref.slice(1)}</span>}
        {!collapsed && <ChevronDown className="h-4 w-4 opacity-60" />}
      </Button>
      {open && (
        <div role="menu" className="absolute z-50 mt-1 w-full min-w-[140px] rounded-md border bg-white dark:bg-gray-800 shadow-lg p-1 text-sm">
          {(['light','dark','system'] as ThemePref[]).map(p => (
            <button key={p} onClick={()=>handleSelect(p)} className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700', p===pref && 'bg-gray-100 dark:bg-gray-700 font-medium')}>{p==='light'? <Sun className="h-4 w-4" />: p==='dark'? <Moon className="h-4 w-4" />: <Monitor className="h-4 w-4" />} <span className={collapsed ? 'sr-only' : ''}>{p.charAt(0).toUpperCase()+p.slice(1)}</span></button>
          ))}
        </div>
      )}
    </div>
  );
};

const navItems = [
  { to: '/', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
  { to: '/users', icon: <Users className="h-5 w-5" />, label: 'User Management', adminOnly: true },
  { to: '/help', icon: <HelpCircle className="h-5 w-5" />, label: 'Help' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pref, setPreference, icon, label } = useThemePreference();
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
        <div className={cn('flex h-[60px] items-center gap-2 border-b', isCollapsed ? 'px-2 justify-center' : 'px-3')}>          
          <NavLink to="/" className={cn('flex items-center gap-2 font-semibold flex-1', isCollapsed && 'justify-center')}>
            <ShieldAlert className="h-6 w-6" />
            <span className={cn(isCollapsed ? 'sr-only' : '')}>OpenVulog</span>
          </NavLink>
          <Button variant="outline" size="icon" onClick={() => setIsCollapsed(c => !c)} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <NavLinks />
        </div>
        <div className="mt-auto p-2 border-t flex flex-col gap-2">
          <div className={cn('flex', isCollapsed ? 'flex-col gap-2 items-center' : 'flex-col gap-2')}>
            <ThemeSelector collapsed={isCollapsed} pref={pref} onChange={setPreference} icon={icon} label={label} />
            <div className={cn('w-full flex', isCollapsed ? 'justify-center' : '')}>
              <Notifications />
            </div>
            <Button variant="ghost" size={isCollapsed ? 'icon' : undefined} className={cn('w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300', isCollapsed && 'justify-center')} onClick={handleLogout} aria-label="Logout" title="Logout">
              <LogOut className="h-5 w-5" />
              <span className={cn(isCollapsed ? 'sr-only' : '')}>Logout</span>
            </Button>
          </div>
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
