export interface ProcessInvoiceRequest {
  file_base64: string;
  mime_type: string;
  filename: string;
  source: string;
}

export interface ProcessInvoiceResponse {
  success: boolean;
  message: string;
  data?: {
    invoice_id: string;
    invoice_number: string | null;
    vendor_name: string | null;
    total_amount: number | null;
    currency: string;
    line_items_count: number;
    confidence: number;
    anomalies: string[];
    processed_at: string;
  };
  error?: string;
  existing_invoice_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  thisMonthCount: number;
  lastMonthCount: number;
  totalAmount: number;
  pendingCount: number;
  avgProcessingTime?: number;
}

export interface VendorSpend {
  name: string;
  amount: number;
}
