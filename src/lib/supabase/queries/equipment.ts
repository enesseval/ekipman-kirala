import { createClient } from '@/lib/supabase/client';
import type { Equipment, EquipmentStatus, HealthStatus } from '@/lib/types';

// Map snake_case DB row → camelCase Equipment
function mapEquipment(row: Record<string, unknown>): Equipment {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Equipment['type'],
    brand: row.brand as string,
    model: row.model as string,
    serialNumber: row.serial_number as string,
    status: row.status as EquipmentStatus,
    healthStatus: row.health_status as HealthStatus,
    cupsServedSinceService: row.cups_served_since_service as number,
    cupsServiceThreshold: row.cups_service_threshold as number,
    totalCupsServed: row.total_cups_served as number,
    locationId: (row.location_id as string) ?? null,
    lastServiceDate: row.last_service_date as string,
    nextServiceDue: row.next_service_due as string,
    dailyRentalRate: row.daily_rental_rate as number,
    notes: (row.notes as string) ?? '',
    imageUrl: (row.image_url as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function dbGetEquipment(): Promise<Equipment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('id');
  if (error) throw error;
  return (data ?? []).map(mapEquipment);
}

export async function dbGetEquipmentById(id: string): Promise<Equipment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return mapEquipment(data);
}

export async function dbGetEquipmentByLocation(locationId: string): Promise<Equipment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('location_id', locationId)
    .order('id');
  if (error) throw error;
  return (data ?? []).map(mapEquipment);
}

export async function dbCreateEquipment(
  input: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Equipment> {
  const supabase = createClient();

  // Auto-generate ID based on type
  const prefix = input.type === 'espresso_machine' ? 'EM' : 'GR';
  const { count } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .like('id', `${prefix}-%`);
  const nextNum = String((count ?? 0) + 1).padStart(3, '0');
  const id = `${prefix}-${nextNum}`;

  const row = {
    id,
    name: `${input.brand} ${input.model}`,
    type: input.type,
    brand: input.brand,
    model: input.model,
    serial_number: input.serialNumber,
    status: input.status,
    health_status: input.healthStatus,
    cups_served_since_service: 0,
    cups_service_threshold: input.cupsServiceThreshold,
    total_cups_served: 0,
    location_id: input.locationId,
    last_service_date: new Date().toISOString().slice(0, 10),
    next_service_due: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    daily_rental_rate: input.dailyRentalRate,
    notes: input.notes ?? '',
    image_url: input.imageUrl,
  };

  const { data, error } = await supabase
    .from('equipment')
    .insert(row)
    .select()
    .single();
  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('serial_number')) {
        throw new Error('Bu seri numarası zaten kayıtlı. Lütfen farklı bir seri numarası girin.');
      }
      if (error.message.includes('equipment_pkey') || error.message.includes('_id_')) {
        throw new Error('ID çakışması oluştu. Lütfen tekrar deneyin.');
      }
    }
    throw new Error(error.message);
  }
  return mapEquipment(data);
}

export async function dbUpdateEquipmentStatus(
  id: string,
  status: EquipmentStatus
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('equipment')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}
