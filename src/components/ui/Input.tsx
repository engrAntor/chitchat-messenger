import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full h-11 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-subtle)]',
              'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'transition-all duration-200',
              'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-[var(--surface-base)]',
              'hover:border-[var(--border-default)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-500 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.5.5 0 01.5.5v3a.5.5 0 01-1 0V5a.5.5 0 01.5-.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
