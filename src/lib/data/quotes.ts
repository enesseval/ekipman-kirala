import type { Quote } from '@/lib/types';
import { mockQuotes } from '@/lib/mock';

export function getQuotes(): Quote[] {
  return mockQuotes;
}

export function getQuoteById(id: string): Quote | undefined {
  return mockQuotes.find((q) => q.id === id);
}

export function getQuotesByStatus(status: string): Quote[] {
  return mockQuotes.filter((q) => q.status === status);
}
