'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { mockMaintenanceRecords } from '@/lib/mock';
import type { MaintenanceRecord } from '@/lib/types';

export function useRealtimeMaintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { fetchAllMaintenanceRecords } = await import('@/lib/data/maintenance');
      const data = await fetchAllMaintenanceRecords();
      setRecords(data);
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
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_records' },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { records, loading, refresh: load };
}
