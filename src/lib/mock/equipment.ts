import type { Equipment } from '@/lib/types';
import { getHealthStatus } from '@/lib/utils/health';

// ─── Brand/Model Definitions ──────────────────────────────────────────────────

const ESPRESSO_SPECS = [
  { brand: 'La Marzocco', model: 'Linea PB', rate: 85000 },
  { brand: 'La Marzocco', model: 'GB5', rate: 95000 },
  { brand: 'La Marzocco', model: 'Strada', rate: 100000 },
  { brand: 'Nuova Simonelli', model: 'Appia Life', rate: 65000 },
  { brand: 'Nuova Simonelli', model: 'Aurelia Wave', rate: 80000 },
  { brand: 'Victoria Arduino', model: 'White Eagle', rate: 90000 },
  { brand: 'Victoria Arduino', model: 'Black Eagle', rate: 95000 },
  { brand: 'Slayer', model: 'Single Group', rate: 90000 },
  { brand: 'Synesso', model: 'MVP Hydra', rate: 85000 },
  { brand: 'Rocket Espresso', model: 'R9 V2', rate: 70000 },
];

const GRINDER_SPECS = [
  { brand: 'Mahlkönig', model: 'EK43 S', rate: 40000 },
  { brand: 'Mahlkönig', model: 'Tanzania', rate: 35000 },
  { brand: 'Mahlkönig', model: 'Peak', rate: 45000 },
  { brand: 'Eureka', model: 'Zenith 65', rate: 30000 },
  { brand: 'Mazzer', model: 'Major V', rate: 32000 },
  { brand: 'Mazzer', model: 'Kony S', rate: 28000 },
  { brand: 'Baratza', model: 'Forte BG', rate: 25000 },
  { brand: 'Weber Workshops', model: 'EG-1', rate: 45000 },
];

// ─── Deterministic Data Generation ───────────────────────────────────────────

// Health ratio patterns: creates a realistic distribution across indices
// ~65% green, ~25% yellow, ~10% red
const HEALTH_RATIOS = [
  0.12, 0.28, 0.45, 0.55, 0.18, // green
  0.62, 0.35, 0.50, 0.40, 0.22, // green
  0.72, 0.78, 0.74, 0.15, 0.60, // yellow, green
  0.82, 0.76, 0.30, 0.55, 0.68, // yellow, green
  0.92, 0.88, 0.38, 0.48, 0.58, // red, yellow, green
];

// Location assignments — where each machine is
// null = warehouse, otherwise location ID
const ESPRESSO_LOCATION_MAP: (string | null)[] = [
  'LOC-003', 'LOC-003', 'LOC-003', // Startup Istanbul festival (3 espresso)
  'LOC-004', 'LOC-004',             // Cafe Noir Nişantaşı (2 espresso)
  'LOC-005', 'LOC-005',             // Mandarin Oriental Wedding (2 espresso)
  'LOC-006',                         // Microsoft Turkey (1 espresso)
  'LOC-007', 'LOC-007', 'LOC-007', 'LOC-007', // İzmir Coffee Festival (4 espresso)
  'LOC-008', 'LOC-008',             // Beşiktaş Wedding (2 espresso)
  'LOC-009',                         // Google Turkey (1 espresso)
  'LOC-010',                         // Apple Turkey (1 espresso)
  'LOC-011',                         // Arnavutköy Wedding (1 espresso)
  null, null, null, null, null,      // Warehouse (available)
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null,
];

const GRINDER_LOCATION_MAP: (string | null)[] = [
  'LOC-003', 'LOC-003', 'LOC-003', 'LOC-003', 'LOC-003', // festival (5 grinders)
  'LOC-004', 'LOC-004',             // cafe (2 grinders)
  'LOC-005', 'LOC-005', 'LOC-005', 'LOC-005', // wedding (4)
  'LOC-006', 'LOC-006', 'LOC-006', // Microsoft (3)
  'LOC-007', 'LOC-007', 'LOC-007', 'LOC-007', 'LOC-007', 'LOC-007', // İzmir (6)
  'LOC-008', 'LOC-008',             // Wedding (2)
  'LOC-009', 'LOC-009', 'LOC-009', // Google (3)
  'LOC-010', 'LOC-010',             // Apple (2)
  'LOC-011', 'LOC-011',             // Wedding (2)
  'LOC-012',                         // İstanbul Coffee Week (1)
  null, null, null, null, null,      // Warehouse
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null,
];

// Status map: maintenance machines (indices that are in maintenance)
const ESPRESSO_MAINTENANCE_INDICES = [3, 9, 14, 22, 28];
const GRINDER_MAINTENANCE_INDICES = [4, 11, 18, 25, 32, 39, 46, 53, 60, 67];

const BASE_DATES = [
  '2023-01-10', '2023-02-15', '2023-03-20', '2023-04-05', '2023-05-12',
  '2023-06-18', '2023-07-22', '2023-08-30', '2023-09-14', '2023-10-25',
];

const LAST_SERVICE_DATES = [
  '2025-08-15', '2025-09-20', '2025-10-05', '2025-11-12', '2025-12-01',
  '2026-01-08', '2026-01-22', '2026-02-05', '2026-02-18', '2026-03-01',
];

function generateEspressoMachines(): Equipment[] {
  return Array.from({ length: 50 }, (_, i) => {
    const num = i + 1;
    const id = `EM-${String(num).padStart(3, '0')}`;
    const spec = ESPRESSO_SPECS[i % ESPRESSO_SPECS.length];
    const threshold = 5000;
    const ratio = HEALTH_RATIOS[i % HEALTH_RATIOS.length];
    const cupsServedSinceService = Math.round(ratio * threshold);
    const healthStatus = getHealthStatus(cupsServedSinceService, threshold);
    const locationId = ESPRESSO_LOCATION_MAP[i] ?? null;
    const isInMaintenance = ESPRESSO_MAINTENANCE_INDICES.includes(i);
    const lastServiceDate = LAST_SERVICE_DATES[i % LAST_SERVICE_DATES.length];
    const totalCups = 8000 + i * 1200 + Math.round(ratio * 3000);

    const status = isInMaintenance ? 'maintenance' : locationId ? 'rented' : 'available';

    return {
      id,
      name: `${spec.brand} ${spec.model} #${num}`,
      type: 'espresso_machine',
      brand: spec.brand,
      model: spec.model,
      serialNumber: `${spec.brand.substring(0, 2).toUpperCase()}-${spec.model.replace(/\s/g, '').substring(0, 3).toUpperCase()}-${String(num).padStart(5, '0')}`,
      status,
      healthStatus: isInMaintenance ? 'red' : healthStatus,
      cupsServedSinceService,
      cupsServiceThreshold: threshold,
      totalCupsServed: totalCups,
      locationId: isInMaintenance ? null : locationId,
      lastServiceDate,
      nextServiceDue: '2026-06-15',
      dailyRentalRate: spec.rate,
      notes: isInMaintenance ? 'Bakım sürecinde' : '',
      imageUrl: null,
      createdAt: `${BASE_DATES[i % BASE_DATES.length]}T08:00:00Z`,
      updatedAt: '2026-03-01T10:00:00Z',
    };
  });
}

function generateGrinders(): Equipment[] {
  return Array.from({ length: 100 }, (_, i) => {
    const num = i + 1;
    const id = `GR-${String(num).padStart(3, '0')}`;
    const spec = GRINDER_SPECS[i % GRINDER_SPECS.length];
    const threshold = 10000;
    const ratio = HEALTH_RATIOS[(i + 3) % HEALTH_RATIOS.length]; // offset for variety
    const cupsServedSinceService = Math.round(ratio * threshold);
    const healthStatus = getHealthStatus(cupsServedSinceService, threshold);
    const locationId = GRINDER_LOCATION_MAP[i] ?? null;
    const isInMaintenance = GRINDER_MAINTENANCE_INDICES.includes(i);
    const lastServiceDate = LAST_SERVICE_DATES[(i + 2) % LAST_SERVICE_DATES.length];
    const totalCups = 15000 + i * 800 + Math.round(ratio * 5000);

    const status = isInMaintenance ? 'maintenance' : locationId ? 'rented' : 'available';

    return {
      id,
      name: `${spec.brand} ${spec.model} #${num}`,
      type: 'grinder',
      brand: spec.brand,
      model: spec.model,
      serialNumber: `GR-${spec.brand.substring(0, 2).toUpperCase()}-${spec.model.replace(/\s/g, '').substring(0, 3).toUpperCase()}-${String(num).padStart(5, '0')}`,
      status,
      healthStatus: isInMaintenance ? 'red' : healthStatus,
      cupsServedSinceService,
      cupsServiceThreshold: threshold,
      totalCupsServed: totalCups,
      locationId: isInMaintenance ? null : locationId,
      lastServiceDate,
      nextServiceDue: '2026-07-01',
      dailyRentalRate: spec.rate,
      notes: isInMaintenance ? 'Bakım sürecinde' : '',
      imageUrl: null,
      createdAt: `${BASE_DATES[(i + 1) % BASE_DATES.length]}T09:00:00Z`,
      updatedAt: '2026-03-01T10:00:00Z',
    };
  });
}

export const mockEquipment: Equipment[] = [
  ...generateEspressoMachines(),
  ...generateGrinders(),
];
