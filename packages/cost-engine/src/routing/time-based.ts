/**
 * Time-Based Routing
 *
 * Routes requests to different models based on time of day.
 */

import type { TimeBasedRoutingConfig } from '../types.js';

interface TimeRoutingResult {
  model: string;
  period: 'peak' | 'off-peak' | 'weekend' | 'standard';
  reason: string;
}

/**
 * Get current hour in specified timezone
 */
export function getCurrentHour(timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const hour = parseInt(formatter.format(new Date()), 10);
    return hour;
  } catch {
    // Fallback to UTC
    return new Date().getUTCHours();
  }
}

/**
 * Check if current time is weekend
 */
export function isWeekend(timezone: string): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    });
    const day = formatter.format(new Date());
    return day === 'Sat' || day === 'Sun';
  } catch {
    // Fallback to UTC
    const day = new Date().getUTCDay();
    return day === 0 || day === 6;
  }
}

/**
 * Check if hour is within range (handles overnight ranges)
 */
function isInRange(hour: number, start: number, end: number): boolean {
  if (start <= end) {
    // Normal range (e.g., 9-17)
    return hour >= start && hour < end;
  } else {
    // Overnight range (e.g., 22-6)
    return hour >= start || hour < end;
  }
}

/**
 * Determine model based on time
 */
export function routeByTime(
  config: TimeBasedRoutingConfig,
  currentTime?: Date
): TimeRoutingResult {
  if (!config.enabled) {
    return {
      model: config.peakModel, // Default to peak model when disabled
      period: 'standard',
      reason: 'Time-based routing disabled',
    };
  }

  const hour = currentTime
    ? currentTime.getHours()
    : getCurrentHour(config.timezone);

  // Check weekend first
  const weekend = currentTime
    ? (currentTime.getDay() === 0 || currentTime.getDay() === 6)
    : isWeekend(config.timezone);

  if (weekend) {
    return {
      model: config.weekendModel,
      period: 'weekend',
      reason: `Weekend hours - using ${config.weekendModel}`,
    };
  }

  // Check off-peak hours
  if (isInRange(hour, config.offPeakHours.start, config.offPeakHours.end)) {
    return {
      model: config.offPeakModel,
      period: 'off-peak',
      reason: `Off-peak hours (${config.offPeakHours.start}:00-${config.offPeakHours.end}:00) - using ${config.offPeakModel}`,
    };
  }

  // Check peak hours
  if (isInRange(hour, config.peakHours.start, config.peakHours.end)) {
    return {
      model: config.peakModel,
      period: 'peak',
      reason: `Peak hours (${config.peakHours.start}:00-${config.peakHours.end}:00) - using ${config.peakModel}`,
    };
  }

  // Standard hours (between peak and off-peak)
  return {
    model: config.peakModel,
    period: 'standard',
    reason: `Standard hours - using ${config.peakModel}`,
  };
}

/**
 * Create a time-based router
 */
export function createTimeBasedRouter(config: TimeBasedRoutingConfig) {
  return {
    /**
     * Get model based on current time
     */
    route(currentTime?: Date): TimeRoutingResult {
      return routeByTime(config, currentTime);
    },

    /**
     * Check if currently in peak hours
     */
    isPeakHours(currentTime?: Date): boolean {
      const result = routeByTime(config, currentTime);
      return result.period === 'peak';
    },

    /**
     * Check if currently in off-peak hours
     */
    isOffPeakHours(currentTime?: Date): boolean {
      const result = routeByTime(config, currentTime);
      return result.period === 'off-peak';
    },

    /**
     * Get next period change time
     */
    getNextPeriodChange(): Date {
      const now = new Date();
      const hour = getCurrentHour(config.timezone);

      // Find next boundary
      const boundaries = [
        config.peakHours.start,
        config.peakHours.end,
        config.offPeakHours.start,
        config.offPeakHours.end,
      ].sort((a, b) => a - b);

      for (const boundary of boundaries) {
        if (boundary > hour) {
          const next = new Date(now);
          next.setHours(boundary, 0, 0, 0);
          return next;
        }
      }

      // Next day, first boundary
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(boundaries[0], 0, 0, 0);
      return next;
    },
  };
}

export type TimeBasedRouter = ReturnType<typeof createTimeBasedRouter>;
