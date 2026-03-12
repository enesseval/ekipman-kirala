import type { EquipmentStatus } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface StatusBadgeProps {
  status: EquipmentStatus;
  size?: 'xs' | 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  EquipmentStatus,
  { label: string; className: string; dotColor: string }
> = {
  available: {
    label: 'Müsait',
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
  },
  rented: {
    label: 'Kirada',
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    dotColor: 'bg-amber-400',
  },
  maintenance: {
    label: 'Bakımda',
    className: 'text-red-400 bg-red-500/10 border-red-500/30',
    dotColor: 'bg-red-400',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        config.className
      )}
    >
      <span className={cn('rounded-full flex-shrink-0', config.dotColor, size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {config.label}
    </span>
  );
}
