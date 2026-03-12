import type { MaintenanceRecord } from '@/lib/types';
import { mockMaintenanceRecords } from '@/lib/mock';
import { parseISO } from 'date-fns';

export async function fetchAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  try {
    const { dbGetAllMaintenanceRecords } = await import('@/lib/supabase/queries/maintenance');
    return await dbGetAllMaintenanceRecords();
  } catch {
    return [...mockMaintenanceRecords].sort(
      (a, b) => parseISO(b.performedAt).getTime() - parseISO(a.performedAt).getTime()
    );
  }
}

export async function fetchMaintenanceByEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
  try {
    const { dbGetMaintenanceByEquipment } = await import('@/lib/supabase/queries/maintenance');
    return await dbGetMaintenanceByEquipment(equipmentId);
  } catch {
    return mockMaintenanceRecords.filter((r) => r.equipmentId === equipmentId);
  }
}

export async function createMaintenanceRecord(
  input: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> {
  const { dbCreateMaintenanceRecord } = await import('@/lib/supabase/queries/maintenance');
  return dbCreateMaintenanceRecord(input);
}

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
