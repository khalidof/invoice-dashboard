import { cn } from '@/utils';
import { formatCurrency, formatCompactCurrency } from '@/utils/formatters';

interface CurrencyDisplayProps {
  amount: number | null | undefined;
  currency?: string;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSign?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  compact = false,
  size = 'md',
  className,
  showSign = false,
}: CurrencyDisplayProps) {
  if (amount == null) {
    return <span className={cn('text-navy-500', sizeClasses[size])}>-</span>;
  }

  const formatted = compact
    ? formatCompactCurrency(amount, currency)
    : formatCurrency(amount, currency);

  const isPositive = amount > 0;

  return (
    <span
      className={cn(
        'font-mono font-medium tabular-nums',
        sizeClasses[size],
        showSign && isPositive && 'text-success-400',
        showSign && !isPositive && amount < 0 && 'text-error-400',
        className
      )}
    >
      {showSign && isPositive && '+'}
      {formatted}
    </span>
  );
}
