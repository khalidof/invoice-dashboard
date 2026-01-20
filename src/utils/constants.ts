export const INVOICE_STATUSES = ['pending', 'processed', 'approved', 'paid', 'rejected'] as const;

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'warning',
    bgClass: 'bg-warning-500/20',
    textClass: 'text-warning-400',
    borderClass: 'border-warning-500/30',
  },
  processed: {
    label: 'Processed',
    color: 'blue',
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
  },
  approved: {
    label: 'Approved',
    color: 'success',
    bgClass: 'bg-success-500/20',
    textClass: 'text-success-400',
    borderClass: 'border-success-500/30',
  },
  paid: {
    label: 'Paid',
    color: 'gray',
    bgClass: 'bg-navy-600/40',
    textClass: 'text-navy-300',
    borderClass: 'border-navy-500/30',
  },
  rejected: {
    label: 'Rejected',
    color: 'error',
    bgClass: 'bg-error-500/20',
    textClass: 'text-error-400',
    borderClass: 'border-error-500/30',
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
