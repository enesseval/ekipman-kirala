import type { HealthStatus } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { getHealthLabel } from '@/lib/utils/health';

interface HealthDotProps {
  status: HealthStatus;
  showLabel?: boolean;
}

const DOT_COLORS: Record<HealthStatus, string> = {
  green: 'bg-emerald-400',
  yellow: 'bg-amber-400',
  red: 'bg-red-400 animate-pulse-soft',
};

const LABEL_COLORS: Record<HealthStatus, string> = {
  green: 'text-emerald-400',
  yellow: 'text-amber-400',
  red: 'text-red-400',
};

export default function HealthDot({ status, showLabel = false }: HealthDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', DOT_COLORS[status])} />
      {showLabel && (
        <span className={cn('text-xs font-medium', LABEL_COLORS[status])}>
          {getHealthLabel(status)}
        </span>
      )}
    </span>
  );
}
