import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12 px-6 text-center', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
