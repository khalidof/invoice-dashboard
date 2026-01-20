import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  CheckSquare,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { InvoiceTable } from '@/components/invoices';
import { Button, EmptyState, LoadingPage } from '@/components/common';
import { useInvoices, useDeleteInvoice, useUpdateInvoiceStatus } from '@/hooks';
import { cn, INVOICE_STATUSES, ITEMS_PER_PAGE } from '@/utils';
import type { InvoiceStatus } from '@/types';

export function InvoiceList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = (searchParams.get('status') as InvoiceStatus) || undefined;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  // Local state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  // Queries
  const { data, isLoading, error } = useInvoices({
    page,
    pageSize: ITEMS_PER_PAGE,
    status,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const deleteInvoice = useDeleteInvoice();
  const updateStatus = useUpdateInvoiceStatus();

  // Handlers
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput || undefined, page: '1' });
  };

  const handleSort = (column: string) => {
    const newOrder =
      sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    updateParams({ sortBy: column, sortOrder: newOrder });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.data) {
      setSelectedIds(data.data.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      await updateStatus.mutateAsync({ id, status: 'approved' });
    }
    setSelectedIds([]);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice.mutateAsync(id);
    }
  };

  if (error) {
    return (
      <PageContainer title="Invoices">
        <div className="text-center py-12">
          <p className="text-error-400">Failed to load invoices</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Invoices" subtitle={`${data?.count ?? 0} total invoices`}>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 sm:flex-initial">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input pl-10 pr-10 w-full sm:w-72"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateParams({ search: undefined, page: '1' });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Filter toggle */}
            <Button
              variant={showFilters ? 'secondary' : 'ghost'}
              size="md"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
              {status && (
                <span className="ml-1 w-2 h-2 rounded-full bg-gold-400" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20">
                <span className="text-sm text-gold-400">
                  {selectedIds.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<CheckSquare className="w-4 h-4" />}
                  onClick={handleBulkApprove}
                  loading={updateStatus.isPending}
                >
                  Approve
                </Button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1 text-navy-400 hover:text-navy-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Export */}
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-navy-900/50 border border-navy-800 animate-scale-in">
            <span className="text-sm text-navy-400 self-center mr-2">Status:</span>
            <button
              onClick={() => updateParams({ status: undefined, page: '1' })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                !status
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'text-navy-400 hover:text-navy-200 hover:bg-navy-800'
              )}
            >
              All
            </button>
            {INVOICE_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ status: s, page: '1' })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                  status === s
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                    : 'text-navy-400 hover:text-navy-200 hover:bg-navy-800'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <LoadingPage />
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState
            icon="file"
            title="No invoices found"
            description={
              search || status
                ? 'Try adjusting your search or filters'
                : 'Upload your first invoice to get started'
            }
            action={
              !search && !status ? (
                <Button onClick={() => navigate('/upload')}>
                  Upload Invoice
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <InvoiceTable
              invoices={data.data}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onDelete={handleDelete}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              loading={isLoading}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-navy-400">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(page * ITEMS_PER_PAGE, data.count)} of {data.count}{' '}
                invoices
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft className="w-4 h-4" />}
                  onClick={() =>
                    updateParams({ page: String(Math.max(1, page - 1)) })
                  }
                  disabled={page === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (data.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= data.totalPages - 2) {
                      pageNum = data.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateParams({ page: String(pageNum) })}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                          page === pageNum
                            ? 'bg-gold-500/20 text-gold-400'
                            : 'text-navy-400 hover:text-navy-200 hover:bg-navy-800'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() =>
                    updateParams({ page: String(Math.min(data.totalPages, page + 1)) })
                  }
                  disabled={page === data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
