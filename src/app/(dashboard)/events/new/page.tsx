'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Wind,
  FileText,
  Wrench,
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { getAvailableEspressoMachines, getAvailableGrinders } from '@/lib/data/equipment';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { EventType } from '@/lib/types';

const EVENT_TYPES: { value: EventType; label: string; icon: string; desc: string }[] = [
  { value: 'wedding', label: 'Düğün', icon: '💍', desc: 'Özel gün, 1-2 gün' },
  { value: 'corporate', label: 'Kurumsal', icon: '🏢', desc: 'Toplantı, konferans, ofis' },
  { value: 'festival', label: 'Festival', icon: '🎪', desc: 'Açık etkinlik, çok günlü' },
  { value: 'cafe', label: 'Kafe', icon: '☕', desc: 'Süregelen kiralama' },
  { value: 'other', label: 'Diğer', icon: '📌', desc: 'Özel etkinlik' },
];

// Mock AI recommendation for Phase 1
function getAIRecommendation(
  eventType: EventType,
  attendees: number,
  days: number
) {
  const espressoMachines = getAvailableEspressoMachines();
  const grinders = getAvailableGrinders();

  let machineCount: number;
  let grinderCount: number;
  let baristaCount: number;

  switch (eventType) {
    case 'festival':
      machineCount = Math.max(1, Math.ceil(attendees / 250));
      break;
    case 'corporate':
      machineCount = Math.max(1, Math.ceil(attendees / 120));
      break;
    case 'wedding':
      machineCount = Math.max(1, Math.ceil(attendees / 90));
      break;
    default:
      machineCount = Math.max(1, Math.ceil(attendees / 150));
  }

  grinderCount = machineCount * 2;
  baristaCount = Math.ceil(machineCount * 1.5);

  const recommendedMachines = espressoMachines
    .filter((m) => m.healthStatus === 'green')
    .slice(0, machineCount);
  const recommendedGrinders = grinders
    .filter((g) => g.healthStatus === 'green')
    .slice(0, grinderCount);

  const totalCost = (
    recommendedMachines.reduce((s, m) => s + m.dailyRentalRate, 0) +
    recommendedGrinders.reduce((s, g) => s + g.dailyRentalRate, 0)
  ) * days;

  return {
    machineCount,
    grinderCount,
    baristaCount,
    machines: recommendedMachines,
    grinders: recommendedGrinders,
    estimatedCost: totalCost,
    reasoning: `${attendees.toLocaleString('tr-TR')} katılımcılı ${days} günlük bir ${EVENT_TYPES.find((t) => t.value === eventType)?.label.toLowerCase()} için optimum kurulum hesaplandı. Günde yaklaşık ${Math.round(attendees * 0.4).toLocaleString('tr-TR')} fincan espresso kapasitesi öngörülüyor.`,
  };
}

export default function NewEventPage() {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState<EventType>('corporate');
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    venueName: '',
    venueAddress: '',
    startDate: '2026-04-10',
    endDate: '2026-04-12',
    attendees: 500,
    cupsPerDay: 200,
    notes: '',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<ReturnType<typeof getAIRecommendation> | null>(null);

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  function handleGetRecommendation() {
    setAiLoading(true);
    setRecommendation(null);
    // Simulate AI delay
    setTimeout(() => {
      const rec = getAIRecommendation(eventType, formData.attendees, days);
      setRecommendation(rec);
      setAiLoading(false);
    }, 1800);
  }

  const steps = ['Etkinlik Detayları', 'Gereksinimler', 'AI Öneri'];

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Etkinlik Planlayıcı" subtitle="Yapay zeka destekli ekipman planlama" />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-all',
                  step > i + 1
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : step === i + 1
                    ? 'bg-amber-500 border-amber-500 text-stone-950'
                    : 'bg-stone-900 border-stone-700 text-stone-500'
                )}
              >
                {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  step === i + 1 ? 'text-stone-100' : 'text-stone-500'
                )}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-px',
                    step > i + 1 ? 'bg-emerald-500/40' : 'bg-stone-700'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Event details */}
        {step === 1 && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <h2 className="font-display font-bold text-lg text-stone-100">Etkinlik Türü</h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setEventType(t.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all',
                    eventType === t.value
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  )}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-medium">{t.label}</span>
                  <span className="text-[10px] text-stone-500">{t.desc}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="col-span-2">
                <label className="text-xs text-stone-400 mb-1.5 block font-medium">Etkinlik Adı</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="örn. Sabancı CEO Zirvesi 2026"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block font-medium">Müşteri Adı</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Müşteri adı soyadı"
                  value={formData.clientName}
                  onChange={(e) => setFormData((f) => ({ ...f, clientName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block font-medium">Telefon</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+90 5xx xxx xx xx"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData((f) => ({ ...f, clientPhone: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-stone-400 mb-1.5 block font-medium flex items-center gap-1">
                  <MapPin size={11} />
                  Etkinlik Mekanı
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="örn. Mandarin Oriental, Beşiktaş, İstanbul"
                  value={formData.venueName}
                  onChange={(e) => setFormData((f) => ({ ...f, venueName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block font-medium flex items-center gap-1">
                  <Calendar size={11} />
                  Başlangıç
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.startDate}
                  onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block font-medium flex items-center gap-1">
                  <Calendar size={11} />
                  Bitiş
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.endDate}
                  onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setStep(2)} className="btn-primary">
                Devam <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <h2 className="font-display font-bold text-lg text-stone-100">Gereksinimler</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block font-medium flex items-center gap-1">
                  <Users size={11} />
                  Beklenen Katılımcı
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={1}
                  value={formData.attendees}
                  onChange={(e) => setFormData((f) => ({ ...f, attendees: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block font-medium flex items-center gap-1">
                  <Coffee size={11} />
                  Günlük Fincan Tahmini
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={1}
                  value={formData.cupsPerDay}
                  onChange={(e) => setFormData((f) => ({ ...f, cupsPerDay: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-stone-400 mb-1.5 block font-medium">Özel Notlar</label>
                <textarea
                  className="input-field resize-none h-24"
                  placeholder="Özel gereksinimler, tercihler veya notlar..."
                  value={formData.notes}
                  onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
              {[
                { label: 'Süre', value: `${days} gün` },
                { label: 'Katılımcı', value: formatNumber(formData.attendees) },
                { label: 'Günlük Fincan', value: formatNumber(formData.cupsPerDay) },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xs text-stone-500">{item.label}</p>
                  <p className="font-display font-bold text-stone-100 text-lg">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ArrowLeft size={14} />
                Geri
              </button>
              <button onClick={() => { setStep(3); handleGetRecommendation(); }} className="btn-primary">
                <Sparkles size={14} />
                AI Öneri Al
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Recommendation */}
        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            {aiLoading ? (
              <div className="card p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={22} className="text-amber-400 animate-spin-slow" />
                </div>
                <p className="font-display font-semibold text-stone-200 text-base mb-1">
                  AI Analiz Ediyor...
                </p>
                <p className="text-sm text-stone-500">
                  {formData.attendees} katılımcı için optimum ekipman kurulumu hesaplanıyor
                </p>
                <div className="flex justify-center gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse-soft"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : recommendation ? (
              <>
                {/* Recommendation card */}
                <div className="card p-6 border-amber-500/20 ring-1 ring-amber-500/15">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Sparkles size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-stone-100">
                        AI Önerisi Hazır
                      </h3>
                      <p className="text-xs text-stone-500">{recommendation.reasoning}</p>
                    </div>
                  </div>

                  {/* Recommended counts */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-stone-800/60 rounded-xl p-4 text-center border border-stone-700/50">
                      <Coffee size={20} className="text-amber-400 mx-auto mb-2" />
                      <p className="text-2xl font-display font-bold text-stone-100">
                        {recommendation.machineCount}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">Espresso Makinesi</p>
                    </div>
                    <div className="bg-stone-800/60 rounded-xl p-4 text-center border border-stone-700/50">
                      <Wind size={20} className="text-stone-400 mx-auto mb-2" />
                      <p className="text-2xl font-display font-bold text-stone-100">
                        {recommendation.grinderCount}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">Öğütücü</p>
                    </div>
                    <div className="bg-stone-800/60 rounded-xl p-4 text-center border border-stone-700/50">
                      <Users size={20} className="text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-display font-bold text-stone-100">
                        {recommendation.baristaCount}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">Barista</p>
                    </div>
                  </div>

                  {/* Recommended machines */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      Önerilen Ekipman
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {recommendation.machines.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/40">
                          <Coffee size={13} className="text-amber-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-stone-200 truncate">{m.name}</p>
                            <p className="text-[10px] text-stone-500 font-mono">{m.id}</p>
                          </div>
                          <span className="text-xs font-mono text-emerald-400">✓ Müsait</span>
                          <span className="text-xs font-mono text-stone-400">
                            {formatCurrency(m.dailyRentalRate)}/gün
                          </span>
                        </div>
                      ))}
                      {recommendation.grinders.slice(0, 4).map((g) => (
                        <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/40">
                          <Wind size={13} className="text-stone-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-stone-200 truncate">{g.name}</p>
                            <p className="text-[10px] text-stone-500 font-mono">{g.id}</p>
                          </div>
                          <span className="text-xs font-mono text-emerald-400">✓ Müsait</span>
                          <span className="text-xs font-mono text-stone-400">
                            {formatCurrency(g.dailyRentalRate)}/gün
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="mt-5 pt-4 border-t border-stone-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-500">Tahmini toplam ({days} gün)</p>
                      <p className="font-display font-bold text-xl text-stone-100">
                        {formatCurrency(recommendation.estimatedCost)}
                      </p>
                    </div>
                    <Link
                      href="/quotes/new"
                      className="btn-primary"
                    >
                      <FileText size={14} />
                      Teklif Oluştur
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="btn-secondary">
                    <ArrowLeft size={14} />
                    Düzenle
                  </button>
                  <button onClick={handleGetRecommendation} className="btn-ghost">
                    <Sparkles size={14} />
                    Yeniden Hesapla
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
