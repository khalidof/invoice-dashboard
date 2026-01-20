import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading,
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-navy-800" />
          <div className="w-16 h-4 rounded bg-navy-800" />
        </div>
        <div className="w-24 h-8 rounded bg-navy-800 mb-2" />
        <div className="w-32 h-4 rounded bg-navy-800" />
      </div>
    );
  }

  return (
    <div className="stat-card group hover:border-navy-600/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-800/50 group-hover:bg-navy-800 transition-colors">
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              isPositiveTrend
                ? 'bg-success-500/10 text-success-400'
                : 'bg-error-500/10 text-error-400'
            )}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-display font-semibold text-white tracking-tight">
          {value}
        </h3>
        <p className="text-sm text-navy-400">{title}</p>
        {subtitle && <p className="text-xs text-navy-500">{subtitle}</p>}
        {trend && (
          <p className="text-xs text-navy-500">{trend.label}</p>
        )}
      </div>
    </div>
  );
}
