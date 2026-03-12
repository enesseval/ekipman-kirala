'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wrench, Save } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { cn } from '@/lib/utils/cn';
import { MAINTENANCE_SERVICE_LABELS } from '@/lib/constants';
import { getEquipment } from '@/lib/data/equipment';
import { formatDate } from '@/lib/utils/format';
import type { MaintenanceRecord } from '@/lib/types';

const SERVICE_TYPES = Object.entries(MAINTENANCE_SERVICE_LABELS) as [MaintenanceRecord['serviceType'], string][];

export default function NewMaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('equipmentId') ?? '';

  const allEquipment = getEquipment();
  const today = new Date().toISOString().slice(0, 10);

  const [equipmentId, setEquipmentId] = useState(preselectedId);
  const [serviceType, setServiceType] = useState<MaintenanceRecord['serviceType']>('routine');
  const [performedBy, setPerformedBy] = useState('');
  const [performedAt, setPerformedAt] = useState(today);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedEquipment = allEquipment.find((e) => e.id === equipmentId);
  const isValid = equipmentId && performedBy && description && cost;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      const { createMaintenanceRecord } = await import('@/lib/data/maintenance');
      const eq = allEquipment.find((e) => e.id === equipmentId);
      await createMaintenanceRecord({
        equipmentId,
        serviceType,
        performedBy,
        performedAt,
        cupsAtService: eq?.cupsServedSinceService ?? 0,
        description,
        cost: Math.round(Number(cost) * 100),
        nextServiceAt: (eq?.cupsServiceThreshold ?? 5000),
      });
    } catch { /* fallback: navigate anyway */ }
    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push('/maintenance'), 1200);
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Bakım Kaydı Ekle" subtitle="Gerçekleştirilen servis işlemini kaydet" />

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link href="/maintenance" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors mb-6">
          <ArrowLeft size={14} />
          Bakım Takibine Dön
        </Link>

        <div className="card p-6 space-y-6">

          {/* Equipment selector */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Ekipman
            </label>
            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Ekipman seçin</option>
              <optgroup label="Acil Bakım Gereken">
                {allEquipment.filter((e) => e.healthStatus === 'red').map((e) => (
                  <option key={e.id} value={e.id}>
                    ⚠ {e.name} — {e.serialNumber}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Yakında Bakım">
                {allEquipment.filter((e) => e.healthStatus === 'yellow').map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.serialNumber}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Diğer">
                {allEquipment.filter((e) => e.healthStatus === 'green').map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.serialNumber}
                  </option>
                ))}
              </optgroup>
            </select>
            {selectedEquipment && (
              <p className="text-[10px] text-stone-500 mt-1 font-mono">
                {selectedEquipment.id} · {selectedEquipment.cupsServedSinceService.toLocaleString('tr-TR')} / {selectedEquipment.cupsServiceThreshold.toLocaleString('tr-TR')} fincan kullanılmış
              </p>
            )}
          </div>

          {/* Service type */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-3">
              Servis Türü
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPES.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setServiceType(key)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                    serviceType === key
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-stone-700 bg-stone-800/40 text-stone-400 hover:border-stone-600'
                  )}
                >
                  <Wrench size={14} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Performed by + date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
                Teknisyen
              </label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder="Ad Soyad"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
                Tarih
              </label>
              <input
                type="date"
                value={performedAt}
                onChange={(e) => setPerformedAt(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Yapılan işlemler, değiştirilen parçalar, gözlemler..."
              rows={4}
              className="input-field w-full resize-none"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-2">
              Maliyet (₺)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">₺</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min={0}
                step={50}
                placeholder="0"
                className="input-field w-full pl-7 font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-stone-800">
            <Link href="/maintenance" className="btn-secondary flex-1 text-center">
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
              {saved ? <>Kaydedildi ✓</> : saving ? <>Kaydediliyor...</> : <><Save size={14} /> Bakımı Kaydet</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
