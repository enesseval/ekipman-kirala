'use client';

import {
  X,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Users,
  Coffee,
  Wind,
  Heart,
  Building2,
  Globe,
  Package,
  Zap,
  Clock,
  FileText,
  Activity,
  ChevronRight,
  User,
} from 'lucide-react';
import type { Location, Event, Equipment } from '@/lib/types';
import HealthDot from '@/components/inventory/HealthDot';
import StatusBadge from '@/components/inventory/StatusBadge';
import { formatDate, formatDateRange, formatNumber, formatCurrency } from '@/lib/utils/format';
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';

interface LocationSheetProps {
  location: Location | null;
  event: Event | null;
  machines: Equipment[];
  onClose: () => void;
}

const VENUE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  cafe: Coffee,
  festival: Globe,
  wedding: Heart,
  corporate: Building2,
  other: Package,
};

const VENUE_ACCENT: Record<string, { text: string; bg: string; border: string; ring: string }> = {
  cafe: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', ring: 'ring-amber-500/20' },
  festival: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', ring: 'ring-purple-500/20' },
  wedding: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', ring: 'ring-pink-500/20' },
  corporate: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', ring: 'ring-blue-500/20' },
  other: { text: 'text-stone-400', bg: 'bg-stone-800', border: 'border-stone-700', ring: 'ring-stone-700/20' },
};

const EVENT_STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  completed: 'bg-stone-800 text-stone-400 border-stone-700',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function LocationSheet({ location, event, machines, onClose }: LocationSheetProps) {
  if (!location) return null;

  const accent = VENUE_ACCENT[location.venueType] ?? VENUE_ACCENT.other;
  const VenueIcon = VENUE_ICONS[location.venueType] ?? Package;

  const espressoMachines = machines.filter((m) => m.type === 'espresso_machine');
  const grinders = machines.filter((m) => m.type === 'grinder');

  // Sort machines: red first, then yellow, then green
  const healthOrder = { red: 0, yellow: 1, green: 2 };
  const sortedMachines = [...machines].sort(
    (a, b) => healthOrder[a.healthStatus] - healthOrder[b.healthStatus]
  );

  const isWarehouse = location.venueType === 'other';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-stone-900 border-l border-stone-700 z-40 flex flex-col shadow-2xl animate-slide-in-right overflow-y-auto">

        {/* Header */}
        <div className={cn('flex items-start justify-between p-5 border-b border-stone-800 flex-shrink-0', `ring-1 ${accent.ring}`)}>
          <div className="flex items-start gap-3">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border', accent.bg, accent.border)}>
              <VenueIcon size={20} className={accent.text} />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-stone-100 leading-tight">
                {location.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={11} className="text-stone-500 flex-shrink-0" />
                <p className="text-xs text-stone-500">{location.city}</p>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border', accent.bg, accent.text, accent.border)}>
                  {EVENT_TYPE_LABELS[location.venueType]}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-stone-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-stone-300">{location.address}, {location.city}</p>
          </div>

          {/* Active Event Card */}
          {event && !isWarehouse && (
            <div className={cn('rounded-xl border p-4 space-y-4', accent.bg, accent.border)}>
              {/* Event header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {event.status === 'active' && (
                      <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Zap size={8} />
                        Aktif
                      </span>
                    )}
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', EVENT_STATUS_STYLE[event.status] ?? EVENT_STATUS_STYLE.completed)}>
                      {EVENT_STATUS_LABELS[event.status]}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-stone-100">
                    {event.name}
                  </h3>
                </div>
                {event.quoteId && (
                  <div className="flex items-center gap-1 text-[10px] text-stone-500 bg-stone-800 px-2 py-1 rounded-lg border border-stone-700 flex-shrink-0">
                    <FileText size={10} />
                    {event.quoteId}
                  </div>
                )}
              </div>

              {/* Client info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-900/60 border border-stone-700/60">
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-stone-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-200">{event.clientName}</p>
                  <p className="text-xs text-stone-500 truncate">{event.clientEmail}</p>
                </div>
                <a
                  href={`tel:${event.clientPhone}`}
                  className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <Phone size={12} />
                </a>
              </div>

              {/* Event stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-stone-900/60 border border-stone-700/60">
                  <p className="text-xs text-stone-500 mb-1">Katılımcı</p>
                  <p className="font-mono font-semibold text-sm text-stone-100">
                    {formatNumber(event.expectedAttendees)}
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-stone-900/60 border border-stone-700/60">
                  <p className="text-xs text-stone-500 mb-1">Fincan/Gün</p>
                  <p className="font-mono font-semibold text-sm text-stone-100">
                    {formatNumber(event.expectedCupsPerDay)}
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-stone-900/60 border border-stone-700/60">
                  <p className="text-xs text-stone-500 mb-1">Barista</p>
                  <p className="font-mono font-semibold text-sm text-stone-100">
                    {event.baristaCount}
                  </p>
                </div>
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Calendar size={12} className="text-stone-500 flex-shrink-0" />
                {event.endDate
                  ? formatDateRange(event.startDate, event.endDate)
                  : `${formatDate(event.startDate)} — Süregelen`}
              </div>

              {/* Event notes */}
              {event.notes && (
                <p className="text-xs text-stone-400 leading-relaxed border-t border-stone-700/40 pt-3">
                  {event.notes}
                </p>
              )}
            </div>
          )}

          {/* Warehouse / no event */}
          {isWarehouse && (
            <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-700/60">
              <p className="text-xs text-stone-400 leading-relaxed">{location.notes}</p>
            </div>
          )}

          {/* Machine breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-stone-300">
                Konumdaki Ekipmanlar
              </h3>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                {espressoMachines.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Coffee size={11} />
                    {espressoMachines.length}
                  </span>
                )}
                {grinders.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Wind size={11} />
                    {grinders.length}
                  </span>
                )}
              </div>
            </div>

            {sortedMachines.length === 0 ? (
              <p className="text-xs text-stone-600 italic py-4 text-center">
                Bu konumda ekipman yok.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedMachines.map((machine) => (
                  <div
                    key={machine.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      machine.healthStatus === 'red'
                        ? 'bg-red-500/5 border-red-500/20'
                        : machine.healthStatus === 'yellow'
                        ? 'bg-amber-500/5 border-amber-500/15'
                        : 'bg-stone-800/40 border-stone-700/60'
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
                      {machine.type === 'espresso_machine'
                        ? <Coffee size={13} className="text-amber-400" />
                        : <Wind size={13} className="text-stone-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-200 truncate">{machine.name}</p>
                      <p className="text-[10px] font-mono text-stone-500">{machine.serialNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={machine.status} size="xs" />
                      <HealthDot status={machine.healthStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Venue contact */}
          <div>
            <h3 className="text-sm font-medium text-stone-300 mb-3">Mekan İletişim</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/40 border border-stone-700/60">
                <User size={14} className="text-stone-500 flex-shrink-0" />
                <span className="text-sm text-stone-300">{location.contactName}</span>
              </div>
              {location.contactPhone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/40 border border-stone-700/60">
                  <Phone size={14} className="text-stone-500 flex-shrink-0" />
                  <span className="text-sm text-stone-300">{location.contactPhone}</span>
                </div>
              )}
              {location.contactEmail && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/40 border border-stone-700/60">
                  <Mail size={14} className="text-stone-500 flex-shrink-0" />
                  <span className="text-sm text-stone-300 truncate">{location.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location notes */}
          {location.notes && !isWarehouse && (
            <div>
              <h3 className="text-sm font-medium text-stone-300 mb-2">Notlar</h3>
              <p className="text-sm text-stone-400 leading-relaxed bg-stone-800/40 rounded-lg p-3 border border-stone-700/40">
                {location.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
