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
    'relative overflow-hidden',
    'bg-gradient-to-r from-ember-500 to-ember-600',
    'text-white font-semibold',
    'hover:from-ember-400 hover:to-ember-500',
    'shadow-lg shadow-ember-500/25',
    'hover:shadow-xl hover:shadow-ember-500/30',
    'focus-visible:ring-ember-500',
    'before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/10 before:to-transparent',
  ].join(' '),
  secondary: [
    'bg-obsidian-800/60',
    'text-obsidian-100 font-medium',
    'hover:bg-obsidian-700/60 hover:text-white',
    'border border-obsidian-700/50',
    'hover:border-obsidian-600/50',
    'focus-visible:ring-obsidian-500',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-obsidian-400 font-medium',
    'hover:bg-obsidian-800/50 hover:text-obsidian-100',
    'focus-visible:ring-obsidian-500',
  ].join(' '),
  danger: [
    'bg-gradient-to-r from-rose-600 to-rose-700',
    'text-white font-semibold',
    'hover:from-rose-500 hover:to-rose-600',
    'shadow-lg shadow-rose-500/25',
    'focus-visible:ring-rose-500',
  ].join(' '),
  success: [
    'bg-gradient-to-r from-mint-600 to-mint-700',
    'text-white font-semibold',
    'hover:from-mint-500 hover:to-mint-600',
    'shadow-lg shadow-mint-500/25',
    'focus-visible:ring-mint-500',
  ].join(' '),
};

const sizeClasses = {
  sm: 'px-3.5 py-2 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
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
          'transition-all duration-300 ease-out',
          'transform active:scale-[0.98]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-950',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none',
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
            <span className="transition-transform group-hover:-translate-x-0.5">{icon}</span>
          )
        )}
        <span className="relative">{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
