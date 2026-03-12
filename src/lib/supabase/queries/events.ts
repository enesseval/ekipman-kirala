import { createClient } from '@/lib/supabase/client';
import type { Event, EventType, EventStatus } from '@/lib/types';

function mapEvent(row: Record<string, unknown>, equipmentIds: string[] = []): Event {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as EventType,
    status: row.status as EventStatus,
    clientName: row.client_name as string,
    clientEmail: (row.client_email as string) ?? '',
    clientPhone: (row.client_phone as string) ?? '',
    locationId: (row.location_id as string) ?? null,
    venueName: row.venue_name as string,
    venueAddress: row.venue_address as string,
    startDate: row.start_date as string,
    endDate: (row.end_date as string) ?? null,
    expectedAttendees: row.expected_attendees as number,
    expectedCupsPerDay: row.expected_cups_per_day as number,
    equipmentIds,
    baristaCount: row.barista_count as number,
    quoteId: (row.quote_id as string) ?? null,
    notes: (row.notes as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function dbGetEvents(): Promise<Event[]> {
  const supabase = createClient();
  const [{ data: evtData, error }, { data: jData }] = await Promise.all([
    supabase.from('events').select('*').order('start_date'),
    supabase.from('event_equipment').select('event_id, equipment_id'),
  ]);
  if (error) throw error;

  const jMap: Record<string, string[]> = {};
  for (const j of jData ?? []) {
    if (!jMap[j.event_id]) jMap[j.event_id] = [];
    jMap[j.event_id].push(j.equipment_id);
  }

  return (evtData ?? []).map((row) => mapEvent(row, jMap[row.id] ?? []));
}

export async function dbGetEventById(id: string): Promise<Event | null> {
  const supabase = createClient();
  const [{ data, error }, { data: jData }] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase.from('event_equipment').select('equipment_id').eq('event_id', id),
  ]);
  if (error || !data) return null;
  return mapEvent(data, (jData ?? []).map((j: { equipment_id: string }) => j.equipment_id));
}

export async function dbGetUpcomingEvents(limit?: number): Promise<Event[]> {
  const supabase = createClient();
  let query = supabase
    .from('events')
    .select('*')
    .in('status', ['upcoming', 'active'])
    .order('start_date');
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapEvent(row));
}
