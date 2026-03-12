// ─── Enums ────────────────────────────────────────────────────────────────────

export type EquipmentType = 'espresso_machine' | 'grinder';
export type EquipmentStatus = 'available' | 'rented' | 'maintenance';
export type HealthStatus = 'green' | 'yellow' | 'red';
export type EventType = 'cafe' | 'festival' | 'wedding' | 'corporate' | 'other';
export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type MaintenanceServiceType = 'routine' | 'repair' | 'deep_clean' | 'part_replacement';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  healthStatus: HealthStatus;
  cupsServedSinceService: number;
  cupsServiceThreshold: number;
  totalCupsServed: number;
  locationId: string | null;
  lastServiceDate: string;
  nextServiceDue: string;
  dailyRentalRate: number; // in kuruş (cents)
  notes: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  venueType: EventType;
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  equipmentIds: string[];
  activeEventId: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  status: EventStatus;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  locationId: string | null;
  venueName: string;
  venueAddress: string;
  startDate: string;
  endDate: string;
  expectedAttendees: number;
  expectedCupsPerDay: number;
  equipmentIds: string[];
  baristaCount: number;
  quoteId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  serviceType: MaintenanceServiceType;
  performedBy: string;
  performedAt: string;
  cupsAtService: number;
  description: string;
  cost: number; // kuruş
  nextServiceAt: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventId: string | null;
  lineItems: QuoteLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  validUntil: string;
  notes: string;
  generatedByAI: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  days: number;
  dailyRate: number;
  subtotal: number;
  notes: string;
}

// ─── UI / View Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalEquipment: number;
  activeRentals: number;
  availableEquipment: number;
  maintenanceNeeded: number;
  upcomingEvents: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

export interface HealthBreakdown {
  green: number;
  yellow: number;
  red: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  type:
    | 'equipment_rented'
    | 'equipment_returned'
    | 'maintenance_done'
    | 'quote_sent'
    | 'event_created'
    | 'event_completed';
  description: string;
  entityId: string;
  entityName: string;
  timestamp: string;
}

// ─── AI Types (Phase 3 ready) ─────────────────────────────────────────────────

export interface AIEventInput {
  eventType: EventType;
  expectedAttendees: number;
  durationDays: number;
  expectedCupsPerDay: number;
  preferenceNotes: string;
  budget: number | null;
}

export interface AIRecommendation {
  recommendedMachineCount: number;
  recommendedGrinderCount: number;
  recommendedBaristaCount: number;
  recommendedMachineIds: string[];
  recommendedGrinderIds: string[];
  reasoning: string;
  estimatedTotalCost: number;
  setupNotes: string;
}
