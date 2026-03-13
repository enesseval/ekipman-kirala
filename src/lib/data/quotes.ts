import type { Quote, QuoteStatus } from '@/lib/types';
import { mockQuotes } from '@/lib/mock';

const LS_KEY = 'brewops_quotes';

function lsGetQuotes(): Quote[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as Quote[];
  } catch {
    return [];
  }
}

function lsSaveQuotes(quotes: Quote[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(quotes));
}

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const { dbGetQuotes } = await import('@/lib/supabase/queries/quotes');
    return await dbGetQuotes();
  } catch {
    // Supabase unavailable — merge mock + localStorage quotes
    const local = lsGetQuotes();
    const mockIds = new Set(mockQuotes.map((q) => q.id));
    const newLocal = local.filter((q) => !mockIds.has(q.id));
    return [...newLocal, ...mockQuotes];
  }
}

export async function createQuote(
  input: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Quote> {
  try {
    const { dbCreateQuote } = await import('@/lib/supabase/queries/quotes');
    return await dbCreateQuote(input);
  } catch {
    // Supabase unavailable — save to localStorage
    const now = new Date().toISOString();
    const existing = lsGetQuotes();
    const id = `${input.quoteNumber}-${Date.now()}`;
    const quote: Quote = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };
    lsSaveQuotes([quote, ...existing]);
    return quote;
  }
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  try {
    const { dbUpdateQuoteStatus } = await import('@/lib/supabase/queries/quotes');
    return await dbUpdateQuoteStatus(id, status);
  } catch {
    // Supabase unavailable — update in localStorage
    const quotes = lsGetQuotes();
    const updated = quotes.map((q) =>
      q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q
    );
    lsSaveQuotes(updated);
  }
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
