import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { cn } from '@/utils';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient orbs for depth */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-orange-100/40 via-transparent to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/30 via-transparent to-transparent rounded-full blur-3xl translate-y-1/3" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-gradient-to-r from-blue-100/20 via-transparent to-transparent rounded-full blur-3xl -translate-x-1/2" />
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={cn(
          'relative transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
