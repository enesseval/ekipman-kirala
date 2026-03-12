import { createClient } from '@/lib/supabase/client';
import type { MaintenanceRecord } from '@/lib/types';

function mapRecord(row: Record<string, unknown>): MaintenanceRecord {
  return {
    id: row.id as string,
    equipmentId: row.equipment_id as string,
    serviceType: row.service_type as MaintenanceRecord['serviceType'],
    performedBy: row.performed_by as string,
    performedAt: row.performed_at as string,
    cupsAtService: row.cups_at_service as number,
    description: row.description as string,
    cost: row.cost as number,
    nextServiceAt: row.next_service_at as number,
  };
}

export async function dbGetMaintenanceByEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('performed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRecord);
}

export async function dbCreateMaintenanceRecord(
  input: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> {
  const supabase = createClient();

  // Also reset cups_served_since_service for the machine
  const { data, error } = await supabase
    .from('maintenance_records')
    .insert({
      equipment_id: input.equipmentId,
      service_type: input.serviceType,
      performed_by: input.performedBy,
      performed_at: input.performedAt,
      cups_at_service: input.cupsAtService,
      description: input.description,
      cost: input.cost,
      next_service_at: input.nextServiceAt,
    })
    .select()
    .single();

  if (error) throw error;

  // Reset equipment health counter after service
  await supabase
    .from('equipment')
    .update({
      cups_served_since_service: 0,
      health_status: 'green',
      last_service_date: input.performedAt,
      status: 'available',
    })
    .eq('id', input.equipmentId);

  return mapRecord(data);
}
