import type { ReactNode } from 'react';
import { Header } from './Header';
import { cn } from '@/utils';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  headerExtra?: ReactNode;
}

export function PageContainer({
  title,
  subtitle,
  children,
  className,
  fullWidth = false,
  headerExtra,
}: PageContainerProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title={title} subtitle={subtitle} extra={headerExtra} />
      <div
        className={cn(
          'flex-1 p-6',
          !fullWidth && 'max-w-[1600px]',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
