import type { DashboardStats } from '@/lib/types';
import { mockEquipment } from '@/lib/mock';
import { mockEvents } from '@/lib/mock';
import { mockQuotes } from '@/lib/mock';

export function getDashboardStats(): DashboardStats {
  const totalEquipment = mockEquipment.length;
  const activeRentals = mockEquipment.filter((e) => e.status === 'rented').length;
  const availableEquipment = mockEquipment.filter((e) => e.status === 'available').length;
  const maintenanceNeeded = mockEquipment.filter(
    (e) => e.healthStatus === 'red' || e.status === 'maintenance'
  ).length;
  const upcomingEvents = mockEvents.filter(
    (e) => e.status === 'upcoming' || e.status === 'active'
  ).length;

  // Calculate monthly revenue from accepted quotes this month
  const monthlyRevenue = mockQuotes
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + q.total, 0);

  return {
    totalEquipment,
    activeRentals,
    availableEquipment,
    maintenanceNeeded,
    upcomingEvents,
    monthlyRevenue,
    revenueGrowth: 12.4, // Mock growth percentage
  };
}
