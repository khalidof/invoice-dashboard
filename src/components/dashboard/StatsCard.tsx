import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
}

const accentStyles = {
  ember: {
    iconBg: 'bg-gradient-to-br from-ember-500/20 to-ember-600/10',
    iconColor: 'text-ember-400',
    glow: 'bg-ember-500/10',
  },
  violet: {
    iconBg: 'bg-gradient-to-br from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
    glow: 'bg-violet-500/10',
  },
  mint: {
    iconBg: 'bg-gradient-to-br from-mint-500/20 to-mint-600/10',
    iconColor: 'text-mint-400',
    glow: 'bg-mint-500/10',
  },
  azure: {
    iconBg: 'bg-gradient-to-br from-azure-500/20 to-azure-600/10',
    iconColor: 'text-azure-400',
    glow: 'bg-azure-500/10',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading,
  accentColor = 'ember',
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;
  const accent = accentStyles[accentColor];

  if (loading) {
    return (
      <div className="stat-card">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl skeleton" />
          <div className="w-20 h-7 rounded-full skeleton" />
        </div>
        <div className="space-y-3">
          <div className="w-32 h-10 rounded-lg skeleton" />
          <div className="w-24 h-4 rounded skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card group relative">
      {/* Accent glow on hover */}
      <div className={cn(
        "absolute -inset-px rounded-[21px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
        accent.glow
      )} />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          {/* Icon */}
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group-hover:scale-105",
            accent.iconBg
          )}>
            <div className={accent.iconColor}>
              {icon}
            </div>
          </div>

          {/* Trend badge */}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300',
                isPositiveTrend
                  ? 'bg-gradient-to-r from-mint-500/15 to-mint-500/5 text-mint-400 border border-mint-500/20'
                  : 'bg-gradient-to-r from-rose-500/15 to-rose-500/5 text-rose-400 border border-rose-500/20'
              )}
            >
              {isPositiveTrend ? (
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* Value */}
          <h3 className="text-3xl font-display font-bold text-white tracking-tight">
            {value}
          </h3>

          {/* Title */}
          <p className="text-sm font-medium text-obsidian-400">{title}</p>

          {/* Subtitle or trend label */}
          {(subtitle || trend) && (
            <p className="text-xs text-obsidian-500">
              {subtitle || trend?.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
