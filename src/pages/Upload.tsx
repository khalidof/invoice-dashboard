import { Cpu, Upload as UploadIcon, Sparkles, CheckCircle } from 'lucide-react';
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
      subtitle="Upload PDF or image files for MCP-powered AI extraction"
      headerExtra={
        <div className="mcp-badge">
          <span>MCP Pipeline</span>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto">
        <InvoiceUploader
          onUploadComplete={handleUploadComplete}
          onError={handleError}
          maxFiles={10}
        />

        {/* MCP Pipeline Section */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-800">MCP Processing Pipeline</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 font-semibold text-sm shrink-0">
                <UploadIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Upload</p>
                <p className="text-xs text-slate-500">
                  Drop your invoice files or click to browse
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 font-semibold text-sm shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">MCP Process</p>
                <p className="text-xs text-slate-500">
                  Claude AI extracts data via MCP architecture
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 font-semibold text-sm shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Review</p>
                <p className="text-xs text-slate-500">
                  Verify extracted data and approve for processing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-4 code-display text-xs">
          <span className="text-slate-500">// MCP Workflow Endpoint</span><br/>
          <span className="keyword">POST</span> <span className="string">/webhook/invoice-mcp-v2</span><br/>
          <span className="text-slate-500">// Pipeline: Webhook → AI Agent → Supabase</span>
        </div>
      </div>
    </PageContainer>
  );
}
