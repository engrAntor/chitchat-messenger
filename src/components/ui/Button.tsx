import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 focus-visible:outline-indigo-500',
      ghost:
        'bg-transparent hover:bg-white/8 active:bg-white/12 text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
      danger:
        'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 border border-rose-500/20',
      outline:
        'border border-[var(--border-default)] hover:border-[var(--border-strong)] bg-transparent hover:bg-white/4 text-[var(--text-primary)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
      icon: 'w-9 h-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
