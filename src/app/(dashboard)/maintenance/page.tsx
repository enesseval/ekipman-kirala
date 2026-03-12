'use client';

import { useState } from 'react';
import { AlertTriangle, Wrench, CheckCircle2, Clock } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import MachineHealthCard from '@/components/maintenance/MachineHealthCard';
import { getEquipment } from '@/lib/data/equipment';
import { cn } from '@/lib/utils/cn';
import type { HealthStatus } from '@/lib/types';

type Tab = 'all' | HealthStatus;

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const equipment = getEquipment();
  const redMachines = equipment.filter((e) => e.healthStatus === 'red');
  const yellowMachines = equipment.filter((e) => e.healthStatus === 'yellow');
  const greenMachines = equipment.filter((e) => e.healthStatus === 'green');

  const filtered =
    activeTab === 'all'
      ? equipment
      : equipment.filter((e) => e.healthStatus === activeTab);

  // Sort: red first, then yellow, then green
  const sorted = [...filtered].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 };
    return order[a.healthStatus] - order[b.healthStatus];
  });

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: 'Tümü', count: equipment.length, icon: <Wrench size={13} />, color: 'text-stone-400' },
    { key: 'red', label: 'Acil', count: redMachines.length, icon: <AlertTriangle size={13} />, color: 'text-red-400' },
    { key: 'yellow', label: 'Uyarı', count: yellowMachines.length, icon: <Clock size={13} />, color: 'text-amber-400' },
    { key: 'green', label: 'Sağlıklı', count: greenMachines.length, icon: <CheckCircle2 size={13} />, color: 'text-emerald-400' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Bakım Takibi"
        subtitle={`${redMachines.length} acil · ${yellowMachines.length} yakında bakım · ${greenMachines.length} sağlıklı`}
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Alert banner */}
        {redMachines.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={15} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-300">
                {redMachines.length} makine acil bakım gerektiriyor
              </p>
              <p className="text-xs text-red-400/70 mt-0.5">
                Bu makineler servis eşiğini aşmış durumda. Lütfen en kısa sürede bakım planlayın.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              {redMachines.slice(0, 3).map((m) => (
                <span key={m.id} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  {m.id}
                </span>
              ))}
              {redMachines.length > 3 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  +{redMachines.length - 3} daha
                </span>
              )}
            </div>
          </div>
        )}

        {/* Health summary bar */}
        <div className="card p-4">
          <p className="text-xs text-stone-500 mb-3 font-medium">Filo Durumu</p>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(greenMachines.length / equipment.length) * 100}%` }}
              title={`${greenMachines.length} sağlıklı`}
            />
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(yellowMachines.length / equipment.length) * 100}%` }}
              title={`${yellowMachines.length} uyarı`}
            />
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(redMachines.length / equipment.length) * 100}%` }}
              title={`${redMachines.length} acil`}
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {greenMachines.length} Sağlıklı ({Math.round((greenMachines.length / equipment.length) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {yellowMachines.length} Uyarı ({Math.round((yellowMachines.length / equipment.length) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {redMachines.length} Acil ({Math.round((redMachines.length / equipment.length) * 100)}%)
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-500 hover:text-stone-300'
              )}
            >
              <span className={activeTab === tab.key ? tab.color : ''}>{tab.icon}</span>
              {tab.label}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-mono',
                  activeTab === tab.key
                    ? 'bg-stone-700 text-stone-300'
                    : 'bg-stone-800 text-stone-600'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((eq) => (
            <MachineHealthCard key={eq.id} equipment={eq} />
          ))}
        </div>
      </div>
    </div>
  );
}
