import type { Quote, QuoteStatus } from '@/lib/types';
import { mockQuotes } from '@/lib/mock';

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const { dbGetQuotes } = await import('@/lib/supabase/queries/quotes');
    return await dbGetQuotes();
  } catch {
    return mockQuotes;
  }
}

export async function createQuote(
  input: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Quote> {
  const { dbCreateQuote } = await import('@/lib/supabase/queries/quotes');
  return dbCreateQuote(input);
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  const { dbUpdateQuoteStatus } = await import('@/lib/supabase/queries/quotes');
  return dbUpdateQuoteStatus(id, status);
}

export function getQuotes(): Quote[] {
  return mockQuotes;
}

export function getQuoteById(id: string): Quote | undefined {
  return mockQuotes.find((q) => q.id === id);
}

export function getQuotesByStatus(status: string): Quote[] {
  return mockQuotes.filter((q) => q.status === status);
}
