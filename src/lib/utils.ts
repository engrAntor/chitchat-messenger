import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a timestamp for display in message bubbles.
 * Shows "just now" / "X min ago" for recent, or "HH:mm" for today, etc.
 */
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  return format(date, 'MMM d, h:mm a');
}

/**
 * Format a timestamp for the conversation list (last message time).
 */
export function formatConversationTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

/**
 * Returns a label for date separators between messages.
 */
export function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

/**
 * Check if two dates are on different calendar days.
 */
export function isDifferentDay(a: string, b: string): boolean {
  return format(new Date(a), 'yyyy-MM-dd') !== format(new Date(b), 'yyyy-MM-dd');
}

/**
 * Returns initials from a name (up to 2 chars).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Returns a deterministic hue for avatar backgrounds.
 */
export function getAvatarColor(id: string): string {
  const colors = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-fuchsia-500',
    'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Relative time string ("just now", "2 min ago", etc.)
 */
export function relativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

/**
 * Generate a temporary ID for optimistic messages.
 */
export function tempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
