import {
  Building2,
  Calendar,
  FileText,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';
import { ConfidenceMeter } from '@/components/common';
import { LineItemsTable } from './LineItemsTable';
import type { ExtractedData } from '@/types';

interface ExtractionResultProps {
  data: ExtractedData | null;
  confidence: number | null;
}

export function ExtractionResult({ data, confidence }: ExtractionResultProps) {
  if (!data) {
    return (
      <div className="text-center py-12 text-navy-400">
        No extraction data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with confidence */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-navy-900/50 border border-navy-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-500/20">
            <FileText className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h3 className="font-medium text-navy-100">AI Extraction Result</h3>
            <p className="text-xs text-navy-400">Powered by Claude</p>
          </div>
        </div>
        <ConfidenceMeter value={confidence} size="md" variant="ring" showLabel />
      </div>

      {/* Vendor Information */}
      <Section title="Vendor Information" icon={Building2}>
        <div className="grid gap-4">
          <InfoRow label="Name" value={data.vendor.name} />
          {data.vendor.address && (
            <InfoRow
              label="Address"
              value={data.vendor.address}
              icon={MapPin}
            />
          )}
          {data.vendor.email && (
            <InfoRow label="Email" value={data.vendor.email} icon={Mail} />
          )}
          {data.vendor.phone && (
            <InfoRow label="Phone" value={data.vendor.phone} icon={Phone} />
          )}
        </div>
      </Section>

      {/* Bill To */}
      {data.bill_to && (
        <Section title="Bill To" icon={User}>
          <div className="grid gap-4">
            <InfoRow label="Name" value={data.bill_to.name} />
            {data.bill_to.address && (
              <InfoRow
                label="Address"
                value={data.bill_to.address}
                icon={MapPin}
              />
            )}
          </div>
        </Section>
      )}

      {/* Invoice Details */}
      <Section title="Invoice Details" icon={FileText}>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Invoice #" value={data.invoice_number} />
          <InfoRow
            label="Date"
            value={formatDate(data.invoice_date)}
            icon={Calendar}
          />
          {data.due_date && (
            <InfoRow
              label="Due Date"
              value={formatDate(data.due_date)}
              icon={Calendar}
            />
          )}
          {data.payment_terms && (
            <InfoRow label="Terms" value={data.payment_terms} />
          )}
        </div>
      </Section>

      {/* Line Items */}
      <Section title="Line Items" icon={FileText}>
        <LineItemsTable items={data.line_items} currency={data.currency} />
      </Section>

      {/* Totals */}
      <Section title="Totals" icon={CreditCard}>
        <div className="space-y-2">
          <TotalRow label="Subtotal" amount={data.subtotal} currency={data.currency} />
          {data.discount && data.discount > 0 && (
            <TotalRow
              label="Discount"
              amount={-data.discount}
              currency={data.currency}
              highlight="success"
            />
          )}
          {data.tax_amount && (
            <TotalRow
              label={`Tax${data.tax_rate ? ` (${data.tax_rate}%)` : ''}`}
              amount={data.tax_amount}
              currency={data.currency}
            />
          )}
          <div className="pt-2 mt-2 border-t border-navy-700">
            <TotalRow
              label="Total"
              amount={data.total}
              currency={data.currency}
              highlight="primary"
              large
            />
          </div>
        </div>
      </Section>

      {/* Payment Info */}
      {data.payment_info && (
        <Section title="Payment Information" icon={CreditCard}>
          <div className="grid gap-4">
            {data.payment_info.bank && (
              <InfoRow label="Bank" value={data.payment_info.bank} />
            )}
            {data.payment_info.account && (
              <InfoRow
                label="Account"
                value={`****${data.payment_info.account.slice(-4)}`}
                mono
              />
            )}
            {data.payment_info.routing && (
              <InfoRow
                label="Routing"
                value={data.payment_info.routing}
                mono
              />
            )}
          </div>
        </Section>
      )}

      {/* Notes */}
      {data.notes && (
        <Section title="Notes" icon={FileText}>
          <p className="text-sm text-navy-300 whitespace-pre-wrap">{data.notes}</p>
        </Section>
      )}
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
        <Icon className="w-4 h-4 text-navy-500" />
        <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className="p-4 rounded-xl bg-navy-900/30 border border-navy-800/50">
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
      {Icon && <Icon className="w-4 h-4 text-navy-500 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-navy-500 mb-0.5">{label}</p>
        <p className={`text-sm text-navy-200 ${mono ? 'font-mono' : ''}`}>
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
        className={`text-navy-400 ${large ? 'text-sm font-medium' : 'text-sm'}`}
      >
        {label}
      </span>
      <span
        className={`font-mono ${
          large ? 'text-lg font-semibold' : 'text-sm'
        } ${
          highlight === 'primary'
            ? 'text-gold-400'
            : highlight === 'success'
            ? 'text-success-400'
            : 'text-navy-200'
        }`}
      >
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}
