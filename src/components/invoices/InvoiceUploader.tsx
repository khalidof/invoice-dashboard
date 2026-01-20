import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn, formatFileSize } from '@/utils';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/utils/constants';
import { Button } from '@/components/common';
import type { ProcessInvoiceResponse } from '@/types';

interface InvoiceUploaderProps {
  onUploadComplete?: (result: ProcessInvoiceResponse) => void;
  onError?: (error: Error) => void;
  maxFiles?: number;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface FileUploadState {
  file: File;
  status: UploadStatus;
  progress: number;
  result?: ProcessInvoiceResponse;
  error?: string;
}

export function InvoiceUploader({
  onUploadComplete,
  onError,
  maxFiles = 10,
}: InvoiceUploaderProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);

  const processFile = useCallback(
    async (file: File, index: number) => {
      const updateUpload = (updates: Partial<FileUploadState>) => {
        setUploads((prev) =>
          prev.map((u, i) => (i === index ? { ...u, ...updates } : u))
        );
      };

      try {
        updateUpload({ status: 'uploading', progress: 10 });

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        updateUpload({ progress: 40 });

        // Send to n8n webhook
        const webhookUrl =
          import.meta.env.VITE_N8N_WEBHOOK_URL ||
          'http://localhost:5678/webhook/process-invoice-pro';

        updateUpload({ status: 'processing', progress: 60 });

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_base64: base64,
            mime_type: file.type,
            filename: file.name,
            source: 'dashboard',
          }),
        });

        updateUpload({ progress: 90 });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result: ProcessInvoiceResponse = await response.json();

        if (result.success) {
          updateUpload({ status: 'success', progress: 100, result });
          onUploadComplete?.(result);
        } else {
          throw new Error(result.message || 'Processing failed');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        updateUpload({ status: 'error', error: error.message });
        onError?.(error);
      }
    },
    [onUploadComplete, onError]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newUploads: FileUploadState[] = acceptedFiles.map((file) => ({
        file,
        status: 'idle' as const,
        progress: 0,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Process files sequentially
      const startIndex = uploads.length;
      acceptedFiles.forEach((file, i) => {
        setTimeout(() => processFile(file, startIndex + i), i * 500);
      });
    },
    [uploads.length, processFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    multiple: true,
  });

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status !== 'success'));
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group',
          isDragActive && !isDragReject
            ? 'border-gold-500 bg-gold-500/5 scale-[1.02]'
            : isDragReject
            ? 'border-error-500 bg-error-500/5'
            : 'border-navy-700 bg-navy-900/30 hover:border-navy-600 hover:bg-navy-900/50'
        )}
      >
        <input {...getInputProps()} />

        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-navy-700 rounded-tl-lg group-hover:border-gold-500/50 transition-colors" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-navy-700 rounded-tr-lg group-hover:border-gold-500/50 transition-colors" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-navy-700 rounded-bl-lg group-hover:border-gold-500/50 transition-colors" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-navy-700 rounded-br-lg group-hover:border-gold-500/50 transition-colors" />

        <div
          className={cn(
            'flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-all duration-300',
            isDragActive
              ? 'bg-gold-500/20 scale-110'
              : 'bg-navy-800/50 group-hover:bg-navy-800'
          )}
        >
          <Upload
            className={cn(
              'w-8 h-8 transition-colors',
              isDragActive ? 'text-gold-400' : 'text-navy-400 group-hover:text-navy-300'
            )}
          />
        </div>

        <h3 className="text-lg font-semibold text-navy-200 mb-2">
          {isDragActive ? 'Drop to upload' : 'Drag & drop invoices here'}
        </h3>
        <p className="text-sm text-navy-400 mb-4">or click to browse</p>

        <div className="flex items-center gap-4 text-xs text-navy-500">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            PDF, PNG, JPG
          </span>
          <span className="w-1 h-1 rounded-full bg-navy-600" />
          <span>Up to 10MB</span>
          <span className="w-1 h-1 rounded-full bg-navy-600" />
          <span>Max {maxFiles} files</span>
        </div>
      </div>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-navy-300">
              Uploads ({uploads.length})
            </h4>
            {uploads.some((u) => u.status === 'success') && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {uploads.map((upload, index) => (
              <UploadItem
                key={`${upload.file.name}-${index}`}
                upload={upload}
                onRemove={() => removeUpload(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadItem({
  upload,
  onRemove,
}: {
  upload: FileUploadState;
  onRemove: () => void;
}) {
  const { file, status, progress, result, error } = upload;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all',
        status === 'success'
          ? 'bg-success-500/5 border-success-500/20'
          : status === 'error'
          ? 'bg-error-500/5 border-error-500/20'
          : 'bg-navy-900/50 border-navy-800'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          status === 'success'
            ? 'bg-success-500/20'
            : status === 'error'
            ? 'bg-error-500/20'
            : 'bg-navy-800'
        )}
      >
        {status === 'uploading' || status === 'processing' ? (
          <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-success-400" />
        ) : status === 'error' ? (
          <XCircle className="w-5 h-5 text-error-400" />
        ) : (
          <FileText className="w-5 h-5 text-navy-400" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-navy-200 truncate">
            {file.name}
          </span>
          <span className="text-xs text-navy-500">{formatFileSize(file.size)}</span>
        </div>

        {status === 'uploading' && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-navy-400 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center gap-2 mt-1 text-xs text-gold-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            AI extracting data...
          </div>
        )}

        {status === 'success' && result?.data && (
          <div className="flex items-center gap-3 mt-1 text-xs text-success-400">
            <span>Invoice #{result.data.invoice_number}</span>
            <span className="w-1 h-1 rounded-full bg-success-500" />
            <span>{result.data.line_items_count} line items</span>
            <span className="w-1 h-1 rounded-full bg-success-500" />
            <span>{result.data.confidence}% confidence</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-error-400">
            <AlertCircle className="w-3 h-3" />
            {error || 'Upload failed'}
          </div>
        )}
      </div>

      {/* Remove button */}
      {(status === 'success' || status === 'error' || status === 'idle') && (
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-navy-500 hover:text-navy-300 hover:bg-navy-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
