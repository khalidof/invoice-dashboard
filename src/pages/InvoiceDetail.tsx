import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Check,
  X,
  FileText,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Trash2,
  Clock,
  Building2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { InvoiceStatusBadge, ExtractionResult } from '@/components/invoices';
import { Button, LoadingPage } from '@/components/common';
import { useInvoice, useUpdateInvoiceStatus, useDeleteInvoice } from '@/hooks';
import { formatDate, formatCurrency } from '@/utils';

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading, error } = useInvoice(id!);
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();

  const handleApprove = async () => {
    if (id) {
      await updateStatus.mutateAsync({ id, status: 'approved' });
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason !== null && id) {
      await updateStatus.mutateAsync({ id, status: 'rejected' });
    }
  };

  const handleMarkPaid = async () => {
    if (id) {
      await updateStatus.mutateAsync({ id, status: 'paid' });
    }
  };

  const handleDelete = async () => {
    if (id && confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice.mutateAsync(id);
      navigate('/invoices');
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Invoice Details">
        <LoadingPage />
      </PageContainer>
    );
  }

  if (error || !invoice) {
    return (
      <PageContainer title="Invoice Details">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">Invoice not found</p>
          <Button onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Invoice ${invoice.invoice_number || 'Details'}`}
      subtitle={`Uploaded on ${formatDate(invoice.uploaded_at)}`}
    >
      <div className="space-y-6">
        {/* Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/invoices"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Invoices
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-700 font-mono">
              {invoice.invoice_number || invoice.id.slice(0, 8)}
            </span>
          </div>

          <InvoiceStatusBadge status={invoice.status} />
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 truncate">
              {invoice.vendor_name || 'Unknown'}
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 font-mono">
              {formatCurrency(invoice.total_amount, invoice.currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice Date</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {invoice.invoice_date ? formatDate(invoice.invoice_date) : 'N/A'}
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          {(invoice.status === 'pending' || invoice.status === 'processed') && (
            <>
              <Button
                variant="success"
                icon={<Check className="w-4 h-4" />}
                onClick={handleApprove}
                loading={updateStatus.isPending}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                icon={<X className="w-4 h-4" />}
                onClick={handleReject}
                loading={updateStatus.isPending}
              >
                Reject
              </Button>
            </>
          )}
          {invoice.status === 'approved' && (
            <Button
              variant="primary"
              icon={<Check className="w-4 h-4" />}
              onClick={handleMarkPaid}
              loading={updateStatus.isPending}
            >
              Mark as Paid
            </Button>
          )}
          {invoice.file_url && (
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => window.open(invoice.file_url!, '_blank')}
            >
              Download PDF
            </Button>
          )}
          <Button
            variant="ghost"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              alert('Reprocessing would trigger the n8n MCP workflow again');
            }}
          >
            Reprocess
          </Button>
        </div>

        {/* Main Content - 2 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - File preview */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {invoice.file_name || 'Invoice Document'}
                  </h3>
                  <p className="text-xs text-slate-500">Original uploaded file</p>
                </div>
              </div>
              {invoice.file_url && (
                <a
                  href={invoice.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 transition-colors font-medium"
                >
                  Open
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="relative aspect-[3/4] bg-slate-100">
              {invoice.file_url ? (
                <iframe
                  src={`${invoice.file_url}#toolbar=0&navpanes=0`}
                  className="absolute inset-0 w-full h-full"
                  title="Invoice PDF"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500">No preview available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Extracted data */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Extracted Data</h3>
                  <p className="text-xs text-slate-500">AI-powered MCP extraction</p>
                </div>
              </div>
              {invoice.confidence && (
                <div className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                  <span className="text-sm font-medium text-green-700">
                    {Math.round(invoice.confidence * 100)}% confidence
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 max-h-[600px] overflow-y-auto">
              <ExtractionResult
                data={invoice.extracted_data}
                confidence={invoice.confidence}
                invoice={invoice}
              />
            </div>
          </div>
        </div>

        {/* Flags/Anomalies */}
        {invoice.flags && invoice.flags.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-800">Flags & Anomalies</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {invoice.flags.map((flag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="p-5 rounded-xl border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Deleting an invoice is permanent and cannot be undone.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={deleteInvoice.isPending}
          >
            Delete Invoice
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
