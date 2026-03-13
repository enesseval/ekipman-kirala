'use client';

import {
  X, Printer, Coffee, Wind, Sparkles,
  CheckCircle2, Send, XCircle, AlertCircle, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { printQuote } from '@/lib/utils/print-quote';
import { QUOTE_STATUS_LABELS } from '@/lib/constants';
import type { Quote, QuoteStatus } from '@/lib/types';

const STATUS_CONFIG: Record<QuoteStatus, { icon: React.ComponentType<{ size?: number; className?: string }>; className: string }> = {
  draft:    { icon: FileText,     className: 'text-stone-400 bg-stone-800 border-stone-700' },
  sent:     { icon: Send,         className: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  accepted: { icon: CheckCircle2, className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  rejected: { icon: XCircle,      className: 'text-red-400 bg-red-500/10 border-red-500/30' },
  expired:  { icon: AlertCircle,  className: 'text-stone-500 bg-stone-800/60 border-stone-700' },
};

interface QuoteDetailModalProps {
  quote: Quote;
  onClose: () => void;
}

export default function QuoteDetailModal({ quote, onClose }: QuoteDetailModalProps) {
  const config = STATUS_CONFIG[quote.status];
  const StatusIcon = config.icon;

  const validUntil = quote.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-3xl max-h-[90vh] bg-stone-900 border border-stone-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border', config.className)}>
                <StatusIcon size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-stone-200">{quote.quoteNumber}</span>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', config.className)}>
                    {QUOTE_STATUS_LABELS[quote.status]}
                  </span>
                  {quote.generatedByAI && (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                      <Sparkles size={8} />
                      AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{formatDate(quote.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => printQuote({
                  quoteNumber: quote.quoteNumber,
                  createdAt: quote.createdAt,
                  validUntil,
                  clientName: quote.clientName,
                  clientEmail: quote.clientEmail,
                  clientPhone: quote.clientPhone,
                  proposalText: quote.notes,
                  lineItems: quote.lineItems,
                  subtotal: quote.subtotal,
                  discountAmount: quote.discountAmount,
                  taxRate: quote.taxRate,
                  taxAmount: quote.taxAmount,
                  total: quote.total,
                })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 transition-all"
              >
                <Printer size={13} />
                PDF
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <div className="bg-white rounded-xl shadow text-gray-900 text-sm leading-relaxed">

              {/* Document header */}
              <div className="flex justify-between items-start border-b-2 border-gray-900 p-6 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">BrewOps</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Premium Ekipman Kiralama · Teknik Destek · Barista Hizmetleri</p>
                </div>
                <div className="text-right text-xs text-gray-600 space-y-0.5">
                  <p className="font-bold text-gray-900">{quote.quoteNumber}</p>
                  <p>Tarih: {formatDate(quote.createdAt)}</p>
                  <p>Geçerlilik: {formatDate(validUntil)}</p>
                </div>
              </div>

              {/* Client info */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Sayın</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{quote.clientName || '—'}</p>
                {quote.clientEmail && <p className="text-xs text-gray-500 mt-0.5">{quote.clientEmail}</p>}
                {quote.clientPhone && <p className="text-xs text-gray-500">{quote.clientPhone}</p>}
              </div>

              {/* Proposal text */}
              {quote.notes && (
                <div className="px-6 py-5 border-b border-gray-100">
                  {quote.notes.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className="mb-3 text-gray-700 leading-7">{line}</p>
                  ))}
                </div>
              )}

              {/* Equipment table */}
              {quote.lineItems.length > 0 && (
                <div className="px-6 py-5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">Ekipman ve Fiyat Listesi</p>
                  <table className="w-full text-xs border-collapse mb-4">
                    <thead>
                      <tr className="bg-gray-900 text-white">
                        <th className="text-left px-3 py-2.5 font-medium">Ekipman</th>
                        <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">Tür</th>
                        <th className="text-center px-3 py-2.5 font-medium">Gün</th>
                        <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Birim</th>
                        <th className="text-right px-3 py-2.5 font-medium">Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.lineItems.map((item, i) => (
                        <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2.5 border-b border-gray-100">
                            <div className="flex items-center gap-1.5">
                              {item.equipmentType === 'espresso_machine'
                                ? <Coffee size={11} className="text-amber-500 flex-shrink-0" />
                                : <Wind size={11} className="text-gray-400 flex-shrink-0" />
                              }
                              <span className="font-medium text-gray-800">{item.equipmentName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 border-b border-gray-100 hidden sm:table-cell">
                            {item.equipmentType === 'espresso_machine' ? 'Espresso' : 'Öğütücü'}
                          </td>
                          <td className="px-3 py-2.5 text-center text-gray-700 border-b border-gray-100">{item.days}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-gray-500 border-b border-gray-100 hidden sm:table-cell">
                            {formatCurrency(item.dailyRate)}/gün
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-900 border-b border-gray-100">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="ml-auto w-64 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600 py-1.5 border-b border-gray-200">
                      <span>Ara Toplam</span>
                      <span className="font-mono">{formatCurrency(quote.subtotal)}</span>
                    </div>
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-xs text-green-700 py-1.5 border-b border-gray-200">
                        <span>İndirim</span>
                        <span className="font-mono">−{formatCurrency(quote.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-600 py-1.5 border-b border-gray-200">
                      <span>KDV (%{Math.round((quote.taxRate ?? 0.2) * 100)})</span>
                      <span className="font-mono">{formatCurrency(quote.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-gray-900 py-2.5 border-t-2 border-gray-900 mt-1">
                      <span>Genel Toplam</span>
                      <span className="font-mono">{formatCurrency(quote.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 text-center text-[10px] text-gray-400">
                <p>BrewOps Ekipman Kiralama — Bu teklif {formatDate(validUntil)} tarihine kadar geçerlidir.</p>
                <p>info@brewops.com · +90 (212) 555 01 01 · www.brewops.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
