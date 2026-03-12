import { Coffee, Wind } from 'lucide-react';
import type { Equipment } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface MachineChipProps {
  equipment: Equipment;
}

const HEALTH_COLORS: Record<string, string> = {
  green: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
  yellow: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  red: 'border-red-500/30 bg-red-500/5 text-red-300',
};

export default function MachineChip({ equipment }: MachineChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium font-mono',
        HEALTH_COLORS[equipment.healthStatus]
      )}
      title={`${equipment.name} — ${equipment.healthStatus === 'green' ? 'Sağlıklı' : equipment.healthStatus === 'yellow' ? 'Yakında Bakım' : 'Acil Bakım'}`}
    >
      {equipment.type === 'espresso_machine' ? (
        <Coffee size={9} />
      ) : (
        <Wind size={9} />
      )}
      {equipment.id}
    </span>
  );
}
