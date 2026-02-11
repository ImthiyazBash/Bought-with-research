'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: 'high' | 'medium' | 'low' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  high: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-red-100 text-red-800 border-red-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
