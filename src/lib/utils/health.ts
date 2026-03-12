import type { HealthStatus } from '@/lib/types';
import {
  HEALTH_YELLOW_THRESHOLD,
  HEALTH_RED_THRESHOLD,
} from '@/lib/constants';

/**
 * Calculate health status from cups served vs threshold
 */
export function getHealthStatus(
  cupsServedSinceService: number,
  cupsServiceThreshold: number
): HealthStatus {
  const ratio = cupsServedSinceService / cupsServiceThreshold;
  if (ratio >= HEALTH_RED_THRESHOLD) return 'red';
  if (ratio >= HEALTH_YELLOW_THRESHOLD) return 'yellow';
  return 'green';
}

/**
 * Get the ratio as a percentage (0-100)
 */
export function getHealthPercent(
  cupsServedSinceService: number,
  cupsServiceThreshold: number
): number {
  return Math.min(100, Math.round((cupsServedSinceService / cupsServiceThreshold) * 100));
}

/**
 * Get cups remaining before next service
 */
export function getCupsRemaining(
  cupsServedSinceService: number,
  cupsServiceThreshold: number
): number {
  return Math.max(0, cupsServiceThreshold - cupsServedSinceService);
}

/**
 * Get human-readable health label in Turkish
 */
export function getHealthLabel(status: HealthStatus): string {
  switch (status) {
    case 'green': return 'Sağlıklı';
    case 'yellow': return 'Yakında Bakım';
    case 'red': return 'Acil Bakım';
  }
}

/**
 * Get Tailwind color classes for a health status
 */
export function getHealthColorClasses(status: HealthStatus): {
  text: string;
  bg: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'green':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'yellow':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'red':
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
      };
  }
}
