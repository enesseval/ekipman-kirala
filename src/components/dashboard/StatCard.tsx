import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColor?: string;
  iconBg?: string;
  href?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconColor = 'text-amber-400',
  iconBg = 'bg-amber-500/10',
  className,
}: StatCardProps) {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <div
      className={cn(
        'card p-5 flex flex-col gap-4 animate-slide-up',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center border',
            iconBg,
            iconColor.replace('text-', 'border-').replace('400', '500/30')
          )}
        >
          <Icon size={18} className={iconColor} />
        </div>

        {delta !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              isPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : isNegative
                ? 'text-red-400 bg-red-500/10'
                : 'text-stone-400 bg-stone-800'
            )}
          >
            {isPositive ? (
              <TrendingUp size={11} />
            ) : isNegative ? (
              <TrendingDown size={11} />
            ) : null}
            {isPositive ? '+' : ''}
            {delta}%
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-display font-bold text-stone-100 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
        </p>
        <p className="text-sm text-stone-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
