import Link from 'next/link';
import { Coffee, Wind, Calendar, Activity, Wrench, MapPin } from 'lucide-react';
import type { Equipment } from '@/lib/types';
import HealthStatusBar from './HealthStatusBar';
import { formatDate, formatNumber, formatCurrency } from '@/lib/utils/format';
import { getCupsRemaining, getHealthLabel, getHealthColorClasses } from '@/lib/utils/health';
import { getLocationName } from '@/lib/data/locations';
import { cn } from '@/lib/utils/cn';

interface MachineHealthCardProps {
  equipment: Equipment;
}

export default function MachineHealthCard({ equipment }: MachineHealthCardProps) {
  const colors = getHealthColorClasses(equipment.healthStatus);
  const cupsRemaining = getCupsRemaining(
    equipment.cupsServedSinceService,
    equipment.cupsServiceThreshold
  );

  return (
    <div
      className={cn(
        'card p-4 flex flex-col gap-4 animate-slide-up border',
        equipment.healthStatus === 'red'
          ? 'border-red-500/30 bg-red-500/5'
          : equipment.healthStatus === 'yellow'
          ? 'border-amber-500/20'
          : 'border-stone-800'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
          {equipment.type === 'espresso_machine' ? (
            <Coffee size={16} className="text-amber-400" />
          ) : (
            <Wind size={16} className="text-stone-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-100 truncate leading-tight">
            {equipment.brand} {equipment.model}
          </p>
          <p className="text-xs font-mono text-stone-500 mt-0.5">{equipment.id}</p>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full border flex-shrink-0',
            colors.text,
            colors.bg,
            colors.border
          )}
        >
          {getHealthLabel(equipment.healthStatus)}
        </span>
      </div>

      {/* Health bar */}
      <HealthStatusBar
        cupsServed={equipment.cupsServedSinceService}
        threshold={equipment.cupsServiceThreshold}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-stone-800/60 rounded-lg p-2.5">
          <p className="text-[10px] text-stone-500 mb-0.5 flex items-center gap-1">
            <Activity size={9} />
            Servisten beri
          </p>
          <p className="text-sm font-mono font-semibold text-stone-200">
            {formatNumber(equipment.cupsServedSinceService)}
            <span className="text-xs text-stone-500 font-normal ml-1">fincan</span>
          </p>
        </div>
        <div className="bg-stone-800/60 rounded-lg p-2.5">
          <p className="text-[10px] text-stone-500 mb-0.5 flex items-center gap-1">
            <Wrench size={9} />
            Kalan
          </p>
          <p
            className={cn(
              'text-sm font-mono font-semibold',
              cupsRemaining === 0
                ? 'text-red-400'
                : equipment.healthStatus === 'yellow'
                ? 'text-amber-400'
                : 'text-emerald-400'
            )}
          >
            {cupsRemaining > 0 ? formatNumber(cupsRemaining) : '!'}
            <span className="text-xs text-stone-500 font-normal ml-1">fincan</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-800/60 pt-3 flex items-center gap-3 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <Calendar size={10} />
          {formatDate(equipment.lastServiceDate)}
        </span>
        <span className="flex items-center gap-1 ml-auto truncate">
          <MapPin size={10} />
          <span className="truncate">{getLocationName(equipment.locationId)}</span>
        </span>
      </div>

      {/* Schedule service button for red/yellow */}
      {(equipment.healthStatus === 'red' || equipment.healthStatus === 'yellow') && (
        <Link
          href={`/maintenance/new?equipmentId=${equipment.id}`}
          className={cn(
            'w-full py-2 rounded-lg text-xs font-medium border transition-all text-center block',
            equipment.healthStatus === 'red'
              ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          )}
        >
          <Wrench size={11} className="inline mr-1.5" />
          {equipment.healthStatus === 'red' ? 'ACİL Bakım Planla' : 'Bakım Planla'}
        </Link>
      )}
    </div>
  );
}
