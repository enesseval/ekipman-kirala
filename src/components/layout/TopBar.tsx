'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-sm flex-shrink-0 sticky top-0 z-20">
      {/* Page title */}
      <div>
        <h1 className="font-display font-semibold text-base text-stone-100 tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200',
            searchFocused
              ? 'bg-stone-900 border-amber-500/40 w-56'
              : 'bg-stone-900/60 border-stone-800 w-36 hover:w-44 hover:border-stone-700'
          )}
        >
          <Search size={13} className="text-stone-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Ara..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-xs text-stone-300 placeholder-stone-600 outline-none w-full"
          />
          {!searchFocused && (
            <kbd className="text-[10px] text-stone-600 bg-stone-800 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-all">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 border border-stone-950" />
        </button>

        {/* Quick create */}
        <div className="flex items-center gap-px">
          <Link
            href="/quotes/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-xs font-medium bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
          >
            <Plus size={13} />
            Yeni Teklif
          </Link>
          <button className="flex items-center justify-center w-7 h-7 rounded-r-lg bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors border-l border-amber-600/50">
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </header>
  );
}
