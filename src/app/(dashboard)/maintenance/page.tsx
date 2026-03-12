'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Wrench, CheckCircle2, Clock, Plus, History, Trash2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import MachineHealthCard from '@/components/maintenance/MachineHealthCard';
import { useRealtimeEquipment } from '@/hooks/useRealtimeEquipment';
import { useRealtimeMaintenance } from '@/hooks/useRealtimeMaintenance';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { MAINTENANCE_SERVICE_LABELS } from '@/lib/constants';
import type { HealthStatus } from '@/lib/types';

type Tab = 'all' | HealthStatus | 'history';

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const { equipment, loading: equipLoading } = useRealtimeEquipment();
  const { records, loading: recLoading } = useRealtimeMaintenance();

  const redMachines = equipment.filter((e) => e.healthStatus === 'red');
  const yellowMachines = equipment.filter((e) => e.healthStatus === 'yellow');
  const greenMachines = equipment.filter((e) => e.healthStatus === 'green');

  const filtered =
    activeTab === 'all'
      ? equipment
      : activeTab === 'history'
      ? equipment
      : equipment.filter((e) => e.healthStatus === activeTab);

  const sorted = [...filtered].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 };
    return order[a.healthStatus] - order[b.healthStatus];
  });

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: 'Tümü', count: equipment.length, icon: <Wrench size={13} />, color: 'text-stone-400' },
    { key: 'red', label: 'Acil', count: redMachines.length, icon: <AlertTriangle size={13} />, color: 'text-red-400' },
    { key: 'yellow', label: 'Uyarı', count: yellowMachines.length, icon: <Clock size={13} />, color: 'text-amber-400' },
    { key: 'green', label: 'Sağlıklı', count: greenMachines.length, icon: <CheckCircle2 size={13} />, color: 'text-emerald-400' },
    { key: 'history', label: 'Geçmiş', count: records.length, icon: <History size={13} />, color: 'text-blue-400' },
  ];

  // Get equipment name for a record
  const getEquipmentName = (equipmentId: string) => {
    const eq = equipment.find((e) => e.id === equipmentId);
    return eq ? `${eq.brand} ${eq.model}` : equipmentId;
  };

  const isLoading = equipLoading || recLoading;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Bakım Takibi"
        subtitle={isLoading ? 'Yükleniyor...' : `${redMachines.length} acil · ${yellowMachines.length} yakında bakım · ${greenMachines.length} sağlıklı`}
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
                <Link
                  key={m.id}
                  href={`/maintenance/new?equipmentId=${m.id}`}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                  {m.id}
                </Link>
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
        {equipment.length > 0 && (
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
        )}

        {/* Tabs + CTA */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl p-1 w-fit flex-wrap">
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
          <Link href="/maintenance/new" className="btn-primary flex items-center gap-2">
            <Plus size={14} />
            Bakım Kaydı Ekle
          </Link>
        </div>

        {/* History tab content */}
        {activeTab === 'history' ? (
          <div className="card overflow-hidden">
            {recLoading ? (
              <div className="p-8 text-center text-stone-500 text-sm">Yükleniyor...</div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-sm">
                Henüz bakım kaydı bulunmuyor.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-800 text-xs text-stone-500 uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Ekipman</th>
                    <th className="text-left px-4 py-3 font-medium">Servis Türü</th>
                    <th className="text-left px-4 py-3 font-medium">Teknisyen</th>
                    <th className="text-left px-4 py-3 font-medium">Tarih</th>
                    <th className="text-right px-4 py-3 font-medium">Maliyet</th>
                    <th className="text-right px-4 py-3 font-medium">Fincan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-stone-800/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-stone-200 font-medium">{getEquipmentName(record.equipmentId)}</p>
                          <p className="text-xs text-stone-500 font-mono">{record.equipmentId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full border font-medium',
                          record.serviceType === 'repair'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : record.serviceType === 'deep_clean'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : record.serviceType === 'part_replacement'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}>
                          {MAINTENANCE_SERVICE_LABELS[record.serviceType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-300">{record.performedBy}</td>
                      <td className="px-4 py-3 text-stone-400">{formatDate(record.performedAt)}</td>
                      <td className="px-4 py-3 text-right text-stone-300 font-mono">
                        {record.cost > 0 ? formatCurrency(record.cost) : <span className="text-stone-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-stone-500 font-mono text-xs">
                        {record.cupsAtService.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* Equipment health cards grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((eq) => (
              <MachineHealthCard key={eq.id} equipment={eq} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
