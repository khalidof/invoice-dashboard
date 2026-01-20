import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService, type GetInvoicesOptions } from '@/services/supabase';
import type { InvoiceStatus } from '@/types';

export function useInvoices(options?: GetInvoicesOptions) {
  return useQuery({
    queryKey: ['invoices', options],
    queryFn: () => invoiceService.getAll(options),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
}

export function useRecentInvoices(limit = 10) {
  return useQuery({
    queryKey: ['invoices', 'recent', limit],
    queryFn: () => invoiceService.getRecent(limit),
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      invoiceService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => invoiceService.getStats(),
    staleTime: 30000, // 30 seconds
  });
}

export function useVendorSpend(limit = 10) {
  return useQuery({
    queryKey: ['vendor-spend', limit],
    queryFn: () => invoiceService.getVendorSpend(limit),
    staleTime: 60000, // 1 minute
  });
}

export function useProcessingQueue() {
  return useQuery({
    queryKey: ['processing-queue'],
    queryFn: () => invoiceService.getProcessingQueue(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}
