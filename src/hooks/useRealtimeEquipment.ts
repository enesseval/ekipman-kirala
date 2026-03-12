'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { mockEquipment } from '@/lib/mock';
import type { Equipment } from '@/lib/types';

export function useRealtimeEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { fetchEquipment } = await import('@/lib/data/equipment');
      const data = await fetchEquipment();
      setEquipment(data);
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
      .channel('equipment-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment' },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { equipment, loading, refresh: load };
}
