export interface Vendor {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface ExtractedData {
  vendor: Vendor;
  bill_to?: {
    name: string;
    address?: string;
  };
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  payment_terms?: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount?: number;
  total: number;
  currency: string;
  notes?: string;
  payment_info?: {
    bank?: string;
    account?: string;
    routing?: string;
  };
}

export type InvoiceStatus = 'pending' | 'processed' | 'approved' | 'paid' | 'rejected';

export interface Invoice {
  id: string;
  invoice_number: string | null;
  vendor_name: string | null;
  invoice_date: string | null;
  due_date?: string | null;
  total_amount: number | null;
  currency: string;
  status: InvoiceStatus;
  file_url: string | null;
  file_name: string | null;
  extracted_data: ExtractedData | null;
  confidence: number | null;
  matched_po: string | null;
  flags: string[];
  created_at: string;
  updated_at: string;
  uploaded_at: string;
}

export interface InvoiceListItem {
  id: string;
  invoice_number: string | null;
  vendor_name: string | null;
  invoice_date: string | null;
  due_date: string | null;
  total_amount: number | null;
  currency: string;
  status: InvoiceStatus;
  confidence: number | null;
  created_at: string;
}

export interface InvoiceLineItemDB {
  id: string;
  invoice_id: string;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  total: number | null;
  created_at: string;
}
