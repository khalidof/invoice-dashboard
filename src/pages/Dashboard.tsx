import {
  FileText,
  DollarSign,
  Clock,
  Cpu,
  Activity,
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
      headerExtra={
        <div className="mcp-status">
          <div className="mcp-status-dot" />
          <Cpu className="w-3.5 h-3.5" />
          <span>MCP Architecture Active</span>
          <Activity className="w-3 h-3 ml-1 text-green-500" />
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="animate-slide-up stagger-1 opacity-0 [animation-fill-mode:forwards]">
            <StatsCard
              title="Total Invoices This Month"
              value={stats?.thisMonthCount ?? 0}
              icon={<FileText className="w-5 h-5" strokeWidth={2} />}
              trend={getTrend() ?? undefined}
              loading={statsLoading}
              accentColor="ember"
            />
          </div>
          <div className="animate-slide-up stagger-2 opacity-0 [animation-fill-mode:forwards]">
            <StatsCard
              title="Total Amount Processed"
              value={formatCurrency(stats?.totalAmount ?? 0)}
              icon={<DollarSign className="w-5 h-5" strokeWidth={2} />}
              subtitle="This month"
              loading={statsLoading}
              accentColor="mint"
            />
          </div>
          <div className="animate-slide-up stagger-3 opacity-0 [animation-fill-mode:forwards]">
            <StatsCard
              title="Pending Approval"
              value={stats?.pendingCount ?? 0}
              icon={<Clock className="w-5 h-5" strokeWidth={2} />}
              subtitle="Awaiting review"
              loading={statsLoading}
              accentColor="violet"
            />
          </div>
          <div className="animate-slide-up stagger-4 opacity-0 [animation-fill-mode:forwards]">
            <StatsCard
              title="Avg. Processing Time"
              value={`${stats?.avgProcessingTime ?? 0}s`}
              icon={<Cpu className="w-5 h-5" strokeWidth={2} />}
              subtitle="MCP AI extraction"
              loading={statsLoading}
              accentColor="azure"
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Invoices - 3 columns */}
          <div className="lg:col-span-3 animate-slide-up stagger-5 opacity-0 [animation-fill-mode:forwards]">
            <RecentInvoices
              invoices={recentInvoices ?? []}
              loading={recentLoading}
            />
          </div>

          {/* Processing Queue - 2 columns */}
          <div className="lg:col-span-2 animate-slide-up stagger-6 opacity-0 [animation-fill-mode:forwards]">
            <ProcessingQueue
              invoices={processingQueue ?? []}
              loading={queueLoading}
            />
          </div>
        </div>

        {/* Vendor Spend Chart */}
        <div className="animate-fade-in opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '0.4s' }}>
          <SpendByVendor
            data={vendorSpend ?? []}
            loading={vendorLoading}
          />
        </div>
      </div>
    </PageContainer>
  );
}
