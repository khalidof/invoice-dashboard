import { PageContainer } from '@/components/layout';
import { InvoiceUploader } from '@/components/invoices';
import type { ProcessInvoiceResponse } from '@/types';

export function Upload() {
  const handleUploadComplete = (result: ProcessInvoiceResponse) => {
    if (result.success && result.data) {
      console.log('Upload complete:', result);
    }
  };

  const handleError = (error: Error) => {
    console.error('Upload error:', error);
  };

  return (
    <PageContainer
      title="Upload Invoices"
      subtitle="Upload PDF or image files for AI-powered data extraction"
    >
      <div className="max-w-3xl mx-auto">
        <InvoiceUploader
          onUploadComplete={handleUploadComplete}
          onError={handleError}
          maxFiles={10}
        />

        {/* Help section */}
        <div className="mt-8 p-6 rounded-xl bg-navy-900/30 border border-navy-800/50">
          <h3 className="font-semibold text-navy-200 mb-4">How it works</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 font-semibold text-sm shrink-0">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-navy-200">Upload</p>
                <p className="text-xs text-navy-500">
                  Drop your invoice files or click to browse
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 font-semibold text-sm shrink-0">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-navy-200">Process</p>
                <p className="text-xs text-navy-500">
                  Claude AI extracts all invoice data automatically
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 font-semibold text-sm shrink-0">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-navy-200">Review</p>
                <p className="text-xs text-navy-500">
                  Verify extracted data and approve for processing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
