import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { SidebarProvider } from '../ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}