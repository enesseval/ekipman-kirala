import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format kuruş (integer cents) to Turkish Lira string
 * e.g. 75000 → "750,00 ₺"
 */
export function formatCurrency(kuruş: number): string {
  const lira = kuruş / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(lira);
}

/**
 * Format kuruş to compact form: "7.500 ₺"
 */
export function formatCurrencyCompact(kuruş: number): string {
  const lira = kuruş / 100;
  if (lira >= 1_000_000) return `${(lira / 1_000_000).toFixed(1)}M ₺`;
  if (lira >= 1_000) return `${Math.round(lira / 1_000).toLocaleString('tr-TR')}B ₺`;
  return `${lira.toLocaleString('tr-TR')} ₺`;
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return n.toLocaleString('tr-TR');
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy', { locale: tr });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM', { locale: tr });
  } catch {
    return dateStr;
  }
}

export function formatDateRange(startStr: string, endStr: string): string {
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const days = differenceInDays(end, start) + 1;
    return `${format(start, 'd MMM', { locale: tr })} – ${format(end, 'd MMM yyyy', { locale: tr })} (${days} gün)`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
}

export function formatTimeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: tr });
  } catch {
    return dateStr;
  }
}

export function formatDuration(startStr: string, endStr: string): string {
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const days = differenceInDays(end, start) + 1;
    return `${days} gün`;
  } catch {
    return '-';
  }
}

export function getDurationDays(startStr: string, endStr: string): number {
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    return differenceInDays(end, start) + 1;
  } catch {
    return 1;
  }
}

// ─── Percentages ──────────────────────────────────────────────────────────────

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}
