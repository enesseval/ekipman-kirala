'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  Coffee,
  Wind,
  Sparkles,
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { getQuotes } from '@/lib/data/quotes';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { QUOTE_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import type { QuoteStatus } from '@/lib/types';

const STATUS_CONFIG: Record<
  QuoteStatus,
  { icon: React.ComponentType<{ size?: number; className?: string }>; className: string }
> = {
  draft: { icon: FileText, className: 'text-stone-400 bg-stone-800 border-stone-700' },
  sent: { icon: Send, className: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  accepted: { icon: CheckCircle2, className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  rejected: { icon: XCircle, className: 'text-red-400 bg-red-500/10 border-red-500/30' },
  expired: { icon: AlertCircle, className: 'text-stone-500 bg-stone-800/60 border-stone-700' },
};

export default function QuotesPage() {
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');
  const quotes = getQuotes();

  const filtered = filter === 'all' ? quotes : quotes.filter((q) => q.status === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalAccepted = quotes
    .filter((q) => q.status === 'accepted')
    .reduce((s, q) => s + q.total, 0);

  const tabs: { key: QuoteStatus | 'all'; label: string }[] = [
    { key: 'all', label: `Tümü (${quotes.length})` },
    { key: 'draft', label: `Taslak (${quotes.filter((q) => q.status === 'draft').length})` },
    { key: 'sent', label: `Gönderildi (${quotes.filter((q) => q.status === 'sent').length})` },
    { key: 'accepted', label: `Onaylandı (${quotes.filter((q) => q.status === 'accepted').length})` },
    { key: 'rejected', label: `Reddedildi (${quotes.filter((q) => q.status === 'rejected').length})` },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Teklifler"
        subtitle={`${formatCurrency(totalAccepted)} onaylanan gelir`}
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Tabs + CTA */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl p-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filter === tab.key
                    ? 'bg-stone-800 text-stone-100 border border-stone-700'
                    : 'text-stone-500 hover:text-stone-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link href="/quotes/new" className="btn-primary">
            <Plus size={14} />
            Yeni Teklif
          </Link>
        </div>

        {/* Quotes list */}
        <div className="space-y-3">
          {sorted.map((quote, i) => {
            const config = STATUS_CONFIG[quote.status];
            const Icon = config.icon;
            const espressoItems = quote.lineItems.filter((li) => li.equipmentType === 'espresso_machine');
            const grinderItems = quote.lineItems.filter((li) => li.equipmentType === 'grinder');

            return (
              <div
                key={quote.id}
                className={cn(
                  'card p-5 flex items-start gap-5 hover:border-stone-700 transition-all duration-200 animate-slide-up',
                  quote.status === 'accepted' && 'ring-1 ring-emerald-500/15'
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Status icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                    config.className
                  )}
                >
                  <Icon size={16} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-stone-200">
                      {quote.quoteNumber}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                        config.className
                      )}
                    >
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </span>
                    {quote.generatedByAI && (
                      <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Sparkles size={8} />
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-stone-100 mt-1">
                    {quote.clientName}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">{quote.clientEmail}</p>

                  {/* Equipment summary */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                    {espressoItems.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Coffee size={10} />
                        {espressoItems.length} espresso
                      </span>
                    )}
                    {grinderItems.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Wind size={10} />
                        {grinderItems.length} öğütücü
                      </span>
                    )}
                    <span>·</span>
                    <span>{quote.lineItems.reduce((s, li) => Math.max(s, li.days), 0)} gün</span>
                  </div>
                </div>

                {/* Amount + date */}
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-base text-stone-100">
                    {formatCurrency(quote.total)}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {formatDate(quote.createdAt)}
                  </p>
                  {quote.validUntil && quote.status === 'sent' && (
                    <p className="text-[10px] text-amber-400 mt-1">
                      Geçerlilik: {formatDate(quote.validUntil)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="py-16 text-center">
            <FileText size={32} className="text-stone-700 mx-auto mb-3" />
            <p className="text-stone-500">Bu kategoride teklif bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
