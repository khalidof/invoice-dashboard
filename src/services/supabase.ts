import { createClient } from '@supabase/supabase-js';
import type { Invoice, InvoiceStatus, InvoiceLineItemDB } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock data.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export interface GetInvoicesOptions {
  page?: number;
  pageSize?: number;
  status?: InvoiceStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export const invoiceService = {
  async getAll(options?: GetInvoicesOptions) {
    const {
      page = 1,
      pageSize = 25,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = options || {};

    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,vendor_name.ilike.%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('invoice_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('invoice_date', dateTo);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Invoice[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        line_items:invoice_line_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Invoice & { line_items: InvoiceLineItemDB[] };
  },

  async getRecent(limit = 10) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, vendor_name, total_amount, currency, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Invoice[];
  },

  async updateStatus(id: string, status: InvoiceStatus) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // This month's invoices
    const { count: thisMonthCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Last month's invoices (for comparison)
    const { count: lastMonthCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    // Total amount this month
    const { data: amountData } = await supabase
      .from('invoices')
      .select('total_amount')
      .gte('created_at', startOfMonth.toISOString());

    const totalAmount = amountData?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

    // Pending approval count
    const { count: pendingCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processed']);

    return {
      thisMonthCount: thisMonthCount || 0,
      lastMonthCount: lastMonthCount || 0,
      totalAmount,
      pendingCount: pendingCount || 0,
      avgProcessingTime: 4.2, // Mock value - would need actual tracking
    };
  },

  async getVendorSpend(limit = 10) {
    const { data, error } = await supabase
      .from('invoices')
      .select('vendor_name, total_amount')
      .not('vendor_name', 'is', null);

    if (error) throw error;

    // Aggregate by vendor
    const vendorMap = new Map<string, number>();
    data?.forEach(inv => {
      const current = vendorMap.get(inv.vendor_name!) || 0;
      vendorMap.set(inv.vendor_name!, current + (inv.total_amount || 0));
    });

    // Sort and take top N
    return Array.from(vendorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, amount]) => ({ name, amount }));
  },

  async getProcessingQueue() {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, vendor_name, file_name, status, created_at')
      .in('status', ['pending', 'processed'])
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data as Invoice[];
  },
};
