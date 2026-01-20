import type { ReactNode } from 'react';
import { FileX, Search, Upload } from 'lucide-react';
import { cn } from '@/utils';

interface EmptyStateProps {
  icon?: 'file' | 'search' | 'upload';
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const icons = {
  file: FileX,
  search: Search,
  upload: Upload,
};

export function EmptyState({
  icon = 'file',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-800/50 border border-navy-700/50 mb-6">
        <Icon className="w-8 h-8 text-navy-500" />
      </div>
      <h3 className="text-lg font-semibold text-navy-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-navy-400 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
