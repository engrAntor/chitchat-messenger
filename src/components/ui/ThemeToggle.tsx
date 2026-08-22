'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className={cn(
        sizeClasses,
        'flex items-center justify-center rounded-xl transition-all duration-200',
        'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        'hover:bg-[var(--surface-hover)]',
        'active:scale-90',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={iconSize} className="transition-transform duration-200" />
      ) : (
        <Sun size={iconSize} className="transition-transform duration-200" />
      )}
    </button>
  );
}
