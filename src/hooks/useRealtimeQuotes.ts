'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { mockQuotes } from '@/lib/mock';
import type { Quote } from '@/lib/types';

export function useRealtimeQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { fetchQuotes } = await import('@/lib/data/quotes');
      const data = await fetchQuotes();
      setQuotes(data);
    } catch {
      // keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const supabase = createClient();
    const channel = supabase
      .channel('quotes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { quotes, loading, refresh: load };
}
