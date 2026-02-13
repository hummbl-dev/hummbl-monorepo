/**
 * Budget Alerts
 *
 * Emits and manages budget alerts across configured channels.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  AlertEmitter,
  BudgetAlert,
  BudgetAlertConfig,
  AlertChannel,
  AlertLevel,
} from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ALERT_DIR = join(__dirname, '../../../../../_state/alerts');

/**
 * Format alert for display
 */
function formatAlert(alert: BudgetAlert): string {
  const timestamp = new Date(alert.timestamp).toISOString();
  const level = alert.level.toUpperCase().padEnd(9);
  return `[${timestamp}] [${level}] ${alert.message} (${alert.percent.toFixed(1)}%)`;
}

/**
 * Get alert level severity for comparison
 */
export function getAlertSeverity(level: AlertLevel): number {
  const severities: Record<AlertLevel, number> = {
    info: 1,
    warning: 2,
    critical: 3,
    emergency: 4,
  };
  return severities[level];
}

/**
 * Write alert to file
 */
async function writeToFile(alert: BudgetAlert, target: string): Promise<void> {
  try {
    const dir = target.endsWith('/') ? target : dirname(target);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    const filePath = target.endsWith('/')
      ? join(target, `alerts-${date}.log`)
      : target;

    const content = formatAlert(alert) + '\n';
    await writeFile(filePath, content, { flag: 'a' });
  } catch (error) {
    console.warn('Failed to write alert to file:', error);
  }
}

/**
 * Send alert to webhook
 */
async function sendToWebhook(alert: BudgetAlert, target: string): Promise<void> {
  try {
    await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: alert.level,
        message: alert.message,
        percent: alert.percent,
        timestamp: alert.timestamp,
      }),
    });
  } catch (error) {
    console.warn('Failed to send alert to webhook:', error);
  }
}

/**
 * Log alert to console
 */
function logToConsole(alert: BudgetAlert): void {
  const formatted = formatAlert(alert);

  switch (alert.level) {
    case 'emergency':
    case 'critical':
      console.error(formatted);
      break;
    case 'warning':
      console.warn(formatted);
      break;
    default:
      console.info(formatted);
  }
}

/**
 * Create an alert emitter
 */
export function createAlertEmitter(
  config: BudgetAlertConfig,
  alertDir = DEFAULT_ALERT_DIR
): AlertEmitter {
  const alerts: BudgetAlert[] = [];
  const lastEmitted = new Map<string, number>();

  /**
   * Check if alert is within cooldown period
   */
  function isInCooldown(alertKey: string): boolean {
    const lastTime = lastEmitted.get(alertKey);
    if (!lastTime) return false;

    const cooldownMs = config.cooldownMinutes * 60 * 1000;
    return Date.now() - lastTime < cooldownMs;
  }

  /**
   * Emit to a single channel
   */
  async function emitToChannel(alert: BudgetAlert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case 'file':
        await writeToFile(alert, channel.target ?? alertDir);
        break;
      case 'webhook':
        if (channel.target) {
          await sendToWebhook(alert, channel.target);
        }
        break;
      case 'console':
        logToConsole(alert);
        break;
    }
  }

  return {
    async emit(alert: BudgetAlert): Promise<void> {
      if (!config.enabled) return;

      // Generate cooldown key based on level
      const cooldownKey = `${alert.level}-${Math.floor(alert.percent / 5) * 5}`;

      if (isInCooldown(cooldownKey)) {
        return;
      }

      // Record emission time
      lastEmitted.set(cooldownKey, Date.now());

      // Store alert
      alerts.push(alert);

      // Emit to all channels
      await Promise.all(
        config.channels.map((channel) => emitToChannel(alert, channel))
      );
    },

    getAlerts(): BudgetAlert[] {
      return [...alerts];
    },

    acknowledge(alertId: string): void {
      const alert = alerts.find((a) => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
      }
    },

    clearAlerts(): void {
      alerts.length = 0;
      lastEmitted.clear();
    },
  };
}

/**
 * Check thresholds and emit appropriate alerts
 */
export async function checkAndEmitAlerts(
  emitter: AlertEmitter,
  currentPercent: number,
  config: BudgetAlertConfig
): Promise<void> {
  // Find applicable threshold
  for (const threshold of config.thresholds.sort((a, b) => b.percent - a.percent)) {
    if (currentPercent >= threshold.percent) {
      const alert: BudgetAlert = {
        id: `threshold-${threshold.percent}-${Date.now()}`,
        level: threshold.level,
        message: threshold.message,
        timestamp: Date.now(),
        percent: currentPercent,
        acknowledged: false,
      };

      await emitter.emit(alert);
      break; // Only emit highest applicable threshold
    }
  }
}

export type AlertEmitterInstance = ReturnType<typeof createAlertEmitter>;
