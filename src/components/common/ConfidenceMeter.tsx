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
      color: 'text-success-400',
      bgColor: 'bg-success-500',
      ringColor: 'stroke-success-500',
    };
  }
  if (value >= CONFIDENCE_THRESHOLDS.medium) {
    return {
      level: 'medium',
      label: 'Review Recommended',
      color: 'text-warning-400',
      bgColor: 'bg-warning-500',
      ringColor: 'stroke-warning-500',
    };
  }
  return {
    level: 'low',
    label: 'Manual Review Required',
    color: 'text-error-400',
    bgColor: 'bg-error-500',
    ringColor: 'stroke-error-500',
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
    return <span className="text-navy-500 text-sm">-</span>;
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
              className="text-navy-800"
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
          <span className="text-xs text-navy-400">{config.label}</span>
        )}
      </div>
      <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
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
        config.level === 'high' && 'bg-success-500/10',
        config.level === 'medium' && 'bg-warning-500/10',
        config.level === 'low' && 'bg-error-500/10'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.bgColor)} />
      {value}%
    </span>
  );
}
