import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: [
    'bg-orange-500',
    'text-white font-medium',
    'hover:bg-orange-600',
    'shadow-sm',
    'focus-visible:ring-orange-500',
  ].join(' '),
  secondary: [
    'bg-white',
    'text-slate-700 font-medium',
    'hover:bg-slate-50',
    'border border-slate-200',
    'hover:border-slate-300',
    'focus-visible:ring-slate-400',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-slate-600 font-medium',
    'hover:bg-slate-100 hover:text-slate-900',
    'focus-visible:ring-slate-400',
  ].join(' '),
  danger: [
    'bg-red-500',
    'text-white font-medium',
    'hover:bg-red-600',
    'shadow-sm',
    'focus-visible:ring-red-500',
  ].join(' '),
  success: [
    'bg-green-500',
    'text-white font-medium',
    'hover:bg-green-600',
    'shadow-sm',
    'focus-visible:ring-green-500',
  ].join(' '),
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          icon && iconPosition === 'left' && (
            <span>{icon}</span>
          )
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span>{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
