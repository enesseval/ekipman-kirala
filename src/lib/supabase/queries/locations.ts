import { createClient } from '@/lib/supabase/client';
import type { Location, EventType } from '@/lib/types';

function mapLocation(row: Record<string, unknown>): Location {
  return {
    id: row.id as string,
    name: row.name as string,
    venueType: row.venue_type as EventType,
    address: row.address as string,
    city: row.city as string,
    country: (row.country as string) ?? 'TR',
    lat: (row.lat as number) ?? null,
    lng: (row.lng as number) ?? null,
    contactName: row.contact_name as string,
    contactEmail: (row.contact_email as string) ?? '',
    contactPhone: (row.contact_phone as string) ?? '',
    equipmentIds: [],           // loaded separately via equipment table
    activeEventId: (row.active_event_id as string) ?? null,
    startDate: (row.start_date as string) ?? null,
    endDate: (row.end_date as string) ?? null,
    notes: (row.notes as string) ?? '',
    createdAt: row.created_at as string,
  };
}

export async function dbGetLocations(): Promise<Location[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('id');
  if (error) throw error;

  const locations = (data ?? []).map(mapLocation);

  // Populate equipmentIds from equipment table
  const { data: eqData } = await supabase
    .from('equipment')
    .select('id, location_id')
    .not('location_id', 'is', null);

  const eqByLocation: Record<string, string[]> = {};
  for (const eq of eqData ?? []) {
    if (!eqByLocation[eq.location_id]) eqByLocation[eq.location_id] = [];
    eqByLocation[eq.location_id].push(eq.id);
  }

  return locations.map((loc) => ({
    ...loc,
    equipmentIds: eqByLocation[loc.id] ?? [],
  }));
}

export async function dbCreateLocation(
  input: Omit<Location, 'id' | 'createdAt' | 'equipmentIds'>
): Promise<Location> {
  const supabase = createClient();

  const prefix = 'LOC';
  const { count } = await supabase
    .from('locations')
    .select('*', { count: 'exact', head: true });
  const nextNum = String((count ?? 0) + 1).padStart(3, '0');
  const id = `${prefix}-${nextNum}`;

  const row = {
    id,
    name: input.name,
    venue_type: input.venueType,
    address: input.address,
    city: input.city,
    country: input.country,
    lat: input.lat,
    lng: input.lng,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone,
    active_event_id: input.activeEventId,
    start_date: input.startDate,
    end_date: input.endDate,
    notes: input.notes,
  };

  const { data, error } = await supabase
    .from('locations')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return { ...mapLocation(data), equipmentIds: [] };
}
