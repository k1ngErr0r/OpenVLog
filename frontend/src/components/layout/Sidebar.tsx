import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  ShieldAlert,
  Users,
  HelpCircle,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/http';
import { Notifications } from '@/components/Notifications';

const navItems = [
  { to: '/', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
  { to: '/users', icon: <Users className="h-5 w-5" />, label: 'User Management', adminOnly: true },
  { to: '/help', icon: <HelpCircle className="h-5 w-5" />, label: 'Help' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('token');
    navigate('/login');
  };

  const NavLinks = ({ isMobile = false }) => (
    <nav className={cn('flex flex-col gap-2', isMobile ? 'px-4' : 'px-2')} aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-50',
              isActive && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50',
              isCollapsed && !isMobile ? 'justify-center' : ''
            )
          }
        >
          {item.icon}
          <span className={cn(isCollapsed && !isMobile ? 'sr-only' : 'transition-opacity group-hover:opacity-100')}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden md:flex flex-col border-r bg-gray-100/40 dark:bg-gray-800/40 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
        aria-label="Sidebar"
      >
        <div className={cn("flex h-[60px] items-center border-b", isCollapsed ? "px-2 justify-center" : "px-6 justify-between")}>
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-6 w-6" />
            <span className={cn(isCollapsed ? 'sr-only' : '')}>OpenVulog</span>
          </NavLink>
          <div className={cn(isCollapsed ? 'hidden' : '')}>
            <Notifications />
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <NavLinks />
        </div>
        <div className="mt-auto p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className={cn(isCollapsed ? 'sr-only' : '')}>Logout</span>
          </Button>
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} aria-pressed={isCollapsed} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Header with Sheet */}
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
