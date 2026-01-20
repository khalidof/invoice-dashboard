import { Link } from 'react-router-dom';
import { Clock, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { cn, formatRelativeTime } from '@/utils';
import { LoadingSkeleton } from '@/components/common';
import type { Invoice } from '@/types';

interface ProcessingQueueProps {
  invoices: Invoice[];
  loading?: boolean;
}

export function ProcessingQueue({ invoices, loading }: ProcessingQueueProps) {
  return (
    <div className="glass-card h-full">
      <div className="flex items-center justify-between p-4 border-b border-navy-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-800/50">
            <Clock className="w-4 h-4 text-navy-400" />
          </div>
          <h3 className="font-semibold text-navy-100">Processing Queue</h3>
        </div>
        {invoices.length > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning-500/10 text-xs font-medium text-warning-400">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-400 animate-pulse" />
            {invoices.length} pending
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/30"
            >
              <LoadingSkeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <LoadingSkeleton className="w-24 h-4 mb-1" />
                <LoadingSkeleton className="w-16 h-3" />
              </div>
              <LoadingSkeleton className="w-5 h-5 rounded-full" />
            </div>
          ))
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success-500/10 mb-3">
              <CheckCircle2 className="w-6 h-6 text-success-400" />
            </div>
            <p className="text-sm text-navy-300 font-medium">Queue Clear</p>
            <p className="text-xs text-navy-500 mt-1">
              All invoices have been processed
            </p>
          </div>
        ) : (
          invoices.map((invoice, index) => (
            <Link
              key={invoice.id}
              to={`/invoices/${invoice.id}`}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg bg-navy-900/30 border border-navy-800/50',
                'hover:bg-navy-800/30 hover:border-navy-700/50 transition-all duration-200',
                'animate-slide-up opacity-0',
                `stagger-${Math.min(index + 1, 5)}`
              )}
              style={{ animationFillMode: 'forwards' }}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg',
                  invoice.status === 'pending'
                    ? 'bg-warning-500/10'
                    : 'bg-blue-500/10'
                )}
              >
                {invoice.status === 'pending' ? (
                  <Loader2 className="w-4 h-4 text-warning-400 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-200 truncate">
                  {invoice.file_name || invoice.invoice_number || 'Processing...'}
                </p>
                <p className="text-xs text-navy-500">
                  {formatRelativeTime(invoice.created_at)}
                </p>
              </div>

              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  invoice.status === 'pending'
                    ? 'bg-warning-400 animate-pulse'
                    : 'bg-blue-400'
                )}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
