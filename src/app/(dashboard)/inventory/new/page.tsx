'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Coffee, Wind, Save } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { cn } from '@/lib/utils/cn';
import { DEFAULT_ESPRESSO_DAILY_RATE, DEFAULT_GRINDER_DAILY_RATE, ESPRESSO_SERVICE_THRESHOLD, GRINDER_SERVICE_THRESHOLD } from '@/lib/constants';
import { getLocations } from '@/lib/data/locations';

const ESPRESSO_BRANDS = [
  { brand: 'La Marzocco', models: ['Linea PB', 'GB5 X', 'Strada EP', 'Leva X'] },
  { brand: 'Nuova Simonelli', models: ['Aurelia Wave', 'Appia Life', 'Mythos One'] },
  { brand: 'Victoria Arduino', models: ['Black Eagle Maverick', 'Eagle One Prima', 'White Eagle'] },
  { brand: 'Slayer', models: ['Slayer Single Group', 'Slayer Two Group', 'Slayer Steam EP'] },
  { brand: 'Synesso', models: ['MVP Hydra', 'S-Series', 'Cyncra'] },
  { brand: 'Rocket Espresso', models: ['R Nine One', 'R Ten', 'RE Doppia'] },
];

const GRINDER_BRANDS = [
  { brand: 'Mahlkönig', models: ['EK43 S', 'E65S GbW', 'Peak', 'X54'] },
  { brand: 'Eureka', models: ['Atom 75', 'Helios 80', 'Mignon Specialita'] },
  { brand: 'Mazzer', models: ['Kony E', 'Kold S', 'Super Jolly V Pro'] },
  { brand: 'Weber Workshops', models: ['EG-1', 'Key'] },
  { brand: 'Baratza', models: ['Forte BG', 'Sette 270', 'Encore ESP'] },
];

export default function NewEquipmentPage() {
  const router = useRouter();
  const locations = getLocations();

  const [type, setType] = useState<'espresso_machine' | 'grinder'>('espresso_machine');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [locationId, setLocationId] = useState('');
  const [dailyRate, setDailyRate] = useState(
    type === 'espresso_machine' ? DEFAULT_ESPRESSO_DAILY_RATE / 100 : DEFAULT_GRINDER_DAILY_RATE / 100
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brands = type === 'espresso_machine' ? ESPRESSO_BRANDS : GRINDER_BRANDS;
  const selectedBrand = brands.find((b) => b.brand === brand);

  const handleTypeChange = (t: 'espresso_machine' | 'grinder') => {
    setType(t);
    setBrand('');
    setModel('');
    setDailyRate(t === 'espresso_machine' ? DEFAULT_ESPRESSO_DAILY_RATE / 100 : DEFAULT_GRINDER_DAILY_RATE / 100);
  };

  const handleSave = async () => {
    if (!brand || !model || !serialNumber) return;
    setSaving(true);
    setError(null);
    try {
      const { createEquipment } = await import('@/lib/data/equipment');
      await createEquipment({
        name: `${brand} ${model}`,
        type,
        brand,
        model,
        serialNumber,
        status: 'available',
        healthStatus: 'green',
        cupsServedSinceService: 0,
        cupsServiceThreshold: type === 'espresso_machine' ? ESPRESSO_SERVICE_THRESHOLD : GRINDER_SERVICE_THRESHOLD,
        totalCupsServed: 0,
        locationId: locationId || null,
        lastServiceDate: new Date().toISOString().slice(0, 10),
        nextServiceDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        dailyRentalRate: dailyRate * 100,
        notes,
        imageUrl: null,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => router.push('/inventory'), 1200);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const isValid = brand && model && serialNumber;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Yeni Ekipman" subtitle="Envantere makine veya öğütücü ekle" />

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Back link */}
        <Link href="/inventory" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors mb-6">
          <ArrowLeft size={14} />
          Envantere Dön
        </Link>

        <div className="card p-6 space-y-6">

          {/* Type selector */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-3">
              Ekipman Türü
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('espresso_machine')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  type === 'espresso_machine'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-stone-700 bg-stone-800/40 text-stone-400 hover:border-stone-600'
                )}
              >
                <Coffee size={22} />
                <div className="text-left">
                  <p className="font-medium text-sm">Espresso Makinesi</p>
                  <p className="text-xs opacity-60">Profesyonel grup makinesi</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('grinder')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  type === 'grinder'
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                    : 'border-stone-700 bg-stone-800/40 text-stone-400 hover:border-stone-600'
                )}
              >
                <Wind size={22} />
                <div className="text-left">
                  <p className="font-medium text-sm">Kahve Öğütücü</p>
                  <p className="text-xs opacity-60">Tek doz / dozer öğütücü</p>
                </div>
              </button>
            </div>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
                Marka
              </label>
              <select
                value={brand}
                onChange={(e) => { setBrand(e.target.value); setModel(''); }}
                className="input-field w-full"
              >
                <option value="">Marka seçin</option>
                {brands.map((b) => (
                  <option key={b.brand} value={b.brand}>{b.brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!brand}
                className="input-field w-full disabled:opacity-40"
              >
                <option value="">Model seçin</option>
                {selectedBrand?.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Serial number */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Seri Numarası
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              placeholder="SN-2026-XXXXXX"
              className="input-field w-full font-mono"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Başlangıç Konumu
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Depo (varsayılan)</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Daily rate */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Günlük Kiralama Ücreti (₺)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">₺</span>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                min={0}
                step={50}
                className="input-field w-full pl-7 font-mono"
              />
            </div>
            <p className="text-[10px] text-stone-600 mt-1">
              Bakım eşiği: {type === 'espresso_machine' ? ESPRESSO_SERVICE_THRESHOLD.toLocaleString('tr-TR') : GRINDER_SERVICE_THRESHOLD.toLocaleString('tr-TR')} fincan
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Satın alma tarihi, özel durumlar, vb."
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
            <Link href="/inventory" className="btn-secondary flex-1 text-center">
              İptal
            </Link>
            <button
              onClick={handleSave}
              disabled={!isValid || saving || saved}
              className={cn(
                'btn-primary flex-1 flex items-center justify-center gap-2',
                (!isValid || saving || saved) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saved ? (
                <>Kaydedildi ✓</>
              ) : saving ? (
                <>Kaydediliyor...</>
              ) : (
                <><Save size={14} /> Ekipman Ekle</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
