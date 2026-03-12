import type { Location } from '@/lib/types';
import { mockLocations } from '@/lib/mock';

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
