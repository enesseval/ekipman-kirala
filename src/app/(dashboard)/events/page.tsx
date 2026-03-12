'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Coffee,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { getEvents } from '@/lib/data/events';
import {
  formatDateRange,
  formatDuration,
  formatNumber,
} from '@/lib/utils/format';
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import type { EventStatus } from '@/lib/types';

type Tab = EventStatus | 'all';

const STATUS_BADGES: Record<
  EventStatus,
  { className: string; icon: React.ReactNode }
> = {
  active: {
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: <Zap size={10} />,
  },
  upcoming: {
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: <Clock size={10} />,
  },
  completed: {
    className: 'text-stone-400 bg-stone-800 border-stone-700',
    icon: <CheckCircle2 size={10} />,
  },
  cancelled: {
    className: 'text-red-400 bg-red-500/10 border-red-500/30',
    icon: <XCircle size={10} />,
  },
};

const TYPE_COLORS: Record<string, string> = {
  festival: 'text-purple-300',
  wedding: 'text-pink-300',
  corporate: 'text-blue-300',
  cafe: 'text-amber-300',
  other: 'text-stone-400',
};

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const events = getEvents();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: `Tümü (${events.length})` },
    { key: 'active', label: `Aktif (${events.filter((e) => e.status === 'active').length})` },
    { key: 'upcoming', label: `Yaklaşan (${events.filter((e) => e.status === 'upcoming').length})` },
    { key: 'completed', label: `Tamamlandı (${events.filter((e) => e.status === 'completed').length})` },
    { key: 'cancelled', label: `İptal (${events.filter((e) => e.status === 'cancelled').length})` },
  ];

  const filtered =
    activeTab === 'all' ? events : events.filter((e) => e.status === activeTab);

  const sorted = [...filtered].sort((a, b) => {
    const order = { active: 0, upcoming: 1, completed: 2, cancelled: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Etkinlikler"
        subtitle={`${events.filter((e) => e.status === 'active' || e.status === 'upcoming').length} aktif & yaklaşan`}
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Tabs + CTA */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-xs font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-stone-800 text-stone-100 border border-stone-700'
                    : 'text-stone-500 hover:text-stone-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link href="/events/new" className="btn-primary">
            <Plus size={14} />
            Yeni Etkinlik Planla
          </Link>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((event, i) => {
            const badge = STATUS_BADGES[event.status];

            return (
              <div
                key={event.id}
                className={cn(
                  'card p-5 flex flex-col gap-4 hover:border-stone-700 transition-all duration-200 animate-slide-up',
                  event.status === 'active' && 'ring-1 ring-emerald-500/20'
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-stone-100 leading-tight">
                      {event.name}
                    </h3>
                    <p className={cn('text-xs mt-0.5 font-medium', TYPE_COLORS[event.type])}>
                      {EVENT_TYPE_LABELS[event.type]}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0',
                      badge.className
                    )}
                  >
                    {badge.icon}
                    {EVENT_STATUS_LABELS[event.status]}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Calendar size={12} className="text-stone-500 flex-shrink-0" />
                    <span>{formatDateRange(event.startDate, event.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <MapPin size={12} className="text-stone-500 flex-shrink-0" />
                    <span className="truncate">{event.venueName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Users size={12} className="text-stone-500 flex-shrink-0" />
                    <span>
                      {formatNumber(event.expectedAttendees)} katılımcı ·{' '}
                      {event.baristaCount} barista
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-stone-800/60 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Coffee size={11} />
                    <span>{event.equipmentIds.length} ekipman</span>
                    {event.equipmentIds.length === 0 && (
                      <span className="text-amber-400">(atanmadı)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {event.quoteId ? (
                      <span className="text-emerald-400">
                        Teklif var ✓
                      </span>
                    ) : (
                      <Link
                        href="/quotes/new"
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Teklif oluştur →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Client */}
                <div className="text-xs text-stone-600 -mt-1">
                  {event.clientName} · {event.clientEmail}
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="py-16 text-center">
            <Calendar size={32} className="text-stone-700 mx-auto mb-3" />
            <p className="text-stone-500">Bu kategoride etkinlik bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
