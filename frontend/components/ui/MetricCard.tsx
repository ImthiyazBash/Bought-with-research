'use client';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  subtext,
  trend,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p
            className={cn(
              'mt-1 text-2xl font-semibold',
              trend === 'positive' && 'text-emerald-600',
              trend === 'negative' && 'text-red-600',
              !trend && 'text-gray-900'
            )}
          >
            {value}
          </p>
          {subtext && <p className="mt-1 text-xs text-gray-400">{subtext}</p>}
        </div>
        {icon && (
          <div className="p-2 bg-gray-50 rounded-lg text-gray-400">{icon}</div>
        )}
      </div>
    </div>
  );
}
