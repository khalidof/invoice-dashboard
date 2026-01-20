import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { processInvoice } from '@/services/api';
import type { ProcessInvoiceResponse } from '@/types';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  result: ProcessInvoiceResponse | null;
  error: string | null;
}

export function useInvoiceUpload() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    result: null,
    error: null,
  });

  const upload = useCallback(
    async (file: File) => {
      setState({ status: 'uploading', progress: 0, result: null, error: null });

      try {
        const result = await processInvoice(file, (progress) => {
          setState((prev) => ({
            ...prev,
            status: progress < 50 ? 'uploading' : 'processing',
            progress,
          }));
        });

        if (result.success) {
          setState({ status: 'success', progress: 100, result, error: null });
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        } else {
          setState({
            status: 'error',
            progress: 0,
            result: null,
            error: result.message || 'Processing failed',
          });
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Upload failed';
        setState({ status: 'error', progress: 0, result: null, error });
        throw err;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0, result: null, error: null });
  }, []);

  return { ...state, upload, reset };
}
