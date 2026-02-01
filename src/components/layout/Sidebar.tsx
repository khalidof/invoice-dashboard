import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
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
        'fixed left-0 top-0 z-40 h-screen transition-all duration-500 ease-out',
        collapsed ? 'w-[80px]' : 'w-[280px]'
      )}
    >
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900/95 via-obsidian-900/90 to-obsidian-950/95 backdrop-blur-2xl" />

      {/* Right border with gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-obsidian-700/50 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-ember-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "flex items-center h-20 border-b border-obsidian-800/30 transition-all duration-500",
          collapsed ? 'px-5 justify-center' : 'px-6'
        )}>
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="relative group">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-ember-400 via-ember-500 to-ember-600 shadow-lg shadow-ember-500/25 transition-transform duration-300 group-hover:scale-105">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-2xl bg-ember-400/30 animate-ping opacity-20" />
            </div>

            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xl font-display font-bold text-white tracking-tight">
                  InvoiceAI
                </span>
                <span className="text-[10px] text-obsidian-500 font-semibold uppercase tracking-[0.2em]">
                  Pro Dashboard
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5 px-3 py-6">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${index * 50}ms` }}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group',
                    'animate-fade-in opacity-0 [animation-fill-mode:forwards]',
                    isActive
                      ? 'bg-gradient-to-r from-ember-500/15 to-ember-500/5 text-ember-400'
                      : 'text-obsidian-400 hover:text-obsidian-100 hover:bg-obsidian-800/40'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-ember-400 to-ember-600 rounded-full shadow-lg shadow-ember-500/50" />
                    )}

                    {/* Icon container */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
                        isActive
                          ? 'bg-ember-500/20 shadow-inner'
                          : 'bg-obsidian-800/60 group-hover:bg-obsidian-700/60'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-all duration-300',
                          isActive
                            ? 'text-ember-400'
                            : 'text-obsidian-500 group-hover:text-obsidian-300'
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>

                    {!collapsed && (
                      <>
                        <span className={cn(
                          "font-medium text-[15px] transition-all duration-300",
                          isActive && "font-semibold"
                        )}>
                          {item.label}
                        </span>

                        {/* Active dot indicator */}
                        {isActive && (
                          <div className="ml-auto flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-ember-400 shadow-lg shadow-ember-400/50" />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-6">
          {/* Collapse Toggle */}
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center w-full py-3 rounded-xl",
              "bg-obsidian-800/40 border border-obsidian-700/30",
              "text-obsidian-500 hover:text-obsidian-200 hover:bg-obsidian-800/60",
              "transition-all duration-300 group"
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-sm font-medium">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-ember-500/5 via-violet-500/3 to-transparent pointer-events-none" />
    </aside>
  );
}
