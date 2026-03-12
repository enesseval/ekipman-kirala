'use client';

import { useState, useMemo } from 'react';
import { Coffee, Wind, Search, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { Equipment, EquipmentStatus, EquipmentType } from '@/lib/types';
import StatusBadge from './StatusBadge';
import HealthDot from './HealthDot';
import EquipmentSheet from './EquipmentSheet';
import { getLocationName } from '@/lib/data/locations';
import { getMaintenanceByEquipment } from '@/lib/data/maintenance';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface EquipmentTableProps {
  equipment: Equipment[];
}

type SortKey = 'id' | 'name' | 'status' | 'health' | 'cups' | 'location';
type SortDir = 'asc' | 'desc';

const HEALTH_ORDER = { red: 0, yellow: 1, green: 2 };
const STATUS_ORDER: Record<EquipmentStatus, number> = { maintenance: 0, rented: 1, available: 2 };

export default function EquipmentTable({ equipment }: EquipmentTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const filtered = useMemo(() => {
    let items = equipment;

    if (typeFilter !== 'all') {
      items = items.filter((e) => e.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      items = items.filter((e) => e.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.brand.toLowerCase().includes(q) ||
          e.model.toLowerCase().includes(q) ||
          e.serialNumber.toLowerCase().includes(q)
      );
    }

    // Sort
    items = [...items].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'id':
          cmp = a.id.localeCompare(b.id);
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name, 'tr');
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'health':
          cmp = HEALTH_ORDER[a.healthStatus] - HEALTH_ORDER[b.healthStatus];
          break;
        case 'cups':
          cmp = a.cupsServedSinceService - b.cupsServedSinceService;
          break;
        case 'location':
          cmp = getLocationName(a.locationId).localeCompare(getLocationName(b.locationId), 'tr');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [equipment, search, typeFilter, statusFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} className="text-stone-700" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-amber-400" />
    ) : (
      <ChevronDown size={12} className="text-amber-400" />
    );
  }

  const maintenanceHistory = selectedEquipment
    ? getMaintenanceByEquipment(selectedEquipment.id)
    : [];

  const espressoCount = equipment.filter((e) => e.type === 'espresso_machine').length;
  const grinderCount = equipment.filter((e) => e.type === 'grinder').length;

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg flex-1 max-w-72">
          <Search size={14} className="text-stone-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="ID, marka, model ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none w-full"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-1">
          {([
            ['all', 'Tümü'],
            ['espresso_machine', `Espresso (${espressoCount})`],
            ['grinder', `Öğütücü (${grinderCount})`],
          ] as [EquipmentType | 'all', string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                typeFilter === val
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-500 hover:text-stone-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-1">
          {([
            ['all', 'Tüm Durum'],
            ['available', 'Müsait'],
            ['rented', 'Kirada'],
            ['maintenance', 'Bakımda'],
          ] as [EquipmentStatus | 'all', string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                statusFilter === val
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-500 hover:text-stone-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-stone-500">
          <SlidersHorizontal size={13} />
          {filtered.length} sonuç
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="bg-stone-900/80">
              <th className="w-28">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-1 hover:text-stone-200 transition-colors"
                >
                  ID <SortIcon col="id" />
                </button>
              </th>
              <th>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-stone-200 transition-colors"
                >
                  Ekipman <SortIcon col="name" />
                </button>
              </th>
              <th className="hidden md:table-cell">
                <button
                  onClick={() => handleSort('location')}
                  className="flex items-center gap-1 hover:text-stone-200 transition-colors"
                >
                  Konum <SortIcon col="location" />
                </button>
              </th>
              <th>
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-stone-200 transition-colors"
                >
                  Durum <SortIcon col="status" />
                </button>
              </th>
              <th className="hidden lg:table-cell">
                <button
                  onClick={() => handleSort('cups')}
                  className="flex items-center gap-1 hover:text-stone-200 transition-colors"
                >
                  Fincan <SortIcon col="cups" />
                </button>
              </th>
              <th>
                <button
                  onClick={() => handleSort('health')}
                  className="flex items-center gap-1 hover:text-stone-200 transition-colors"
                >
                  Sağlık <SortIcon col="health" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((eq) => (
              <tr
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className="cursor-pointer hover:bg-stone-800/40 transition-colors"
              >
                <td>
                  <span className="font-mono text-xs text-stone-400">{eq.id}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
                      {eq.type === 'espresso_machine' ? (
                        <Coffee size={13} className="text-amber-400" />
                      ) : (
                        <Wind size={13} className="text-stone-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-100 leading-tight">{eq.brand}</p>
                      <p className="text-xs text-stone-500 leading-tight">{eq.model}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                  <span className="text-xs text-stone-400">
                    {getLocationName(eq.locationId)}
                  </span>
                </td>
                <td>
                  <StatusBadge status={eq.status} size="sm" />
                </td>
                <td className="hidden lg:table-cell">
                  <span className="text-xs font-mono text-stone-400">
                    {formatNumber(eq.cupsServedSinceService)}
                    <span className="text-stone-600">/{formatNumber(eq.cupsServiceThreshold)}</span>
                  </span>
                </td>
                <td>
                  <HealthDot status={eq.healthStatus} showLabel />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-stone-500 text-sm">Arama kriterlerinize uygun ekipman bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Equipment Sheet */}
      <EquipmentSheet
        equipment={selectedEquipment}
        maintenanceHistory={maintenanceHistory}
        onClose={() => setSelectedEquipment(null)}
      />
    </>
  );
}
