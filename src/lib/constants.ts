// ─── Maintenance Thresholds ───────────────────────────────────────────────────

export const ESPRESSO_SERVICE_THRESHOLD = 5000; // cups between services
export const GRINDER_SERVICE_THRESHOLD = 10000; // cups between services

export const HEALTH_YELLOW_THRESHOLD = 0.70; // 70% of threshold → yellow
export const HEALTH_RED_THRESHOLD = 0.90;    // 90% of threshold → red

// ─── Pricing Defaults (in kuruş — TL × 100) ──────────────────────────────────

export const DEFAULT_ESPRESSO_DAILY_RATE = 75000;   // 750 ₺/gün
export const DEFAULT_GRINDER_DAILY_RATE = 35000;    // 350 ₺/gün
export const DEFAULT_TAX_RATE = 0.20;               // KDV %20

// ─── Event Planning Rules ─────────────────────────────────────────────────────

// Machines per attendee ratios (how many attendees per machine)
export const FESTIVAL_ATTENDEES_PER_MACHINE = 250;
export const CORPORATE_ATTENDEES_PER_MACHINE = 120;
export const WEDDING_ATTENDEES_PER_MACHINE = 90;
export const CAFE_MACHINES_BASE = 1;

// Grinder to espresso machine ratio
export const GRINDER_TO_MACHINE_RATIO = 2; // 2 grinders per espresso machine

// Barista per machine
export const BARISTAS_PER_MACHINE = 1.5; // avg 1.5 baristas per machine

// ─── UI Constants ─────────────────────────────────────────────────────────────

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const TOPBAR_HEIGHT = 56;

// ─── Status Labels (Turkish) ──────────────────────────────────────────────────

export const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  available: 'Müsait',
  rented: 'Kirada',
  maintenance: 'Bakımda',
};

export const HEALTH_STATUS_LABELS: Record<string, string> = {
  green: 'Sağlıklı',
  yellow: 'Yakında Bakım',
  red: 'Acil Bakım',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  cafe: 'Kafe',
  festival: 'Festival',
  wedding: 'Düğün',
  corporate: 'Kurumsal',
  other: 'Diğer',
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Yaklaşan',
  active: 'Aktif',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  sent: 'Gönderildi',
  accepted: 'Onaylandı',
  rejected: 'Reddedildi',
  expired: 'Süresi Doldu',
};

export const MAINTENANCE_SERVICE_LABELS: Record<string, string> = {
  routine: 'Rutin Bakım',
  repair: 'Onarım',
  deep_clean: 'Derin Temizlik',
  part_replacement: 'Parça Değişimi',
};
