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
  Sparkles,
  CloudUpload,
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
    <div className="space-y-8">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer group overflow-hidden',
          isDragActive && !isDragReject
            ? 'border-ember-500 bg-ember-500/5 scale-[1.01]'
            : isDragReject
            ? 'border-rose-500 bg-rose-500/5'
            : 'border-obsidian-700/50 bg-obsidian-900/30 hover:border-obsidian-600/50 hover:bg-obsidian-800/30'
        )}
      >
        <input {...getInputProps()} />

        {/* Animated background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-ember-500/5 via-transparent to-violet-500/5 opacity-0 transition-opacity duration-500",
          isDragActive && "opacity-100"
        )} />

        {/* Decorative corner elements */}
        {['top-6 left-6 border-l-2 border-t-2 rounded-tl-xl',
          'top-6 right-6 border-r-2 border-t-2 rounded-tr-xl',
          'bottom-6 left-6 border-l-2 border-b-2 rounded-bl-xl',
          'bottom-6 right-6 border-r-2 border-b-2 rounded-br-xl'
        ].map((classes, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-10 h-10 transition-all duration-300',
              classes,
              isDragActive
                ? 'border-ember-500/60'
                : 'border-obsidian-700/40 group-hover:border-obsidian-600/60'
            )}
          />
        ))}

        {/* Upload icon with glow */}
        <div className="relative mb-8">
          <div className={cn(
            "absolute inset-0 rounded-3xl blur-2xl transition-all duration-500",
            isDragActive ? "bg-ember-500/30" : "bg-ember-500/0 group-hover:bg-ember-500/10"
          )} />
          <div
            className={cn(
              'relative flex items-center justify-center w-20 h-20 rounded-3xl transition-all duration-500',
              isDragActive
                ? 'bg-gradient-to-br from-ember-500/30 to-ember-600/20 scale-110'
                : 'bg-obsidian-800/60 group-hover:bg-obsidian-800 group-hover:scale-105'
            )}
          >
            <CloudUpload
              className={cn(
                'w-9 h-9 transition-all duration-300',
                isDragActive
                  ? 'text-ember-400'
                  : 'text-obsidian-400 group-hover:text-obsidian-300'
              )}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h3 className="text-xl font-display font-semibold text-obsidian-100 mb-3">
          {isDragActive ? 'Release to upload' : 'Drop invoices here'}
        </h3>
        <p className="text-sm text-obsidian-400 mb-6">
          Upload PDF or image files for AI-powered data extraction
        </p>

        <Button variant="secondary" size="md" className="mb-8">
          Browse Files
        </Button>

        <div className="flex items-center gap-6 text-xs text-obsidian-500">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            PDF, PNG, JPG
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-obsidian-700" />
          <span>Up to 10MB per file</span>
          <span className="w-1.5 h-1.5 rounded-full bg-obsidian-700" />
          <span>Max {maxFiles} files at once</span>
        </div>

        {/* AI badge */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-800/60 border border-obsidian-700/40">
          <Sparkles className="w-3.5 h-3.5 text-ember-400" />
          <span className="text-[10px] font-semibold text-obsidian-400 uppercase tracking-wider">
            AI Powered
          </span>
        </div>
      </div>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-obsidian-200">
              Uploads
              <span className="ml-2 text-sm font-normal text-obsidian-500">
                ({uploads.length} file{uploads.length > 1 ? 's' : ''})
              </span>
            </h4>
            {uploads.some((u) => u.status === 'success') && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
          </div>

          <div className="space-y-3">
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
        'flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300',
        status === 'success'
          ? 'bg-gradient-to-r from-mint-500/10 to-mint-500/5 border-mint-500/20'
          : status === 'error'
          ? 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 border-rose-500/20'
          : 'bg-obsidian-800/40 border-obsidian-700/30'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300',
          status === 'success'
            ? 'bg-mint-500/20'
            : status === 'error'
            ? 'bg-rose-500/20'
            : status === 'uploading' || status === 'processing'
            ? 'bg-ember-500/20'
            : 'bg-obsidian-700/50'
        )}
      >
        {status === 'uploading' || status === 'processing' ? (
          <Loader2 className="w-5 h-5 text-ember-400 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-mint-400" />
        ) : status === 'error' ? (
          <XCircle className="w-5 h-5 text-rose-400" />
        ) : (
          <FileText className="w-5 h-5 text-obsidian-400" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-obsidian-100 truncate">
            {file.name}
          </span>
          <span className="text-xs text-obsidian-500 font-mono">
            {formatFileSize(file.size)}
          </span>
        </div>

        {status === 'uploading' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-obsidian-400 mb-2">
              <span>Uploading...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 bg-obsidian-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ember-500 to-ember-400 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center gap-2 mt-2 text-xs text-ember-400">
            <Sparkles className="w-3 h-3" />
            <span>AI extracting invoice data...</span>
          </div>
        )}

        {status === 'success' && result?.data && (
          <div className="flex items-center gap-3 mt-2 text-xs text-mint-400">
            <span>Invoice #{result.data.invoice_number}</span>
            <span className="w-1 h-1 rounded-full bg-mint-500" />
            <span>{result.data.line_items_count} line items</span>
            <span className="w-1 h-1 rounded-full bg-mint-500" />
            <span className="font-semibold">{result.data.confidence}% confidence</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400">
            <AlertCircle className="w-3 h-3" />
            {error || 'Upload failed'}
          </div>
        )}
      </div>

      {/* Remove button */}
      {(status === 'success' || status === 'error' || status === 'idle') && (
        <button
          onClick={onRemove}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-obsidian-500 hover:text-obsidian-200 hover:bg-obsidian-700/50 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
