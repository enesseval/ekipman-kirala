import {
  Package,
  PackageCheck,
  Wrench,
  FileText,
  CalendarPlus,
  CheckCircle2,
} from 'lucide-react';
import type { ActivityItem } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface RecentActivityProps {
  items: ActivityItem[];
}

const ACTIVITY_CONFIG: Record<
  ActivityItem['type'],
  { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }
> = {
  equipment_rented: { icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  equipment_returned: { icon: PackageCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  maintenance_done: { icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  quote_sent: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  event_created: { icon: CalendarPlus, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  event_completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-4 bottom-4 w-px bg-stone-800" />

      <div className="space-y-1">
        {items.map((item, i) => {
          const config = ACTIVITY_CONFIG[item.type];
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-4 py-2.5 animate-slide-up'
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 border border-stone-800',
                  config.bg
                )}
              >
                <Icon size={15} className={config.color} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1.5">
                <p className="text-sm text-stone-300 leading-snug">{item.description}</p>
                <p className="text-xs text-stone-600 mt-0.5">{formatTimeAgo(item.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
