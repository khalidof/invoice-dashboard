import { formatCurrency } from '@/utils';
import type { LineItem } from '@/types';

interface LineItemsTableProps {
  items: LineItem[];
  currency?: string;
}

export function LineItemsTable({ items, currency = 'USD' }: LineItemsTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-navy-400 text-sm">
        No line items available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-700">
            <th className="text-left py-2 text-xs font-semibold text-navy-400 uppercase tracking-wider">
              Description
            </th>
            <th className="text-right py-2 text-xs font-semibold text-navy-400 uppercase tracking-wider w-20">
              Qty
            </th>
            <th className="text-right py-2 text-xs font-semibold text-navy-400 uppercase tracking-wider w-28">
              Unit Price
            </th>
            <th className="text-right py-2 text-xs font-semibold text-navy-400 uppercase tracking-wider w-28">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id || index}
              className="border-b border-navy-800/50 last:border-0"
            >
              <td className="py-3 text-navy-200">{item.description}</td>
              <td className="py-3 text-right font-mono text-navy-300">
                {item.quantity}
              </td>
              <td className="py-3 text-right font-mono text-navy-300">
                {formatCurrency(item.unit_price, currency)}
              </td>
              <td className="py-3 text-right font-mono text-navy-100 font-medium">
                {formatCurrency(item.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
