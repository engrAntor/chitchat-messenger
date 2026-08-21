import { cn, getInitials, getAvatarColor } from '@/lib/utils';

interface AvatarProps {
  name: string;
  id: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnline?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export default function Avatar({ name, id, size = 'md', showOnline, className }: AvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white select-none',
          sizeMap[size],
          getAvatarColor(id)
        )}
      >
        {getInitials(name)}
      </div>
      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--surface-card)]" />
      )}
    </div>
  );
}
