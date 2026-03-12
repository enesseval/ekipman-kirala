'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { mockLocations } from '@/lib/mock';
import type { Location } from '@/lib/types';

export function useRealtimeLocations() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { fetchLocations } = await import('@/lib/data/locations');
      const data = await fetchLocations();
      setLocations(data);
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
      .channel('locations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations' },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { locations, loading, refresh: load };
}
