import type { MaintenanceRecord } from '@/lib/types';
import { mockMaintenanceRecords } from '@/lib/mock';
import { parseISO } from 'date-fns';

export function getMaintenanceRecords(): MaintenanceRecord[] {
  return mockMaintenanceRecords;
}

export function getMaintenanceByEquipment(equipmentId: string): MaintenanceRecord[] {
  return mockMaintenanceRecords
    .filter((r) => r.equipmentId === equipmentId)
    .sort((a, b) => parseISO(b.performedAt).getTime() - parseISO(a.performedAt).getTime());
}

export function getRecentMaintenance(limit = 5): MaintenanceRecord[] {
  return [...mockMaintenanceRecords]
    .sort((a, b) => parseISO(b.performedAt).getTime() - parseISO(a.performedAt).getTime())
    .slice(0, limit);
}
