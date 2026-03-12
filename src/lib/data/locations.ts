import type { Location } from '@/lib/types';
import { mockLocations } from '@/lib/mock';

export async function fetchLocations(): Promise<Location[]> {
  try {
    const { dbGetLocations } = await import('@/lib/supabase/queries/locations');
    return await dbGetLocations();
  } catch {
    return mockLocations;
  }
}

export async function createLocation(
  input: Omit<Location, 'id' | 'createdAt' | 'equipmentIds'>
): Promise<Location> {
  const { dbCreateLocation } = await import('@/lib/supabase/queries/locations');
  return dbCreateLocation(input);
}

export function getLocations(): Location[] {
  return mockLocations;
}

export function getLocationById(id: string): Location | undefined {
  return mockLocations.find((l) => l.id === id);
}

export function getActiveLocations(): Location[] {
  return mockLocations.filter((l) => l.activeEventId !== null);
}

export function getLocationName(id: string | null): string {
  if (!id) return 'Depo';
  const loc = mockLocations.find((l) => l.id === id);
  return loc?.name ?? id;
}
