import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { cn, formatCurrency, formatRelativeTime } from '@/utils';
import { InvoiceStatusBadge } from '@/components/invoices';
import { LoadingSkeleton } from '@/components/common';
import type { Invoice } from '@/types';

interface RecentInvoicesProps {
  invoices: Invoice[];
  loading?: boolean;
}

export function RecentInvoices({ invoices, loading }: RecentInvoicesProps) {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between p-4 border-b border-navy-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-800/50">
            <FileText className="w-4 h-4 text-navy-400" />
          </div>
          <h3 className="font-semibold text-navy-100">Recent Invoices</h3>
        </div>
        <Link
          to="/invoices"
          className="flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="divide-y divide-navy-800/50">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <LoadingSkeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <LoadingSkeleton className="w-32 h-4 mb-2" />
                <LoadingSkeleton className="w-24 h-3" />
              </div>
              <LoadingSkeleton className="w-20 h-6" />
            </div>
          ))
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-navy-600 mb-3" />
            <p className="text-sm text-navy-400">No invoices yet</p>
            <Link
              to="/upload"
              className="mt-4 text-sm text-gold-400 hover:text-gold-300 transition-colors"
            >
              Upload your first invoice
            </Link>
          </div>
        ) : (
          invoices.map((invoice, index) => (
            <Link
              key={invoice.id}
              to={`/invoices/${invoice.id}`}
              className={cn(
                'flex items-center gap-4 p-4 hover:bg-navy-800/30 transition-all duration-200',
                'animate-fade-in opacity-0',
                `stagger-${Math.min(index + 1, 5)}`
              )}
              style={{ animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-800/50">
                <span className="text-sm font-mono font-medium text-navy-300">
                  {invoice.vendor_name?.charAt(0) || '?'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-navy-200 truncate">
                    {invoice.vendor_name || 'Unknown Vendor'}
                  </span>
                  <span className="text-xs text-navy-500 font-mono">
                    #{invoice.invoice_number || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-navy-500">
                  <span>{formatRelativeTime(invoice.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-navy-200">
                  {formatCurrency(invoice.total_amount, invoice.currency)}
                </span>
                <InvoiceStatusBadge status={invoice.status} size="sm" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
