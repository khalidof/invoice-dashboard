import {
  FileText,
  DollarSign,
  Clock,
  Zap,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import {
  StatsCard,
  RecentInvoices,
  ProcessingQueue,
  SpendByVendor,
} from '@/components/dashboard';
import {
  useDashboardStats,
  useRecentInvoices,
  useVendorSpend,
  useProcessingQueue,
  useRealtimeInvoices,
} from '@/hooks';
import { formatCurrency } from '@/utils';

export function Dashboard() {
  // Enable real-time updates
  useRealtimeInvoices();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentInvoices, isLoading: recentLoading } = useRecentInvoices(10);
  const { data: vendorSpend, isLoading: vendorLoading } = useVendorSpend(10);
  const { data: processingQueue, isLoading: queueLoading } = useProcessingQueue();

  // Calculate trend percentage
  const getTrend = () => {
    if (!stats || stats.lastMonthCount === 0) return null;
    const change = ((stats.thisMonthCount - stats.lastMonthCount) / stats.lastMonthCount) * 100;
    return {
      value: Math.round(change),
      label: 'vs last month',
    };
  };

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Welcome back! Here's your invoice processing overview."
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Invoices This Month"
            value={stats?.thisMonthCount ?? 0}
            icon={<FileText className="w-5 h-5 text-gold-400" />}
            trend={getTrend() ?? undefined}
            loading={statsLoading}
          />
          <StatsCard
            title="Total Amount Processed"
            value={formatCurrency(stats?.totalAmount ?? 0)}
            icon={<DollarSign className="w-5 h-5 text-success-400" />}
            subtitle="This month"
            loading={statsLoading}
          />
          <StatsCard
            title="Pending Approval"
            value={stats?.pendingCount ?? 0}
            icon={<Clock className="w-5 h-5 text-warning-400" />}
            subtitle="Awaiting review"
            loading={statsLoading}
          />
          <StatsCard
            title="Avg. Processing Time"
            value={`${stats?.avgProcessingTime ?? 0}s`}
            icon={<Zap className="w-5 h-5 text-blue-400" />}
            subtitle="AI extraction speed"
            loading={statsLoading}
          />
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Invoices - 3 columns */}
          <div className="lg:col-span-3">
            <RecentInvoices
              invoices={recentInvoices ?? []}
              loading={recentLoading}
            />
          </div>

          {/* Processing Queue - 2 columns */}
          <div className="lg:col-span-2">
            <ProcessingQueue
              invoices={processingQueue ?? []}
              loading={queueLoading}
            />
          </div>
        </div>

        {/* Vendor Spend Chart */}
        <SpendByVendor
          data={vendorSpend ?? []}
          loading={vendorLoading}
        />
      </div>
    </PageContainer>
  );
}
