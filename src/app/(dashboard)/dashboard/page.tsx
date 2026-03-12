import {
  Package,
  Truck,
  PackageCheck,
  AlertTriangle,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/dashboard/StatCard';
import FleetHealthRing from '@/components/dashboard/FleetHealthRing';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { getDashboardStats } from '@/lib/data/dashboard';
import { getHealthBreakdown } from '@/lib/data/equipment';
import { getUpcomingEvents } from '@/lib/data/events';
import { mockActivity } from '@/lib/mock';
import { formatCurrencyCompact } from '@/lib/utils/format';

export default function DashboardPage() {
  const stats = getDashboardStats();
  const health = getHealthBreakdown();
  const upcomingEvents = getUpcomingEvents(6);
  const activity = mockActivity;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Dashboard"
        subtitle="12 Mart 2026, Çarşamba"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Toplam Ekipman"
            value={stats.totalEquipment}
            icon={Package}
            iconColor="text-stone-300"
            iconBg="bg-stone-700/30"
          />
          <StatCard
            label="Aktif Kiralama"
            value={stats.activeRentals}
            icon={Truck}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <StatCard
            label="Müsait"
            value={stats.availableEquipment}
            icon={PackageCheck}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <StatCard
            label="Bakım Gerekli"
            value={stats.maintenanceNeeded}
            icon={AlertTriangle}
            iconColor="text-red-400"
            iconBg="bg-red-500/10"
          />
          <StatCard
            label="Aktif Etkinlik"
            value={stats.upcomingEvents}
            icon={CalendarDays}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
          />
          <StatCard
            label="Aylık Gelir"
            value={formatCurrencyCompact(stats.monthlyRevenue)}
            delta={stats.revenueGrowth}
            icon={TrendingUp}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upcoming events */}
          <div className="xl:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
              <div>
                <h2 className="font-display font-semibold text-sm text-stone-100">
                  Yaklaşan & Aktif Etkinlikler
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {upcomingEvents.length} etkinlik takip ediliyor
                </p>
              </div>
              <a
                href="/events"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Tümünü gör →
              </a>
            </div>
            <div className="px-3 py-2">
              <UpcomingEvents events={upcomingEvents} />
            </div>
          </div>

          {/* Fleet health ring */}
          <div className="card p-5">
            <div className="mb-5">
              <h2 className="font-display font-semibold text-sm text-stone-100">
                Filo Sağlığı
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Bakım durumu özeti
              </p>
            </div>
            <FleetHealthRing breakdown={health} />

            {/* Quick actions */}
            <div className="mt-5 pt-4 border-t border-stone-800 space-y-2">
              <a
                href="/maintenance"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-soft" />
                  <span className="text-xs font-medium text-red-300">
                    {health.red} acil bakım var
                  </span>
                </div>
                <span className="text-xs text-red-400 group-hover:text-red-300 transition-colors">
                  Görüntüle →
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
            <div>
              <h2 className="font-display font-semibold text-sm text-stone-100">
                Son Aktiviteler
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Son 24 saat</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <RecentActivity items={activity} />
          </div>
        </div>
      </div>
    </div>
  );
}
