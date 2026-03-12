'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import EquipmentTable from '@/components/inventory/EquipmentTable';
import { useRealtimeEquipment } from '@/hooks/useRealtimeEquipment';

export default function InventoryPage() {
  const { equipment, loading } = useRealtimeEquipment();

  const espressoCount = equipment.filter((e) => e.type === 'espresso_machine').length;
  const grinderCount = equipment.filter((e) => e.type === 'grinder').length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Ekipman Envanteri"
        subtitle={loading ? 'Yükleniyor...' : `${espressoCount} espresso makinesi · ${grinderCount} öğütücü`}
      />

      <div className="flex-1 p-6">
        <div className="flex justify-end mb-4">
          <Link href="/inventory/new" className="btn-primary flex items-center gap-2">
            <Plus size={14} />
            Yeni Ekipman
          </Link>
        </div>
        <EquipmentTable equipment={equipment} />
      </div>
    </div>
  );
}
