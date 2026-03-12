import type { Event, EventStatus } from '@/lib/types';
import { mockEvents } from '@/lib/mock';
import { parseISO } from 'date-fns';

export function getEvents(): Event[] {
  return mockEvents;
}

export function getEventById(id: string): Event | undefined {
  return mockEvents.find((e) => e.id === id);
}

export function getEventsByStatus(status: EventStatus): Event[] {
  return mockEvents.filter((e) => e.status === status);
}

export function getUpcomingEvents(limit?: number): Event[] {
  const upcoming = mockEvents
    .filter((e) => e.status === 'upcoming' || e.status === 'active')
    .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function getActiveEvents(): Event[] {
  return mockEvents.filter((e) => e.status === 'active');
}
