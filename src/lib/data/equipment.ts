import type { Equipment, EquipmentStatus, EquipmentType, HealthBreakdown } from '@/lib/types';
import { mockEquipment } from '@/lib/mock';

export function getEquipment(): Equipment[] {
  return mockEquipment;
}

export function getEquipmentById(id: string): Equipment | undefined {
  return mockEquipment.find((e) => e.id === id);
}

export function getEquipmentByIds(ids: string[]): Equipment[] {
  return mockEquipment.filter((e) => ids.includes(e.id));
}

export function getEquipmentByType(type: EquipmentType): Equipment[] {
  return mockEquipment.filter((e) => e.type === type);
}

export function getEquipmentByStatus(status: EquipmentStatus): Equipment[] {
  return mockEquipment.filter((e) => e.status === status);
}

export function getEquipmentAtLocation(locationId: string): Equipment[] {
  return mockEquipment.filter((e) => e.locationId === locationId);
}

export function getAvailableEquipment(): Equipment[] {
  return mockEquipment.filter((e) => e.status === 'available');
}

export function getAvailableEspressoMachines(): Equipment[] {
  return mockEquipment.filter(
    (e) => e.type === 'espresso_machine' && e.status === 'available'
  );
}

export function getAvailableGrinders(): Equipment[] {
  return mockEquipment.filter(
    (e) => e.type === 'grinder' && e.status === 'available'
  );
}

export function getHealthBreakdown(): HealthBreakdown {
  const all = mockEquipment;
  return {
    green: all.filter((e) => e.healthStatus === 'green').length,
    yellow: all.filter((e) => e.healthStatus === 'yellow').length,
    red: all.filter((e) => e.healthStatus === 'red').length,
    total: all.length,
  };
}

export function getMaintenanceAlerts(): Equipment[] {
  return mockEquipment.filter((e) => e.healthStatus === 'red');
}

export function filterEquipment(params: {
  search?: string;
  type?: EquipmentType | 'all';
  status?: EquipmentStatus | 'all';
}): Equipment[] {
  let results = mockEquipment;

  if (params.type && params.type !== 'all') {
    results = results.filter((e) => e.type === params.type);
  }

  if (params.status && params.status !== 'all') {
    results = results.filter((e) => e.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.brand.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.serialNumber.toLowerCase().includes(q)
    );
  }

  return results;
}
