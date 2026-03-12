'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { HealthBreakdown } from '@/lib/types';

interface FleetHealthRingProps {
  breakdown: HealthBreakdown;
}

const COLORS = {
  green: '#22c55e',
  yellow: '#f59e0b',
  red: '#ef4444',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { label: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-stone-300">{payload[0].payload.label}</p>
        <p className="text-stone-100 font-semibold">{payload[0].value} makine</p>
      </div>
    );
  }
  return null;
}

export default function FleetHealthRing({ breakdown }: FleetHealthRingProps) {
  const data = [
    { name: 'green', label: 'Sağlıklı', value: breakdown.green, color: COLORS.green },
    { name: 'yellow', label: 'Yakında Bakım', value: breakdown.yellow, color: COLORS.yellow },
    { name: 'red', label: 'Acil Bakım', value: breakdown.red, color: COLORS.red },
  ].filter((d) => d.value > 0);

  const healthPercent = Math.round((breakdown.green / breakdown.total) * 100);

  return (
    <div className="flex flex-col items-center">
      {/* Donut chart */}
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={68}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-display font-bold text-stone-100">
            {healthPercent}%
          </span>
          <span className="text-xs text-stone-500 -mt-0.5">Sağlıklı</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full mt-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-stone-400">Sağlıklı</span>
          </div>
          <span className="font-mono font-medium text-stone-200">{breakdown.green}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-stone-400">Yakında Bakım</span>
          </div>
          <span className="font-mono font-medium text-stone-200">{breakdown.yellow}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-stone-400">Acil Bakım</span>
          </div>
          <span className="font-mono font-medium text-stone-200">{breakdown.red}</span>
        </div>
      </div>

      <p className="text-xs text-stone-600 mt-3">{breakdown.total} makine toplam</p>
    </div>
  );
}
