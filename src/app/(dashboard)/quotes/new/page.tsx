'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coffee,
  Wind,
  Plus,
  Minus,
  Trash2,
  FileText,
  Check,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import QuoteProposalModal from '@/components/quotes/QuoteProposalModal';
import { useRealtimeEquipment } from '@/hooks/useRealtimeEquipment';
import { createQuote } from '@/lib/data/quotes';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Equipment, QuoteLineItem } from '@/lib/types';

let lineItemCounter = 0;

function createLineItem(equipment: Equipment): QuoteLineItem {
  lineItemCounter += 1;
  return {
    id: `new-${lineItemCounter}`,
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    equipmentType: equipment.type,
    days: 1,
    dailyRate: equipment.dailyRentalRate,
    subtotal: equipment.dailyRentalRate,
    notes: '',
  };
}

export default function NewQuotePage() {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventName, setEventName] = useState('');
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'espresso_machine' | 'grinder'>('all');
  const [taxRate] = useState(0.20);
  const [discount, setDiscount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [saving, setSaving] = useState(false);

  const { equipment } = useRealtimeEquipment();
  const availableEquipment = equipment.filter((e) => e.status === 'available');

  const filteredEquipment = useMemo(() => {
    let items = availableEquipment;
    if (typeFilter !== 'all') items = items.filter((e) => e.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
      );
    }
    return items.slice(0, 20);
  }, [availableEquipment, typeFilter, searchQuery]);

  const selectedIds = new Set(lineItems.map((li) => li.equipmentId));

  function toggleMachine(eq: Equipment) {
    if (selectedIds.has(eq.id)) {
      setLineItems((prev) => prev.filter((li) => li.equipmentId !== eq.id));
    } else {
      setLineItems((prev) => [...prev, createLineItem(eq)]);
    }
  }

  function updateDays(id: string, days: number) {
    setLineItems((prev) =>
      prev.map((li) =>
        li.id === id
          ? { ...li, days: Math.max(1, days), subtotal: li.dailyRate * Math.max(1, days) }
          : li
      )
    );
  }

  function removeItem(id: string) {
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  }

  const subtotal = lineItems.reduce((s, li) => s + li.subtotal, 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * taxRate);
  const total = afterDiscount + taxAmount;

  const quoteNumber = `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  const canGenerate = (clientName.trim() || eventName.trim()) && lineItems.length > 0;

  async function handleGenerateProposal() {
    if (!canGenerate || generatingProposal) return;
    setGeneratingProposal(true);
    try {
      const res = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName || eventName,
          eventName,
          clientPhone,
          clientEmail,
          lineItems,
          subtotalKurus: subtotal,
          discountPercent: discount,
          taxAmountKurus: taxAmount,
          totalKurus: total,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setProposalText(data.text);
        setModalOpen(true);
      } else {
        alert(data.error ?? 'Teklif oluşturulamadı.');
      }
    } catch {
      alert('Sunucu hatası. Lütfen tekrar deneyin.');
    } finally {
      setGeneratingProposal(false);
    }
  }

  function handleOpenModal() {
    setModalOpen(true);
  }

  async function handleSaveQuote(text: string, isAI: boolean) {
    setSaving(true);
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    try {
      await createQuote({
        quoteNumber,
        status: 'draft',
        clientName: clientName || eventName || 'Belirtilmedi',
        clientEmail,
        clientPhone,
        eventId: null,
        lineItems,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        total,
        validUntil,
        notes: text,
        generatedByAI: isAI,
      });
      router.push('/quotes');
    } catch (err) {
      console.error('Quote save error:', err);
      alert('Teklif kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Teklif Oluşturucu" subtitle="Yeni teklif hazırla" />

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          {/* LEFT: Builder */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Client info */}
            <div className="card p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-stone-100">Müşteri Bilgileri</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 mb-1.5 block">Etkinlik / Müşteri Adı</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="örn. Koç Holding Yıllık Zirvesi 2026"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 block">Müşteri</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ad Soyad"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 block">Telefon</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+90 5xx xxx xx xx"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 mb-1.5 block">E-posta</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="musteri@firma.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Machine picker */}
            <div className="card p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-stone-100">Ekipman Seç</h3>

              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg flex-1">
                  <Search size={13} className="text-stone-500" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none w-full"
                  />
                </div>
                <div className="flex gap-1 bg-stone-950 border border-stone-800 rounded-lg p-1">
                  {(['all', 'espresso_machine', 'grinder'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        typeFilter === t
                          ? 'bg-stone-800 text-stone-100'
                          : 'text-stone-500 hover:text-stone-300'
                      )}
                    >
                      {t === 'all' ? 'Tümü' : t === 'espresso_machine' ? 'Espresso' : 'Öğütücü'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredEquipment.map((eq) => {
                  const isSelected = selectedIds.has(eq.id);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => toggleMachine(eq)}
                      className={cn(
                        'flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all',
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : 'bg-stone-900/50 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-stone-200'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border',
                          isSelected
                            ? 'bg-amber-500 border-amber-500'
                            : 'bg-stone-800 border-stone-700'
                        )}
                      >
                        {isSelected ? (
                          <Check size={11} className="text-stone-950" />
                        ) : eq.type === 'espresso_machine' ? (
                          <Coffee size={11} className="text-amber-400" />
                        ) : (
                          <Wind size={11} className="text-stone-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{eq.brand} {eq.model}</p>
                        <p className="text-[10px] text-stone-500 font-mono">{eq.id}</p>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 flex-shrink-0">
                        {formatCurrency(eq.dailyRentalRate)}/g
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Line items */}
            {lineItems.length > 0 && (
              <div className="card p-5 space-y-3">
                <h3 className="font-display font-semibold text-sm text-stone-100">Teklif Kalemleri</h3>
                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-stone-950/60 rounded-lg border border-stone-800"
                    >
                      {item.equipmentType === 'espresso_machine' ? (
                        <Coffee size={13} className="text-amber-400 flex-shrink-0" />
                      ) : (
                        <Wind size={13} className="text-stone-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-200 truncate">
                          {item.equipmentName}
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono">{item.equipmentId}</p>
                      </div>

                      {/* Days control */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => updateDays(item.id, item.days - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700 transition-all"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-mono text-stone-200 w-8 text-center">
                          {item.days}g
                        </span>
                        <button
                          onClick={() => updateDays(item.id, item.days + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700 transition-all"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      <span className="text-xs font-mono text-stone-200 w-20 text-right flex-shrink-0">
                        {formatCurrency(item.subtotal)}
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Discount */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="text-xs text-stone-500 flex-shrink-0">İndirim (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                    className="input-field w-20 text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Preview */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-stone-800 flex flex-col">
            <div className="p-5 border-b border-stone-800">
              <h3 className="font-display font-semibold text-sm text-stone-100">Teklif Önizleme</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Quote document */}
              <div className="bg-stone-900/60 rounded-xl border border-stone-700/50 p-5 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Coffee size={11} className="text-amber-400" />
                      </div>
                      <span className="font-display font-bold text-sm text-stone-100">BrewOps</span>
                    </div>
                    <p className="text-[10px] text-stone-500">Ekipman Kiralama</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-stone-200">{quoteNumber}</p>
                    <p className="text-[10px] text-stone-500">{formatDate(today)}</p>
                  </div>
                </div>

                <div className="border-t border-stone-700/50 pt-4">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Müşteri</p>
                  <p className="text-sm font-semibold text-stone-200">
                    {clientName || '—'}
                  </p>
                  {eventName && (
                    <p className="text-xs text-stone-400 mt-0.5">{eventName}</p>
                  )}
                  {clientEmail && (
                    <p className="text-xs text-stone-500 mt-0.5">{clientEmail}</p>
                  )}
                </div>

                {/* Line items */}
                {lineItems.length > 0 ? (
                  <div className="border-t border-stone-700/50 pt-4">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-3">Kalemler</p>
                    <div className="space-y-2">
                      {lineItems.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="text-stone-300 truncate font-medium">{item.equipmentName}</p>
                            <p className="text-stone-600 font-mono">
                              {formatCurrency(item.dailyRate)} × {item.days} gün
                            </p>
                          </div>
                          <span className="font-mono font-medium text-stone-200 flex-shrink-0">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-stone-700/50 pt-4 text-center py-8">
                    <FileText size={20} className="text-stone-700 mx-auto mb-2" />
                    <p className="text-xs text-stone-600">
                      Ekipman seçerek kalemleri ekleyin
                    </p>
                  </div>
                )}

                {/* Totals */}
                {lineItems.length > 0 && (
                  <div className="border-t border-stone-700/50 pt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500">Ara Toplam</span>
                      <span className="font-mono text-stone-300">{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-400">İndirim ({discount}%)</span>
                        <span className="font-mono text-emerald-400">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500">KDV (%20)</span>
                      <span className="font-mono text-stone-300">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-stone-700 pt-2 mt-2">
                      <span className="text-sm text-stone-100">Genel Toplam</span>
                      <span className="font-mono text-base text-amber-400">{formatCurrency(total)}</span>
                    </div>
                  </div>
                )}

                {lineItems.length > 0 && (
                  <p className="text-[10px] text-stone-600 border-t border-stone-700/50 pt-3 leading-relaxed">
                    Bu teklif, ekipman kurulum ve nakliyesi dahil hazırlanmıştır. KDV dahil fiyatlar
                    belirtilmiş olup 30 gün geçerlidir.
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-stone-800 space-y-2">
              {/* AI generate button */}
              <button
                onClick={handleGenerateProposal}
                disabled={!canGenerate || generatingProposal}
                title={!canGenerate ? 'Müşteri adı ve en az 1 ekipman gerekli' : undefined}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                  canGenerate && !generatingProposal
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30'
                    : 'bg-stone-800/60 border border-stone-800 text-stone-500 cursor-not-allowed'
                )}
              >
                {generatingProposal ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {generatingProposal ? 'Teklif Oluşturuluyor...' : 'AI ile Teklif Oluştur'}
              </button>

              <div className="flex gap-2">
                {/* Quick save without AI */}
                <button
                  onClick={() => handleSaveQuote('', false)}
                  disabled={lineItems.length === 0 || saving}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all',
                    lineItems.length === 0 || saving
                      ? 'bg-stone-800/50 border-stone-800 text-stone-600 cursor-not-allowed'
                      : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                  )}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  Taslak Kaydet
                </button>

                {/* Open modal for manual edit + PDF */}
                <button
                  onClick={handleOpenModal}
                  disabled={lineItems.length === 0}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                    lineItems.length === 0
                      ? 'bg-amber-500/30 text-stone-500 cursor-not-allowed'
                      : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                  )}
                >
                  <FileText size={14} />
                  Düzenle & PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Proposal Modal */}
      {modalOpen && (
        <QuoteProposalModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveQuote}
          initialText={proposalText}
          quoteData={{
            clientName: clientName || eventName,
            eventName,
            clientEmail,
            clientPhone,
            lineItems,
            subtotalKurus: subtotal,
            discountPercent: discount,
            discountAmountKurus: discountAmount,
            taxAmountKurus: taxAmount,
            totalKurus: total,
            quoteNumber,
          }}
        />
      )}
    </div>
  );
}
