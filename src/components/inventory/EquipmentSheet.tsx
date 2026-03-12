'use client';

import { X, Coffee, Wind, MapPin, Calendar, Activity, Wrench } from 'lucide-react';
import type { Equipment, MaintenanceRecord } from '@/lib/types';
import StatusBadge from './StatusBadge';
import HealthDot from './HealthDot';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils/format';
import { getHealthPercent, getCupsRemaining } from '@/lib/utils/health';
import { getLocationName } from '@/lib/data/locations';
import { MAINTENANCE_SERVICE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';

interface EquipmentSheetProps {
  equipment: Equipment | null;
  maintenanceHistory: MaintenanceRecord[];
  onClose: () => void;
}

export default function EquipmentSheet({
  equipment,
  maintenanceHistory,
  onClose,
}: EquipmentSheetProps) {
  if (!equipment) return null;

  const healthPercent = getHealthPercent(
    equipment.cupsServedSinceService,
    equipment.cupsServiceThreshold
  );
  const cupsRemaining = getCupsRemaining(
    equipment.cupsServedSinceService,
    equipment.cupsServiceThreshold
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-stone-900 border-l border-stone-700 z-40 flex flex-col shadow-2xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-stone-800 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
              {equipment.type === 'espresso_machine' ? (
                <Coffee size={18} className="text-amber-400" />
              ) : (
                <Wind size={18} className="text-stone-400" />
              )}
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-stone-100 leading-tight">
                {equipment.name}
              </h2>
              <p className="text-xs font-mono text-stone-500 mt-0.5">{equipment.serialNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-800 flex-shrink-0">
          <StatusBadge status={equipment.status} />
          <HealthDot status={equipment.healthStatus} showLabel />
          <span className="text-xs text-stone-500 font-mono ml-auto">
            {equipment.id}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-500 mb-1">Konum</p>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-stone-400 flex-shrink-0" />
                <p className="text-sm text-stone-200 font-medium">
                  {getLocationName(equipment.locationId)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Günlük Kiralama</p>
              <p className="text-sm text-stone-200 font-medium font-mono">
                {formatCurrency(equipment.dailyRentalRate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Son Bakım</p>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-stone-400 flex-shrink-0" />
                <p className="text-sm text-stone-200">{formatDate(equipment.lastServiceDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Toplam Fincan</p>
              <div className="flex items-center gap-1.5">
                <Activity size={13} className="text-stone-400 flex-shrink-0" />
                <p className="text-sm text-stone-200 font-mono">
                  {formatNumber(equipment.totalCupsServed)}
                </p>
              </div>
            </div>
          </div>

          {/* Health progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-stone-400">
                Bakıma Kadar Kullanım
              </p>
              <span className="text-xs font-mono text-stone-400">
                {formatNumber(equipment.cupsServedSinceService)} / {formatNumber(equipment.cupsServiceThreshold)}
              </span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  equipment.healthStatus === 'green'
                    ? 'bg-emerald-500'
                    : equipment.healthStatus === 'yellow'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {cupsRemaining > 0
                ? `Sonraki bakıma ${formatNumber(cupsRemaining)} fincan kaldı`
                : 'Bakım zamanı geldi!'}
            </p>
          </div>

          {/* Maintenance history */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={14} className="text-stone-400" />
              <h3 className="text-sm font-medium text-stone-300">Bakım Geçmişi</h3>
            </div>

            {maintenanceHistory.length === 0 ? (
              <p className="text-xs text-stone-600 italic">Kayıtlı bakım yok.</p>
            ) : (
              <div className="space-y-3">
                {maintenanceHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/60"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-stone-200">
                        {MAINTENANCE_SERVICE_LABELS[record.serviceType]}
                      </span>
                      <span className="text-xs text-stone-500 font-mono flex-shrink-0">
                        {formatDate(record.performedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {record.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-stone-500">{record.performedBy}</span>
                      <span className="text-xs font-mono text-amber-400">
                        {formatCurrency(record.cost)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {equipment.notes && (
            <div>
              <p className="text-xs text-stone-500 mb-1.5">Notlar</p>
              <p className="text-sm text-stone-300 bg-stone-800/60 rounded-lg p-3 border border-stone-700/40">
                {equipment.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
