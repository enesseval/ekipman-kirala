'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { cn } from '@/lib/utils/cn';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { EventType } from '@/lib/types';

const VENUE_TYPE_OPTIONS: { type: EventType; emoji: string; desc: string }[] = [
  { type: 'cafe', emoji: '☕', desc: 'Kafe / Restoran' },
  { type: 'festival', emoji: '🎪', desc: 'Açık hava / Festival' },
  { type: 'wedding', emoji: '💍', desc: 'Düğün / Organizasyon' },
  { type: 'corporate', emoji: '🏢', desc: 'Ofis / Kurumsal' },
  { type: 'other', emoji: '📦', desc: 'Depo / Diğer' },
];

export default function NewLocationPage() {
  const router = useRouter();

  const [venueType, setVenueType] = useState<EventType>('corporate');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name && address && contactName;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      const { createLocation } = await import('@/lib/data/locations');
      await createLocation({
        name,
        venueType,
        address,
        city,
        country: 'Türkiye',
        lat: null,
        lng: null,
        contactName,
        contactEmail,
        contactPhone,
        activeEventId: null,
        startDate: null,
        endDate: null,
        notes,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => router.push('/locations'), 1200);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Yeni Konum" subtitle="Kiralama yapılacak mekan ekle" />

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link href="/locations" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors mb-6">
          <ArrowLeft size={14} />
          Konumlara Dön
        </Link>

        <div className="card p-6 space-y-6">

          {/* Venue type */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-3">
              Mekan Türü
            </label>
            <div className="grid grid-cols-5 gap-2">
              {VENUE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setVenueType(opt.type)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                    venueType === opt.type
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-stone-700 bg-stone-800/40 text-stone-400 hover:border-stone-600'
                  )}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-[9px] font-medium text-center leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Mekan Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn. Cafe Nero — Kadıköy"
              className="input-field w-full"
            />
          </div>

          {/* Address + City */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
                Adres
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Sokak, Mahalle, Bina No"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
                Şehir
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="İstanbul"
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-3">
              İletişim Kişisi
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ad Soyad"
                className="input-field w-full"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="eposta@ornek.com"
                  className="input-field w-full"
                />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Erişim bilgileri, özel talepler, vb."
              rows={3}
              className="input-field w-full resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-stone-800">
            <Link href="/locations" className="btn-secondary flex-1 text-center">
              İptal
            </Link>
            <button
              onClick={handleSave}
              disabled={!isValid || saving || saved}
              className={cn(
                'btn-primary flex-1 flex items-center justify-center gap-2',
                (!isValid || saving) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saved ? <>Kaydedildi ✓</> : saving ? <>Kaydediliyor...</> : <><Save size={14} /> Konum Ekle</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
