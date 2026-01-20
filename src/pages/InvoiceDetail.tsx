import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Check,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { InvoiceStatusBadge, ExtractionResult } from '@/components/invoices';
import { Button, LoadingPage } from '@/components/common';
import { useInvoice, useUpdateInvoiceStatus, useDeleteInvoice } from '@/hooks';
import { formatDate } from '@/utils';

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
          <p className="text-error-400 mb-4">Invoice not found</p>
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
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/invoices"
              className="flex items-center gap-2 text-sm text-navy-400 hover:text-navy-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Invoices
            </Link>
            <span className="text-navy-700">/</span>
            <span className="text-sm text-navy-300 font-mono">
              {invoice.invoice_number || invoice.id.slice(0, 8)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-navy-900/50 border border-navy-800">
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
              // Would trigger reprocessing via n8n
              alert('Reprocessing not implemented - would call n8n webhook');
            }}
          >
            Reprocess
          </Button>
        </div>

        {/* Main Content - 2 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - File preview */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-navy-800/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-800/50">
                  <FileText className="w-4 h-4 text-navy-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-100">
                    {invoice.file_name || 'Invoice Document'}
                  </h3>
                  <p className="text-xs text-navy-500">Original file</p>
                </div>
              </div>
              {invoice.file_url && (
                <a
                  href={invoice.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                >
                  Open
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="relative aspect-[3/4] bg-navy-950">
              {invoice.file_url ? (
                <iframe
                  src={`${invoice.file_url}#toolbar=0&navpanes=0`}
                  className="absolute inset-0 w-full h-full"
                  title="Invoice PDF"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-navy-700 mx-auto mb-4" />
                    <p className="text-sm text-navy-500">No preview available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Extracted data */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-navy-800/50">
              <h3 className="font-semibold text-navy-100">Extracted Data</h3>
              <p className="text-xs text-navy-500">AI-powered data extraction</p>
            </div>

            <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              <ExtractionResult
                data={invoice.extracted_data}
                confidence={invoice.confidence}
              />
            </div>
          </div>
        </div>

        {/* Flags/Anomalies */}
        {invoice.flags && invoice.flags.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="font-semibold text-navy-100 mb-3">Flags & Anomalies</h3>
            <div className="flex flex-wrap gap-2">
              {invoice.flags.map((flag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-warning-500/10 border border-warning-500/20 text-sm text-warning-400"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="p-4 rounded-xl border border-error-500/20 bg-error-500/5">
          <h3 className="text-sm font-semibold text-error-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-navy-400 mb-4">
            Deleting an invoice is permanent and cannot be undone.
          </p>
          <Button
            variant="danger"
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
