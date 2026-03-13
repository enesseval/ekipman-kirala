'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Wrench,
  CalendarDays,
  FileText,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Settings,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Genel Bakış',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Ekipman',
    items: [
      { label: 'Envanter', href: '/inventory', icon: Package },
      { label: 'Konumlar', href: '/locations', icon: MapPin },
      { label: 'Bakım', href: '/maintenance', icon: Wrench },
    ],
  },
  {
    title: 'Operasyon',
    items: [
      { label: 'Etkinlikler', href: '/events', icon: CalendarDays },
      { label: 'Teklifler', href: '/quotes', icon: FileText },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-stone-950 border-r border-stone-800/80',
        'transition-all duration-300 ease-in-out flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-stone-800/80 px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 transition-all duration-300',
            collapsed ? 'w-8' : ''
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Coffee size={16} className="text-amber-400" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-display font-700 text-sm tracking-tight text-stone-100">
                BrewOps
              </span>
              <span className="block text-[10px] text-stone-500 -mt-0.5 font-mono">
                v1.0.0 — Demo
              </span>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="w-6 h-6 rounded-md flex items-center justify-center text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-all"
            aria-label="Kenar çubuğunu daralt"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-stone-600 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                        collapsed ? 'w-10 h-10 mx-auto justify-center' : 'px-3 py-2',
                        active
                          ? 'bg-stone-800 text-stone-100 border border-stone-700/60'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                      )}
                    >
                      <Icon
                        size={16}
                        className={cn(
                          'flex-shrink-0',
                          active ? 'text-amber-400' : ''
                        )}
                      />
                      {!collapsed && (
                        <span>{item.label}</span>
                      )}
                      {active && !collapsed && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-stone-800/80 p-2 space-y-1">
        {collapsed ? (
          <button
            onClick={onToggle}
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-all"
            aria-label="Kenar çubuğunu genişlet"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <>
            
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-300 hover:bg-stone-800/50 transition-all"
            >
              <Settings size={16} />
              <span>Ayarlar</span>
            </Link>
          </>
        )}
      </div>

      {/* User */}
      {!collapsed && (
        <div className="border-t border-stone-800/80 p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-amber-400">AY</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-200 truncate">Ahmet Yılmaz</p>
              <p className="text-xs text-stone-500 truncate">Admin</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
