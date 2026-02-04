import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Command } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export function Header({ title, subtitle, extra }: HeaderProps) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/invoices?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
      {/* Content */}
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Page title */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-semibold text-slate-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-slate-500">{subtitle}</p>
            ) : (
              <p className="text-xs text-slate-400">{currentDate}</p>
            )}
          </div>
          {extra && <div className="hidden md:block">{extra}</div>}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-64 pl-10 pr-16 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">
              <Command className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-mono text-slate-400">K</span>
            </div>
          </form>

          {/* Notifications */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all">
            <Bell className="w-4 h-4" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
