import { Bell, Search, User } from 'lucide-react';

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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-navy-950/80 backdrop-blur-xl border-b border-navy-800/50">
      {/* Left side - Page title */}
      <div>
        <h1 className="text-xl font-display font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-navy-400">{subtitle}</p>}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Date */}
        <span className="hidden md:block text-sm text-navy-400">{currentDate}</span>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-64 pl-10 pr-4 py-2 bg-navy-900/50 border border-navy-700 rounded-lg text-sm text-navy-100 placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/30 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-2xs font-mono bg-navy-800 border border-navy-700 rounded text-navy-500">
            /
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-navy-800/50 border border-navy-700/50 text-navy-400 hover:text-navy-200 hover:bg-navy-700/50 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
        </button>

        {/* User menu */}
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-lg bg-navy-800/50 border border-navy-700/50 hover:bg-navy-700/50 transition-all">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-500/20">
            <User className="w-4 h-4 text-gold-400" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-navy-100">Finance Team</p>
            <p className="text-2xs text-navy-500">Accenture</p>
          </div>
        </button>
      </div>
    </header>
  );
}
