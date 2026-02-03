import { Link } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/utils';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { ConfidenceBadge } from '@/components/common';
import type { Invoice } from '@/types';

interface InvoiceTableProps {
  invoices: Invoice[];
  selectedIds: string[];
  onSelectAll: (selected: boolean) => void;
  onSelectOne: (id: string, selected: boolean) => void;
  onDelete?: (id: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  loading?: boolean;
}

interface Column {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

const columns: Column[] = [
  { key: 'invoice_number', label: 'Invoice #', sortable: true, width: 'w-32' },
  { key: 'vendor_name', label: 'Vendor', sortable: true, width: 'w-48' },
  { key: 'invoice_date', label: 'Date', sortable: true, width: 'w-28' },
  { key: 'due_date', label: 'Due Date', sortable: true, width: 'w-28' },
  { key: 'total_amount', label: 'Amount', sortable: true, width: 'w-32', align: 'right' },
  { key: 'status', label: 'Status', sortable: true, width: 'w-28' },
  { key: 'confidence', label: 'Confidence', sortable: true, width: 'w-24' },
  { key: 'actions', label: '', sortable: false, width: 'w-20' },
];

export function InvoiceTable({
  invoices,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
  loading,
}: InvoiceTableProps) {
  const allSelected = invoices.length > 0 && selectedIds.length === invoices.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < invoices.length;

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="w-12">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => onSelectAll(!allSelected)}
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                    allSelected || someSelected
                      ? 'bg-gold-500 border-gold-500'
                      : 'border-navy-600 hover:border-navy-500'
                  )}
                >
                  {(allSelected || someSelected) && (
                    <Check
                      className={cn(
                        'w-3 h-3 text-navy-950',
                        someSelected && 'opacity-50'
                      )}
                    />
                  )}
                </button>
              </div>
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(col.width, col.align === 'right' && 'text-right')}
              >
                {col.sortable ? (
                  <button
                    onClick={() => onSort(col.key)}
                    className="flex items-center gap-1.5 hover:text-navy-200 transition-colors group"
                  >
                    {col.label}
                    <span className="flex flex-col">
                      <ChevronUp
                        className={cn(
                          'w-3 h-3 -mb-1',
                          sortBy === col.key && sortOrder === 'asc'
                            ? 'text-gold-400'
                            : 'text-navy-600 group-hover:text-navy-500'
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'w-3 h-3',
                          sortBy === col.key && sortOrder === 'desc'
                            ? 'text-gold-400'
                            : 'text-navy-600 group-hover:text-navy-500'
                        )}
                      />
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(loading && 'opacity-50 pointer-events-none')}>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="group">
              <td>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() =>
                      onSelectOne(invoice.id, !selectedIds.includes(invoice.id))
                    }
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                      selectedIds.includes(invoice.id)
                        ? 'bg-gold-500 border-gold-500'
                        : 'border-navy-600 hover:border-navy-500'
                    )}
                  >
                    {selectedIds.includes(invoice.id) && (
                      <Check className="w-3 h-3 text-navy-950" />
                    )}
                  </button>
                </div>
              </td>
              <td>
                <Link
                  to={`/invoices/${invoice.id}`}
                  className="font-mono text-sm text-gold-400 hover:text-gold-300 transition-colors"
                >
                  {invoice.invoice_number || '-'}
                </Link>
              </td>
              <td>
                <span className="text-navy-200 truncate block max-w-[180px]">
                  {invoice.vendor_name || '-'}
                </span>
              </td>
              <td className="text-navy-300 text-sm">
                {formatDate(invoice.invoice_date)}
              </td>
              <td>
                <span
                  className={cn(
                    'text-sm',
                    isOverdue(invoice.due_date ?? null) && invoice.status !== 'paid'
                      ? 'text-error-400'
                      : 'text-navy-300'
                  )}
                >
                  {formatDate(invoice.due_date)}
                </span>
              </td>
              <td className="text-right">
                <span className="font-mono text-navy-200">
                  {formatCurrency(invoice.total_amount, invoice.currency)}
                </span>
              </td>
              <td>
                <InvoiceStatusBadge status={invoice.status} size="sm" />
              </td>
              <td>
                <ConfidenceBadge value={invoice.confidence} />
              </td>
              <td>
                <div className="relative flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="p-1.5 rounded-lg text-navy-400 hover:text-navy-200 hover:bg-navy-800 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this invoice?')) {
                          onDelete(invoice.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-navy-400 hover:text-error-400 hover:bg-error-500/10 transition-colors"
                      title="Delete invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
