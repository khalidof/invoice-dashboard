import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatCompactCurrency, formatCurrency } from '@/utils';
import { LoadingSkeleton } from '@/components/common';
import type { VendorSpend } from '@/types';

interface SpendByVendorProps {
  data: VendorSpend[];
  loading?: boolean;
}

const COLORS = [
  '#fbbf24', // gold-400
  '#60a5fa', // blue-400
  '#34d399', // success-400
  '#f472b6', // pink-400
  '#a78bfa', // purple-400
  '#fb923c', // orange-400
  '#2dd4bf', // teal-400
  '#f87171', // red-400
  '#818cf8', // indigo-400
  '#22d3ee', // cyan-400
];

export function SpendByVendor({ data, loading }: SpendByVendorProps) {
  const totalSpend = data.reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between p-4 border-b border-navy-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-800/50">
            <BarChart3 className="w-4 h-4 text-navy-400" />
          </div>
          <div>
            <h3 className="font-semibold text-navy-100">Spend by Vendor</h3>
            <p className="text-xs text-navy-500">Top 10 vendors by total spend</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-navy-500">Total</p>
          <p className="text-lg font-mono font-semibold text-gold-400">
            {formatCompactCurrency(totalSpend)}
          </p>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <LoadingSkeleton className="w-24 h-4" />
                <LoadingSkeleton className="flex-1 h-6 rounded-full" />
                <LoadingSkeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="w-10 h-10 text-navy-600 mb-3" />
            <p className="text-sm text-navy-400">No vendor data yet</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  hide
                  domain={[0, 'dataMax']}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: '#829ab1', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 15 ? `${value.slice(0, 15)}...` : value
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as VendorSpend;
                      const percentage = ((data.amount / totalSpend) * 100).toFixed(1);
                      return (
                        <div className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium text-navy-100 mb-1">
                            {data.name}
                          </p>
                          <p className="text-sm text-gold-400 font-mono">
                            {formatCurrency(data.amount)}
                          </p>
                          <p className="text-xs text-navy-400 mt-1">
                            {percentage}% of total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="amount"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
