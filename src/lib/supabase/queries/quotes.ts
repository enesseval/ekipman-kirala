import { createClient } from '@/lib/supabase/client';
import type { Quote, QuoteLineItem, QuoteStatus } from '@/lib/types';

function mapLineItem(row: Record<string, unknown>): QuoteLineItem {
  return {
    id: row.id as string,
    equipmentId: row.equipment_id as string,
    equipmentName: row.equipment_name as string,
    equipmentType: row.equipment_type as QuoteLineItem['equipmentType'],
    days: row.days as number,
    dailyRate: row.daily_rate as number,
    subtotal: row.subtotal as number,
    notes: (row.notes as string) ?? '',
  };
}

function mapQuote(row: Record<string, unknown>, lineItems: QuoteLineItem[] = []): Quote {
  return {
    id: row.id as string,
    quoteNumber: row.quote_number as string,
    status: row.status as QuoteStatus,
    clientName: row.client_name as string,
    clientEmail: (row.client_email as string) ?? '',
    clientPhone: (row.client_phone as string) ?? '',
    eventId: (row.event_id as string) ?? null,
    lineItems,
    subtotal: row.subtotal as number,
    taxRate: row.tax_rate as number,
    taxAmount: row.tax_amount as number,
    discountAmount: row.discount_amount as number,
    total: row.total as number,
    validUntil: (row.valid_until as string) ?? '',
    notes: (row.notes as string) ?? '',
    generatedByAI: (row.generated_by_ai as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function dbGetQuotes(): Promise<Quote[]> {
  const supabase = createClient();
  const [{ data: qData, error }, { data: liData }] = await Promise.all([
    supabase.from('quotes').select('*').order('created_at', { ascending: false }),
    supabase.from('quote_line_items').select('*'),
  ]);
  if (error) throw error;

  const liByQuote: Record<string, QuoteLineItem[]> = {};
  for (const li of liData ?? []) {
    if (!liByQuote[li.quote_id]) liByQuote[li.quote_id] = [];
    liByQuote[li.quote_id].push(mapLineItem(li));
  }

  return (qData ?? []).map((row) => mapQuote(row, liByQuote[row.id] ?? []));
}

export async function dbCreateQuote(input: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
  const supabase = createClient();

  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true });
  const nextNum = String((count ?? 0) + 1).padStart(4, '0');
  const year = new Date().getFullYear();
  const id = `QT-${year}-${nextNum}`;

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      id,
      quote_number: id,
      status: input.status,
      client_name: input.clientName,
      client_email: input.clientEmail,
      client_phone: input.clientPhone,
      event_id: input.eventId,
      subtotal: input.subtotal,
      tax_rate: input.taxRate,
      tax_amount: input.taxAmount,
      discount_amount: input.discountAmount,
      total: input.total,
      valid_until: input.validUntil || null,
      notes: input.notes,
      generated_by_ai: input.generatedByAI,
    })
    .select()
    .single();
  if (error) throw error;

  // Insert line items
  if (input.lineItems.length > 0) {
    const liRows = input.lineItems.map((li) => ({
      quote_id: id,
      equipment_id: li.equipmentId,
      equipment_name: li.equipmentName,
      equipment_type: li.equipmentType,
      days: li.days,
      daily_rate: li.dailyRate,
      subtotal: li.subtotal,
      notes: li.notes,
    }));
    await supabase.from('quote_line_items').insert(liRows);
  }

  return mapQuote(data, input.lineItems);
}

export async function dbUpdateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}
