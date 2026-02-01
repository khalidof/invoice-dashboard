import { Bell, Search, User, Command } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-20">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/95 via-obsidian-950/90 to-obsidian-950/95 backdrop-blur-2xl" />

      {/* Bottom border with gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-700/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between h-full px-8">
        {/* Left side - Page title */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-obsidian-400 font-medium">{subtitle}</p>
          ) : (
            <p className="text-sm text-obsidian-500">{currentDate}</p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block group">
            <div className="absolute inset-0 bg-gradient-to-r from-ember-500/10 to-violet-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-obsidian-500 group-focus-within:text-ember-400 transition-colors" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-72 pl-11 pr-20 py-3 bg-obsidian-800/50 border border-obsidian-700/40 rounded-xl text-sm text-obsidian-100 placeholder-obsidian-500 focus:outline-none focus:border-ember-500/40 focus:bg-obsidian-800/70 transition-all duration-300"
              />
              <div className="absolute right-3 flex items-center gap-1 px-2 py-1 bg-obsidian-700/50 border border-obsidian-600/30 rounded-lg">
                <Command className="w-3 h-3 text-obsidian-500" />
                <span className="text-[10px] font-mono font-medium text-obsidian-500">K</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-obsidian-800/50 border border-obsidian-700/40 text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-700/50 hover:border-obsidian-600/50 transition-all duration-300 group">
            <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
            {/* Notification badge */}
            <span className="absolute top-2 right-2 flex items-center justify-center">
              <span className="absolute w-3 h-3 bg-ember-500 rounded-full animate-ping opacity-40" />
              <span className="relative w-2.5 h-2.5 bg-gradient-to-br from-ember-400 to-ember-600 rounded-full shadow-lg shadow-ember-500/50" />
            </span>
          </button>

          {/* User menu */}
          <button className="flex items-center gap-3 px-2 py-2 pr-5 rounded-xl bg-obsidian-800/50 border border-obsidian-700/40 hover:bg-obsidian-700/50 hover:border-obsidian-600/50 transition-all duration-300 group">
            {/* Avatar */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-ember-500/30 via-violet-500/20 to-azure-500/20" />
              <User className="relative w-4 h-4 text-ember-400" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-obsidian-100 group-hover:text-white transition-colors">
                Finance Team
              </p>
              <p className="text-[10px] font-medium text-obsidian-500 uppercase tracking-wider">
                Admin
              </p>
            </div>

            {/* Online indicator */}
            <div className="hidden sm:flex items-center justify-center w-2 h-2 ml-1">
              <span className="absolute w-2 h-2 bg-mint-400 rounded-full animate-pulse opacity-60" />
              <span className="relative w-1.5 h-1.5 bg-mint-400 rounded-full" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
