import { cn } from '@/utils';
import { CONFIDENCE_THRESHOLDS } from '@/utils/constants';

interface ConfidenceMeterProps {
  value: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'bar' | 'ring';
}

function getConfidenceLevel(value: number) {
  if (value >= CONFIDENCE_THRESHOLDS.high) {
    return {
      level: 'high',
      label: 'High Confidence',
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      ringColor: 'stroke-green-500',
    };
  }
  if (value >= CONFIDENCE_THRESHOLDS.medium) {
    return {
      level: 'medium',
      label: 'Review Recommended',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      ringColor: 'stroke-yellow-500',
    };
  }
  return {
    level: 'low',
    label: 'Manual Review Required',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    ringColor: 'stroke-red-500',
  };
}

const sizeConfig = {
  sm: { width: 40, stroke: 4, textSize: 'text-xs' },
  md: { width: 56, stroke: 5, textSize: 'text-sm' },
  lg: { width: 80, stroke: 6, textSize: 'text-base' },
};

export function ConfidenceMeter({
  value,
  size = 'md',
  showLabel = false,
  variant = 'bar',
}: ConfidenceMeterProps) {
  if (value == null) {
    return <span className="text-slate-400 text-sm">-</span>;
  }

  const config = getConfidenceLevel(value);
  const { width, stroke, textSize } = sizeConfig[size];

  if (variant === 'ring') {
    const radius = (width - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width, height: width }}>
          <svg
            className="transform -rotate-90"
            width={width}
            height={width}
          >
            {/* Background ring */}
            <circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-slate-200"
            />
            {/* Progress ring */}
            <circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn(config.ringColor, 'transition-all duration-500')}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-mono font-semibold', textSize, config.color)}>
              {value}%
            </span>
          </div>
        </div>
        {showLabel && (
          <span className={cn('text-xs font-medium', config.color)}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  // Bar variant
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={cn('font-mono font-medium', textSize, config.color)}>
          {value}%
        </span>
        {showLabel && (
          <span className="text-xs text-slate-500">{config.label}</span>
        )}
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            config.bgColor
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function ConfidenceBadge({ value }: { value: number | null }) {
  if (value == null) return null;

  const config = getConfidenceLevel(value);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.color,
        config.level === 'high' && 'bg-green-100',
        config.level === 'medium' && 'bg-yellow-100',
        config.level === 'low' && 'bg-red-100'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.bgColor)} />
      {Math.round(value)}%
    </span>
  );
}
