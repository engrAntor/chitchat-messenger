import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg
      className={cn('animate-spin text-indigo-500', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <Spinner size="lg" />
    </div>
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('h-3 rounded-full skeleton', className)} />;
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <div className="w-10 h-10 rounded-full skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="w-32" />
        <SkeletonLine className="w-48" />
      </div>
    </div>
  );
}
