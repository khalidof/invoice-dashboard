import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  AlertCircle,
  Upload,
  WifiOff,
  Server,
  FileWarning,
  RefreshCw,
} from 'lucide-react';
import { cn, formatFileSize } from '@/utils';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/utils/constants';
import { Button } from '@/components/common';
import { processInvoice } from '@/services/api';
import type { ProcessInvoiceResponse } from '@/types';

// Error types for better user feedback
interface ErrorInfo {
  type: 'connection' | 'server' | 'timeout' | 'parse' | 'validation' | 'unknown';
  title: string;
  message: string;
  suggestion: string;
}

function parseError(error: unknown, _responseText?: string): ErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Connection refused / network error
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ECONNREFUSED')) {
    return {
      type: 'connection',
      title: 'Connection Failed',
      message: 'Cannot connect to the processing server',
      suggestion: 'Make sure n8n is running and the webhook workflow is active',
    };
  }

  // JSON parse error (empty response)
  if (errorMessage.includes('Unexpected end of JSON') || errorMessage.includes('JSON')) {
    return {
      type: 'parse',
      title: 'Invalid Response',
      message: 'The server returned an empty or invalid response',
      suggestion: 'Check if the n8n workflow is in "listening" mode (click Execute workflow in n8n)',
    };
  }

  // Timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
    return {
      type: 'timeout',
      title: 'Request Timeout',
      message: 'The server took too long to respond',
      suggestion: 'The invoice may be complex. Try again or check n8n logs',
    };
  }

  // Server error (5xx)
  if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'The processing server encountered an error',
      suggestion: 'Check the n8n workflow execution logs for details',
    };
  }

  // Validation error
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      type: 'validation',
      title: 'Validation Error',
      message: errorMessage,
      suggestion: 'Check if the file is a valid invoice document',
    };
  }

  // Generic error with original message
  return {
    type: 'unknown',
    title: 'Upload Failed',
    message: errorMessage,
    suggestion: 'Try again or check the browser console for more details',
  };
}

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
  errorInfo?: ErrorInfo;
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

        // Use the processInvoice function which handles storage and optional n8n processing
        const result = await processInvoice(file, (progress) => {
          updateUpload({
            status: progress < 50 ? 'uploading' : 'processing',
            progress,
          });
        });

        if (result.success) {
          updateUpload({ status: 'success', progress: 100, result });
          onUploadComplete?.(result);
        } else {
          throw new Error(result.message || 'Processing failed');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        const errorInfo = parseError(err);
        updateUpload({ status: 'error', error: error.message, errorInfo });
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

  const retryUpload = (index: number) => {
    const upload = uploads[index];
    if (upload && upload.status === 'error') {
      // Reset the upload state and retry
      setUploads((prev) =>
        prev.map((u, i) =>
          i === index ? { ...u, status: 'idle' as const, progress: 0, error: undefined, errorInfo: undefined } : u
        )
      );
      // Process the file again
      setTimeout(() => processFile(upload.file, index), 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer',
          isDragActive && !isDragReject
            ? 'border-orange-500 bg-orange-50'
            : isDragReject
            ? 'border-red-500 bg-red-50'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        )}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <div className={cn(
          'flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-colors',
          isDragActive
            ? 'bg-orange-100 text-orange-500'
            : 'bg-slate-100 text-slate-400'
        )}>
          <Upload className="w-7 h-7" strokeWidth={1.5} />
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          {isDragActive ? 'Drop files here' : 'Upload invoices'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Drag and drop files or click to browse
        </p>

        <Button variant="primary" size="md">
          Browse Files
        </Button>

        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            PDF, PNG, JPG
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>Up to 10MB per file</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>Max {maxFiles} files</span>
        </div>
      </div>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">
              Uploads
              <span className="ml-2 text-slate-400 font-normal">
                ({uploads.length} file{uploads.length > 1 ? 's' : ''})
              </span>
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
                onRetry={() => retryUpload(index)}
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
  onRetry,
}: {
  upload: FileUploadState;
  onRemove: () => void;
  onRetry?: () => void;
}) {
  const { file, status, progress, result, error, errorInfo } = upload;

  const getErrorIcon = () => {
    if (!errorInfo) return <XCircle className="w-5 h-5" />;
    switch (errorInfo.type) {
      case 'connection':
        return <WifiOff className="w-5 h-5" />;
      case 'server':
        return <Server className="w-5 h-5" />;
      case 'parse':
        return <FileWarning className="w-5 h-5" />;
      default:
        return <XCircle className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border transition-all',
        status === 'success'
          ? 'bg-green-50 border-green-200'
          : status === 'error'
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-slate-200'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          status === 'success'
            ? 'bg-green-100 text-green-600'
            : status === 'error'
            ? 'bg-red-100 text-red-600'
            : status === 'uploading' || status === 'processing'
            ? 'bg-orange-100 text-orange-600'
            : 'bg-slate-100 text-slate-500'
        )}
      >
        {status === 'uploading' || status === 'processing' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : status === 'error' ? (
          getErrorIcon()
        ) : (
          <FileText className="w-5 h-5" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 truncate">
            {file.name}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {formatFileSize(file.size)}
          </span>
        </div>

        {status === 'uploading' && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'processing' && (
          <p className="mt-1 text-xs text-orange-600">
            Processing invoice...
          </p>
        )}

        {status === 'success' && result?.data && (
          <p className="mt-1 text-xs text-green-600">
            Invoice #{result.data.invoice_number} • {result.data.line_items_count} items • {result.data.confidence}% confidence
          </p>
        )}

        {status === 'error' && errorInfo && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-red-700">
              {errorInfo.title}
            </p>
            <p className="text-xs text-red-600">
              {errorInfo.message}
            </p>
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{errorInfo.suggestion}</span>
            </p>
          </div>
        )}

        {status === 'error' && !errorInfo && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error || 'Upload failed'}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            title="Retry upload"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        {(status === 'success' || status === 'error' || status === 'idle') && (
          <button
            onClick={onRemove}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
