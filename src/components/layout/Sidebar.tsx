import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Invoices', path: '/invoices', icon: FileText },
  { label: 'Upload', path: '/upload', icon: Upload },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-navy-900/80 backdrop-blur-xl border-r border-navy-800/50 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-navy-800/50">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow">
            <Sparkles className="w-5 h-5 text-navy-950" />
            <div className="absolute inset-0 rounded-xl bg-gold-400/20 animate-pulse-slow" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-display font-semibold text-white tracking-tight">
                InvoiceAI
              </span>
              <span className="text-2xs text-navy-400 font-medium uppercase tracking-wider">
                Pro Dashboard
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 shadow-inner-glow'
                    : 'text-navy-400 hover:text-navy-100 hover:bg-navy-800/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-gold-500/20'
                        : 'bg-navy-800/50 group-hover:bg-navy-700/50'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-gold-400' : 'text-navy-400 group-hover:text-navy-200'
                      )}
                    />
                  </div>
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 text-navy-400 hover:text-navy-200 hover:bg-navy-700 transition-all duration-200"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gold-500/5 to-transparent pointer-events-none" />
    </aside>
  );
}
