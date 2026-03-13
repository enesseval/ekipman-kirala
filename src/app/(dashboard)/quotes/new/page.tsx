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
  Sparkles,
  Loader2,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import QuoteProposalModal from '@/components/quotes/QuoteProposalModal';
import { useRealtimeEquipment } from '@/hooks/useRealtimeEquipment';
import { createQuote } from '@/lib/data/quotes';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Equipment, QuoteLineItem, EventType } from '@/lib/types';

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'corporate', label: 'Kurumsal Etkinlik' },
  { value: 'festival', label: 'Festival' },
  { value: 'wedding', label: 'Düğün / Nişan' },
  { value: 'cafe', label: 'Kafe / Kafeterya' },
  { value: 'other', label: 'Diğer' },
];

let lineItemCounter = 0;

function makeLineItem(eq: Equipment, days: number): QuoteLineItem {
  lineItemCounter += 1;
  return {
    id: `item-${lineItemCounter}-${eq.id}`,
    equipmentId: eq.id,
    equipmentName: `${eq.brand} ${eq.model}`,
    equipmentType: eq.type,
    days,
    dailyRate: eq.dailyRentalRate,
    subtotal: eq.dailyRentalRate * days,
    notes: '',
  };
}

export default function NewQuotePage() {
  const router = useRouter();

  // — Client info —
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventName, setEventName] = useState('');

  // — Event requirements —
  const [eventType, setEventType] = useState<EventType>('corporate');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState(100);
  const [expectedCupsPerDay, setExpectedCupsPerDay] = useState(150);
  const [eventNotes, setEventNotes] = useState('');

  // — Quote items —
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [discount, setDiscount] = useState(0);

  // — Manual picker (collapsed by default) —
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'espresso_machine' | 'grinder'>('all');

  // — AI / modal state —
  const [modalOpen, setModalOpen] = useState(false);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [saving, setSaving] = useState(false);

  const { equipment } = useRealtimeEquipment();
  const availableEquipment = equipment.filter((e) => e.status === 'available');

  // Duration from dates
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    return Math.max(1, diff);
  }, [startDate, endDate]);

  // Filtered equipment for manual picker
  const filteredEquipment = useMemo(() => {
    let items = availableEquipment;
    if (typeFilter !== 'all') items = items.filter((e) => e.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (e) => `${e.brand} ${e.model}`.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
      );
    }
    return items.slice(0, 20);
  }, [availableEquipment, typeFilter, searchQuery]);

  const selectedIds = new Set(lineItems.map((li) => li.equipmentId));

  // Calculations
  const subtotal = lineItems.reduce((s, li) => s + li.subtotal, 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * 0.2);
  const total = afterDiscount + taxAmount;

  const quoteNumber = useMemo(
    () => `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`,
    []
  );
  const today = new Date().toISOString().split('T')[0];

  const canGenerate =
    (clientName.trim() || eventName.trim()) && startDate && endDate && !generatingProposal;

  // — Handlers —
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

  function toggleManual(eq: Equipment) {
    if (selectedIds.has(eq.id)) {
      setLineItems((prev) => prev.filter((li) => li.equipmentId !== eq.id));
    } else {
      setLineItems((prev) => [...prev, makeLineItem(eq, durationDays)]);
    }
  }

  async function handleGenerateProposal() {
    if (!canGenerate) return;
    setGeneratingProposal(true);

    try {
      const equipmentForAI = availableEquipment.map((eq) => ({
        id: eq.id,
        name: `${eq.brand} ${eq.model}`,
        type: eq.type,
        dailyRentalRate: eq.dailyRentalRate,
      }));

      const res = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName || eventName,
          eventName,
          clientEmail,
          clientPhone,
          eventType,
          startDate,
          endDate,
          durationDays,
          expectedAttendees,
          expectedCupsPerDay,
          notes: eventNotes,
          availableEquipment: equipmentForAI,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error ?? 'Teklif oluşturulamadı.');
        return;
      }

      // Build line items from AI-selected IDs
      const selected = (data.selectedEquipmentIds as string[])
        .map((id) => availableEquipment.find((e) => e.id === id))
        .filter((e): e is Equipment => e !== undefined);

      setLineItems(selected.map((eq) => makeLineItem(eq, durationDays)));
      setProposalText(data.proposalText ?? '');
      setModalOpen(true);
    } catch {
      alert('Sunucu hatası. Lütfen tekrar deneyin.');
    } finally {
      setGeneratingProposal(false);
    }
  }

  async function handleSaveQuote(text: string, isAI: boolean) {
    setSaving(true);
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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
        taxRate: 0.2,
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
      <TopBar title="Teklif Oluşturucu" subtitle="AI destekli teklif hazırlama" />

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          {/* ── LEFT: Form ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* 1. Müşteri Bilgileri */}
            <div className="card p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-stone-100">Müşteri Bilgileri</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 mb-1.5 block">Etkinlik Adı</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="örn. Koç Holding Yıllık Zirvesi 2026"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 block">Müşteri Adı</label>
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

            {/* 2. Etkinlik Gereksinimleri */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-sm text-stone-100">Etkinlik Gereksinimleri</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                  AI bu bilgileri kullanır
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Event type */}
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 mb-1.5 block">Etkinlik Türü</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="input-field"
                  >
                    {EVENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 flex items-center gap-1">
                    <Calendar size={10} />
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 flex items-center gap-1">
                    <Calendar size={10} />
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {/* Duration badge */}
                {startDate && endDate && (
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-violet-500/5 border border-violet-500/20 rounded-lg">
                      <Calendar size={12} className="text-violet-400" />
                      <span className="text-xs text-violet-300 font-medium">
                        {durationDays} günlük kiralama
                        {startDate && endDate ? ` · ${formatDate(startDate)} – ${formatDate(endDate)}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Attendees */}
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 flex items-center gap-1">
                    <Users size={10} />
                    Tahmini Katılımcı
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="input-field"
                    value={expectedAttendees}
                    onChange={(e) => setExpectedAttendees(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 flex items-center gap-1">
                    <Coffee size={10} />
                    Günlük Fincan İhtiyacı
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="input-field"
                    value={expectedCupsPerDay}
                    onChange={(e) => setExpectedCupsPerDay(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 mb-1.5 block">Özel Notlar</label>
                  <textarea
                    className="input-field resize-none h-20"
                    placeholder="Barista desteği, özel ekipman talebi, mekan özellikleri..."
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Seçilen Ekipmanlar */}
            {lineItems.length > 0 && (
              <div className="card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-sm text-stone-100">Seçilen Ekipmanlar</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                    AI seçti
                  </span>
                  <span className="text-xs text-stone-500 ml-auto">{lineItems.length} kalem</span>
                </div>
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
                        <p className="text-xs font-medium text-stone-200 truncate">{item.equipmentName}</p>
                        <p className="text-[10px] text-stone-500 font-mono">{item.equipmentId}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => updateDays(item.id, item.days - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700 transition-all"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-mono text-stone-200 w-8 text-center">{item.days}g</span>
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
                <div className="flex items-center gap-3 pt-1">
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

            {/* 4. Manuel ekipman ekleme (collapsible) */}
            <div className="card overflow-hidden">
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-stone-400 hover:text-stone-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plus size={13} />
                  Manuel Ekipman Ekle
                </span>
                {pickerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {pickerOpen && (
                <div className="border-t border-stone-800 p-5 space-y-3">
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
                            typeFilter === t ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'
                          )}
                        >
                          {t === 'all' ? 'Tümü' : t === 'espresso_machine' ? 'Espresso' : 'Öğütücü'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {filteredEquipment.map((eq) => {
                      const isSelected = selectedIds.has(eq.id);
                      return (
                        <button
                          key={eq.id}
                          onClick={() => toggleManual(eq)}
                          className={cn(
                            'flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all',
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                              : 'bg-stone-900/50 border-stone-800 text-stone-300 hover:border-stone-700'
                          )}
                        >
                          <div
                            className={cn(
                              'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border',
                              isSelected ? 'bg-amber-500 border-amber-500' : 'bg-stone-800 border-stone-700'
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
              )}
            </div>
          </div>

          {/* ── RIGHT: Preview + Actions ── */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-stone-800 flex flex-col">
            <div className="p-5 border-b border-stone-800">
              <h3 className="font-display font-semibold text-sm text-stone-100">Teklif Özeti</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
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

                {/* Client */}
                <div className="border-t border-stone-700/50 pt-4">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Müşteri</p>
                  <p className="text-sm font-semibold text-stone-200">{clientName || '—'}</p>
                  {eventName && <p className="text-xs text-stone-400 mt-0.5">{eventName}</p>}
                  {startDate && endDate && (
                    <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(startDate)} – {formatDate(endDate)} · {durationDays} gün
                    </p>
                  )}
                </div>

                {/* Line items */}
                {lineItems.length > 0 ? (
                  <div className="border-t border-stone-700/50 pt-4">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-3">Ekipmanlar</p>
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
                    <Sparkles size={20} className="text-stone-700 mx-auto mb-2" />
                    <p className="text-xs text-stone-600">
                      Gereksinimleri girip AI&apos;ı çalıştırın
                    </p>
                    <p className="text-[10px] text-stone-700 mt-1">
                      Ekipmanlar otomatik seçilecek
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
                        <span className="text-emerald-400">İndirim (%{discount})</span>
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
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-stone-800 space-y-2">
              {/* AI generate */}
              <button
                onClick={handleGenerateProposal}
                disabled={!canGenerate || generatingProposal}
                title={
                  !clientName && !eventName
                    ? 'Müşteri veya etkinlik adı girin'
                    : !startDate || !endDate
                    ? 'Başlangıç ve bitiş tarihi girin'
                    : undefined
                }
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all',
                  canGenerate && !generatingProposal
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30'
                    : 'bg-stone-800/60 border border-stone-800 text-stone-500 cursor-not-allowed'
                )}
              >
                {generatingProposal ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                {generatingProposal ? 'AI Teklif Hazırlıyor...' : 'AI ile Teklif Oluştur'}
              </button>

              <div className="flex gap-2">
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
                <button
                  onClick={() => setModalOpen(true)}
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
