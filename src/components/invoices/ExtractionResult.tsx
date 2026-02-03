import {
  Building2,
  Calendar,
  FileText,
  CreditCard,
  Mail,
  Phone,
  User,
  Hash,
  DollarSign,
  Clock,
  Sparkles,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';
import { LineItemsTable } from './LineItemsTable';
import type { ExtractedData, LineItem, Invoice, InvoiceLineItemDB } from '@/types';

interface ExtractionResultProps {
  data: ExtractedData | null;
  confidence: number | null;
  invoice?: Invoice & { line_items?: InvoiceLineItemDB[] };
}

// Type for flat n8n extraction format
interface FlatExtractedData {
  invoice_number?: string;
  vendor_name?: string;
  invoice_date?: string;
  due_date?: string;
  total_amount?: number;
  currency?: string;
  subtotal?: number;
  tax_amount?: number;
  tax_rate?: number;
  discount?: number;
  line_items?: LineItem[];
  payment_terms?: string;
  notes?: string;
  confidence?: number;
  // Additional fields that might come from n8n
  bill_to_name?: string;
  bill_to_address?: string;
  vendor_address?: string;
  vendor_email?: string;
  vendor_phone?: string;
  po_number?: string;
  [key: string]: unknown;
}

// Check if data is in the nested ExtractedData format
function isNestedFormat(data: unknown): data is ExtractedData {
  return (
    data !== null &&
    typeof data === 'object' &&
    'vendor' in data &&
    typeof (data as ExtractedData).vendor === 'object' &&
    (data as ExtractedData).vendor !== null
  );
}

// Normalize flat n8n data to our display format
function normalizeData(data: FlatExtractedData): ExtractedData {
  return {
    vendor: {
      name: data.vendor_name || 'Unknown Vendor',
      address: data.vendor_address,
      email: data.vendor_email,
      phone: data.vendor_phone,
    },
    bill_to: data.bill_to_name
      ? {
          name: data.bill_to_name,
          address: data.bill_to_address,
        }
      : undefined,
    invoice_number: data.invoice_number || 'N/A',
    invoice_date: data.invoice_date || '',
    due_date: data.due_date,
    payment_terms: data.payment_terms,
    line_items: data.line_items || [],
    subtotal: data.subtotal || data.total_amount || 0,
    tax_rate: data.tax_rate,
    tax_amount: data.tax_amount,
    discount: data.discount,
    total: data.total_amount || 0,
    currency: data.currency || 'USD',
    notes: data.notes,
  };
}

// Create extraction data from invoice fields (fallback when extracted_data is null)
function createFromInvoice(invoice: Invoice & { line_items?: InvoiceLineItemDB[] }): ExtractedData {
  // Convert DB line items to LineItem format
  const lineItems: LineItem[] = (invoice.line_items || []).map(item => ({
    id: item.id,
    description: item.description || '',
    quantity: item.quantity || 0,
    unit_price: item.unit_price || 0,
    amount: item.total || 0,
  }));

  return {
    vendor: {
      name: invoice.vendor_name || 'Unknown Vendor',
    },
    invoice_number: invoice.invoice_number || 'N/A',
    invoice_date: invoice.invoice_date || '',
    due_date: invoice.due_date || undefined,
    line_items: lineItems,
    subtotal: invoice.total_amount || 0,
    total: invoice.total_amount || 0,
    currency: invoice.currency || 'USD',
  };
}

// Get display-ready data from either format
function getDisplayData(
  data: unknown,
  invoice?: Invoice & { line_items?: InvoiceLineItemDB[] }
): { normalized: ExtractedData; isFlat: boolean } {
  // If we have nested format data, use it
  if (isNestedFormat(data)) {
    return { normalized: data, isFlat: false };
  }

  // If we have flat format data (from n8n), normalize it
  if (data && typeof data === 'object' && Object.keys(data).length > 0) {
    return { normalized: normalizeData(data as FlatExtractedData), isFlat: true };
  }

  // Fall back to invoice fields if extracted_data is null/empty
  if (invoice) {
    return { normalized: createFromInvoice(invoice), isFlat: true };
  }

  // Last resort: empty data
  return {
    normalized: normalizeData({} as FlatExtractedData),
    isFlat: true
  };
}

export function ExtractionResult({ data, confidence, invoice }: ExtractionResultProps) {
  // Check if we have any data to display (either from extracted_data or invoice)
  const hasData = data || invoice;

  if (!hasData) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No extraction data available</p>
        <p className="text-xs mt-1">Upload an invoice to see AI-extracted data</p>
      </div>
    );
  }

  const { normalized, isFlat } = getDisplayData(data, invoice);
  const normalizedConfidence = confidence != null
    ? (confidence > 1 ? confidence : confidence * 100)
    : null;

  return (
    <div className="space-y-5">
      {/* Header with confidence */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-4 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Extracted Data</h3>
              <p className="text-xs text-white/80">AI-powered MCP extraction</p>
            </div>
          </div>
          {normalizedConfidence != null && (
            <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-2xl font-bold">{Math.round(normalizedConfidence)}%</span>
              <span className="text-[10px] uppercase tracking-wider text-white/80">Confidence</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics - Quick Overview */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Hash}
          label="Invoice Number"
          value={normalized.invoice_number}
          color="blue"
        />
        <MetricCard
          icon={DollarSign}
          label="Total Amount"
          value={formatCurrency(normalized.total, normalized.currency)}
          color="green"
          highlight
        />
        <MetricCard
          icon={Calendar}
          label="Invoice Date"
          value={normalized.invoice_date ? formatDate(normalized.invoice_date) : 'N/A'}
          color="slate"
        />
        <MetricCard
          icon={Clock}
          label="Due Date"
          value={normalized.due_date ? formatDate(normalized.due_date) : 'N/A'}
          color="orange"
        />
      </div>

      {/* Vendor Information */}
      <Section title="Vendor" icon={Building2}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{normalized.vendor?.name || 'Unknown Vendor'}</p>
              {normalized.vendor?.address && (
                <p className="text-xs text-slate-500">{normalized.vendor.address}</p>
              )}
            </div>
          </div>
          {(normalized.vendor?.email || normalized.vendor?.phone) && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
              {normalized.vendor?.email && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{normalized.vendor.email}</span>
                </div>
              )}
              {normalized.vendor?.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{normalized.vendor.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Bill To */}
      {normalized.bill_to && (
        <Section title="Bill To" icon={User}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{normalized.bill_to.name}</p>
              {normalized.bill_to.address && (
                <p className="text-xs text-slate-500">{normalized.bill_to.address}</p>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Line Items */}
      {normalized.line_items && normalized.line_items.length > 0 && (
        <Section title="Line Items" icon={Receipt}>
          <LineItemsTable items={normalized.line_items} currency={normalized.currency} />
        </Section>
      )}

      {/* Totals Summary */}
      <Section title="Summary" icon={CreditCard}>
        <div className="space-y-2">
          {normalized.subtotal > 0 && normalized.subtotal !== normalized.total && (
            <TotalRow label="Subtotal" amount={normalized.subtotal} currency={normalized.currency} />
          )}
          {normalized.discount && normalized.discount > 0 && (
            <TotalRow
              label="Discount"
              amount={-normalized.discount}
              currency={normalized.currency}
              highlight="success"
            />
          )}
          {normalized.tax_amount && normalized.tax_amount > 0 && (
            <TotalRow
              label={`Tax${normalized.tax_rate ? ` (${normalized.tax_rate}%)` : ''}`}
              amount={normalized.tax_amount}
              currency={normalized.currency}
            />
          )}
          <div className="pt-3 mt-3 border-t-2 border-slate-200">
            <TotalRow
              label="Total Due"
              amount={normalized.total}
              currency={normalized.currency}
              highlight="primary"
              large
            />
          </div>
        </div>
      </Section>

      {/* Payment Terms */}
      {normalized.payment_terms && (
        <Section title="Payment Terms" icon={FileText}>
          <p className="text-sm text-slate-600">{normalized.payment_terms}</p>
        </Section>
      )}

      {/* Payment Info */}
      {normalized.payment_info && (
        <Section title="Payment Information" icon={CreditCard}>
          <div className="grid gap-3">
            {normalized.payment_info.bank && (
              <InfoRow label="Bank" value={normalized.payment_info.bank} />
            )}
            {normalized.payment_info.account && (
              <InfoRow
                label="Account"
                value={`****${normalized.payment_info.account.slice(-4)}`}
                mono
              />
            )}
            {normalized.payment_info.routing && (
              <InfoRow
                label="Routing"
                value={normalized.payment_info.routing}
                mono
              />
            )}
          </div>
        </Section>
      )}

      {/* Notes */}
      {normalized.notes && (
        <Section title="Notes" icon={FileText}>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{normalized.notes}</p>
        </Section>
      )}

      {/* Data source indicator */}
      {isFlat && (
        <div className="text-center pt-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Data extracted via MCP workflow
          </span>
        </div>
      )}
    </div>
  );
}

// Metric Card Component for key values
function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'orange' | 'slate';
  highlight?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    orange: 'text-orange-500',
    slate: 'text-slate-500',
  };

  return (
    <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${iconColorClasses[color]}`} />
        <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className={`font-semibold truncate ${highlight ? 'text-lg' : 'text-sm'}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  icon?: typeof Building2;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className={`text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>
          {value || '-'}
        </p>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  amount,
  currency,
  highlight,
  large,
}: {
  label: string;
  amount: number;
  currency: string;
  highlight?: 'primary' | 'success';
  large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-slate-500 ${large ? 'text-sm font-medium' : 'text-sm'}`}
      >
        {label}
      </span>
      <span
        className={`font-mono ${
          large ? 'text-lg font-semibold' : 'text-sm'
        } ${
          highlight === 'primary'
            ? 'text-orange-500'
            : highlight === 'success'
            ? 'text-green-500'
            : 'text-slate-800'
        }`}
      >
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}
