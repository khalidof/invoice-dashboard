export const INVOICE_STATUSES = ['pending', 'processed', 'approved', 'paid', 'rejected'] as const;

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'warning',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-600',
    borderClass: 'border-orange-200',
  },
  processed: {
    label: 'Processed',
    color: 'blue',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-200',
  },
  approved: {
    label: 'Approved',
    color: 'success',
    bgClass: 'bg-green-50',
    textClass: 'text-green-600',
    borderClass: 'border-green-200',
  },
  paid: {
    label: 'Paid',
    color: 'gray',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-200',
  },
  rejected: {
    label: 'Rejected',
    color: 'error',
    bgClass: 'bg-red-50',
    textClass: 'text-red-600',
    borderClass: 'border-red-200',
  },
} as const;

export const CONFIDENCE_THRESHOLDS = {
  high: 90,
  medium: 70,
} as const;

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ITEMS_PER_PAGE = 25;

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Invoices', path: '/invoices', icon: 'FileText' },
  { label: 'Upload', path: '/upload', icon: 'Upload' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const;
