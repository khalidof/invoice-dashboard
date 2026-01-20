import { cn } from '@/utils';
import { STATUS_CONFIG } from '@/utils/constants';
import type { InvoiceStatus } from '@/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
}

export function InvoiceStatusBadge({ status, size = 'md' }: InvoiceStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'pending' && 'bg-warning-400',
          status === 'processed' && 'bg-blue-400',
          status === 'approved' && 'bg-success-400',
          status === 'paid' && 'bg-navy-400',
          status === 'rejected' && 'bg-error-400'
        )}
      />
      {config.label}
    </span>
  );
}
