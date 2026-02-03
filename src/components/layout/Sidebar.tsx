import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  User,
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
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Dark slate background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950" />

      {/* Subtle purple accent glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 transition-all duration-300",
          collapsed ? 'px-4 justify-center' : 'px-5'
        )}>
          <div className="flex items-center gap-3">
            {/* Logo mark - MCP themed */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
              <Cpu className="w-5 h-5 text-white" strokeWidth={2} />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-display font-semibold text-white tracking-tight">
                  InvoiceAI
                </span>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                  <span className="text-[10px] text-purple-400 font-mono font-medium uppercase tracking-wider">
                    MCP v2
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar - MCP purple */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-r-full" />
                    )}

                    {/* Icon */}
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-purple-400' : 'text-slate-500'
                      )}
                      strokeWidth={isActive ? 2 : 1.5}
                    />

                    {!collapsed && (
                      <span className={cn(
                        "text-sm transition-colors",
                        isActive ? "font-medium text-purple-400" : "text-slate-400"
                      )}>
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-3">
          {/* User profile */}
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg bg-slate-800/50",
            collapsed && "justify-center"
          )}>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">John Doe</p>
                <p className="text-xs text-slate-500 truncate">john@company.com</p>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center w-full py-2 rounded-lg",
              "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50",
              "transition-all duration-200"
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
