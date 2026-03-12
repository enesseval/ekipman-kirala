import Link from 'next/link';
import { CalendarDays, MapPin, Users, ArrowRight, Zap } from 'lucide-react';
import type { Event } from '@/lib/types';
import { formatDateRange, formatDateShort } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { EVENT_TYPE_LABELS } from '@/lib/constants';

interface UpcomingEventsProps {
  events: Event[];
}

const STATUS_STYLES: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  upcoming: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

const TYPE_COLORS: Record<string, string> = {
  festival: 'bg-purple-500/15 text-purple-300',
  wedding: 'bg-pink-500/15 text-pink-300',
  corporate: 'bg-blue-500/15 text-blue-300',
  cafe: 'bg-amber-500/15 text-amber-300',
  other: 'bg-stone-800 text-stone-400',
};

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="flex flex-col gap-1">
      {events.length === 0 ? (
        <p className="text-sm text-stone-500 py-4 text-center">Yaklaşan etkinlik yok.</p>
      ) : (
        events.map((event, i) => (
          <Link
            key={event.id}
            href={`/events`}
            className={cn(
              'group flex items-center gap-4 p-3 rounded-xl border border-transparent',
              'hover:bg-stone-800/50 hover:border-stone-700/50 transition-all duration-150',
              'animate-slide-up'
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Date block */}
            <div className="w-10 text-center flex-shrink-0">
              <p className="text-xs text-stone-500 font-medium uppercase leading-none">
                {formatDateShort(event.startDate).split(' ')[1]}
              </p>
              <p className="text-xl font-display font-bold text-stone-100 leading-tight">
                {formatDateShort(event.startDate).split(' ')[0]}
              </p>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-stone-700/60 flex-shrink-0" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-stone-100 truncate">
                  {event.name}
                </p>
                {event.status === 'active' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                    <Zap size={9} />
                    Aktif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {event.venueName.split('—')[0].trim()}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {event.expectedAttendees.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Type badge */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span
                className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full',
                  TYPE_COLORS[event.type] ?? TYPE_COLORS.other
                )}
              >
                {EVENT_TYPE_LABELS[event.type]}
              </span>
              <span className="text-xs text-stone-600 font-mono">
                {event.equipmentIds.length} ekip.
              </span>
            </div>

            <ArrowRight
              size={13}
              className="text-stone-700 group-hover:text-stone-400 transition-colors flex-shrink-0"
            />
          </Link>
        ))
      )}
    </div>
  );
}
