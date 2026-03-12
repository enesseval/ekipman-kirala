import {
  MapPin,
  Coffee,
  Heart,
  Building2,
  Globe,
  Calendar,
  Phone,
  Mail,
  Zap,
  Package,
} from 'lucide-react';
import type { Location, Equipment } from '@/lib/types';
import MachineChip from './MachineChip';
import { formatDateRange } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { EVENT_TYPE_LABELS } from '@/lib/constants';

interface LocationCardProps {
  location: Location;
  machines: Equipment[];
  onClick?: () => void;
}

const VENUE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  cafe: Coffee,
  festival: Globe,
  wedding: Heart,
  corporate: Building2,
  other: Package,
};

const VENUE_COLORS: Record<string, { border: string; icon: string; badge: string }> = {
  cafe: {
    border: 'border-l-amber-500/50',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  festival: {
    border: 'border-l-purple-500/50',
    icon: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  wedding: {
    border: 'border-l-pink-500/50',
    icon: 'text-pink-400',
    badge: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  },
  corporate: {
    border: 'border-l-blue-500/50',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  other: {
    border: 'border-l-stone-500/50',
    icon: 'text-stone-400',
    badge: 'bg-stone-800 text-stone-300 border-stone-700',
  },
};

export default function LocationCard({ location, machines, onClick }: LocationCardProps) {
  const isActive = location.activeEventId !== null;
  const colors = VENUE_COLORS[location.venueType] ?? VENUE_COLORS.other;
  const VenueIcon = VENUE_ICONS[location.venueType] ?? Package;
  const isWarehouse = location.venueType === 'other';

  const espressoCount = machines.filter((m) => m.type === 'espresso_machine').length;
  const grinderCount = machines.filter((m) => m.type === 'grinder').length;

  return (
    <div
      onClick={onClick}
      className={cn(
        'card flex flex-col gap-4 p-5 border-l-4 transition-all duration-200 animate-slide-up',
        colors.border,
        isActive && !isWarehouse ? 'ring-1 ring-amber-500/20' : '',
        onClick ? 'cursor-pointer hover:border-stone-600 hover:scale-[1.01]' : 'hover:border-stone-700'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
            'bg-stone-800/80 border-stone-700'
          )}
        >
          <VenueIcon size={18} className={colors.icon} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-sm text-stone-100 leading-tight truncate">
              {location.name}
            </h3>
            {isActive && !isWarehouse && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                <Zap size={8} />
                Aktif
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-stone-500 flex-shrink-0" />
            <p className="text-xs text-stone-500 truncate">{location.city}</p>
            <span
              className={cn(
                'ml-1 text-[10px] px-1.5 py-0.5 rounded-full border',
                colors.badge
              )}
            >
              {EVENT_TYPE_LABELS[location.venueType]}
            </span>
          </div>
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-stone-500 leading-relaxed -mt-1">
        {location.address}
      </p>

      {/* Date range */}
      {isActive && location.startDate && (
        <div className="flex items-center gap-2 text-xs bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2">
          <Calendar size={12} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 font-medium">
            {location.endDate
              ? formatDateRange(location.startDate, location.endDate)
              : `${location.startDate} — Süregelen`}
          </span>
        </div>
      )}

      {/* Machine chips */}
      {machines.length > 0 && (
        <div>
          <p className="text-[10px] text-stone-600 font-semibold uppercase tracking-wider mb-2">
            {machines.length} Ekipman — {espressoCount} Espresso, {grinderCount} Öğütücü
          </p>
          <div className="flex flex-wrap gap-1.5">
            {machines.slice(0, 12).map((m) => (
              <MachineChip key={m.id} equipment={m} />
            ))}
            {machines.length > 12 && (
              <span className="text-[10px] text-stone-500 px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700">
                +{machines.length - 12} daha
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="border-t border-stone-800/60 pt-3 flex items-center gap-4 text-xs text-stone-500">
        <span className="font-medium text-stone-400">{location.contactName}</span>
        <div className="flex items-center gap-3 ml-auto">
          {location.contactPhone && (
            <span className="flex items-center gap-1 hover:text-stone-300 transition-colors">
              <Phone size={10} />
            </span>
          )}
          {location.contactEmail && (
            <span className="flex items-center gap-1 hover:text-stone-300 transition-colors">
              <Mail size={10} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
