'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface HealthStatusBarProps {
  cupsServed: number;
  threshold: number;
}

export default function HealthStatusBar({ cupsServed, threshold }: HealthStatusBarProps) {
  const [mounted, setMounted] = useState(false);
  const ratio = cupsServed / threshold;
  const percent = Math.min(100, Math.round(ratio * 100));

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const color =
    ratio >= 0.9
      ? 'bg-red-500'
      : ratio >= 0.7
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-500">Kullanım</span>
        <span
          className={cn(
            'font-mono font-semibold',
            ratio >= 0.9 ? 'text-red-400' : ratio >= 0.7 ? 'text-amber-400' : 'text-emerald-400'
          )}
        >
          {percent}%
        </span>
      </div>
      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', color)}
          style={{ width: mounted ? `${percent}%` : '0%' }}
        />
      </div>
      {/* Zone markers */}
      <div className="relative h-1 -mt-0.5">
        <div
          className="absolute top-0 w-px h-2 bg-amber-500/40"
          style={{ left: '70%' }}
          title="Uyarı eşiği"
        />
        <div
          className="absolute top-0 w-px h-2 bg-red-500/40"
          style={{ left: '90%' }}
          title="Acil bakım eşiği"
        />
      </div>
    </div>
  );
}
