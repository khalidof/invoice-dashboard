import { type ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
  accentColor?: 'ember' | 'violet' | 'mint' | 'azure';
  variant?: 'default' | 'dark' | 'orange';
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading,
  accentColor = 'ember',
  variant = 'default',
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg skeleton" />
          <div className="w-16 h-6 rounded-full skeleton" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-8 rounded skeleton" />
          <div className="w-32 h-4 rounded skeleton" />
        </div>
      </div>
    );
  }

  // Dark variant (like "Time Saved" card in reference)
  if (variant === 'dark') {
    return (
      <div className="feature-card-dark">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10">
            <div className="text-white">{icon}</div>
          </div>
          <span className="text-sm font-medium text-slate-300">{title}</span>
        </div>
        <h3 className="text-3xl font-display font-bold text-white mb-1">
          {value}
        </h3>
        {(subtitle || trend) && (
          <p className="text-sm text-slate-400">
            {subtitle || trend?.label}
          </p>
        )}
      </div>
    );
  }

  // Orange variant (like "Cost Savings" card in reference)
  if (variant === 'orange') {
    return (
      <div className="feature-card-orange">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
            <div className="text-white">{icon}</div>
          </div>
          <span className="text-sm font-medium text-orange-100">{title}</span>
        </div>
        <h3 className="text-3xl font-display font-bold text-white mb-1">
          {value}
        </h3>
        {(subtitle || trend) && (
          <p className="text-sm text-orange-100/80">
            {subtitle || trend?.label}
          </p>
        )}
      </div>
    );
  }

  // Default white card variant
  const iconColors = {
    ember: 'text-orange-500 bg-orange-50',
    violet: 'text-violet-500 bg-violet-50',
    mint: 'text-green-500 bg-green-50',
    azure: 'text-blue-500 bg-blue-50',
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          iconColors[accentColor]
        )}>
          {icon}
        </div>

        {/* Trend badge */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              isPositiveTrend
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            )}
          >
            {isPositiveTrend ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {/* Value */}
        <h3 className="text-2xl font-display font-bold text-slate-900">
          {value}
        </h3>

        {/* Title */}
        <p className="text-sm text-slate-500">{title}</p>

        {/* Subtitle or trend label */}
        {(subtitle || trend) && (
          <p className="text-xs text-slate-400">
            {subtitle || trend?.label}
          </p>
        )}
      </div>
    </div>
  );
}
