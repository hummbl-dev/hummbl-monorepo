/**
 * Enhanced Error Alerting System
 * Provides comprehensive alerting, notifications, and escalation procedures
 */

import { createLogger } from '@hummbl/core';

const logger = createLogger('alerting');

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum AlertChannel {
  CONSOLE = 'console',
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms',
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  channels: AlertChannel[];
  enabled: boolean;
  cooldownMinutes: number;
  escalationRules?: EscalationRule[];
}

export interface AlertCondition {
  type: 'error_rate' | 'error_count' | 'specific_error' | 'performance' | 'health_check';
  threshold: number;
  timeWindowMinutes: number;
  filters?: {
    category?: string;
    severity?: string;
    endpoint?: string;
    userId?: string;
    tags?: Record<string, string>;
  };
}

export interface EscalationRule {
  delayMinutes: number;
  channels: AlertChannel[];
  contacts?: string[];
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  data: Record<string, unknown>;
  status: 'active' | 'resolved' | 'escalated';
  escalationLevel: number;
  lastNotified?: string;
}

class AlertingSystem {
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, AlertInstance> = new Map();
  private alertHistory: AlertInstance[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Add or update an alert rule
   */
  addRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    logger.info('Alert rule added', { ruleId: rule.id, ruleName: rule.name });
  }

  /**
   * Check all alert conditions and trigger alerts as needed
   */
  async checkAlerts(errorStats: ErrorStats): Promise<void> {
    for (const [ruleId, rule] of this.alertRules) {
      if (!rule.enabled) continue;

      try {
        const shouldAlert = this.evaluateCondition(rule.condition, errorStats);
        const existingAlert = this.getActiveAlert(ruleId);

        if (shouldAlert && !this.isInCooldown(rule, existingAlert)) {
          await this.triggerAlert(rule, errorStats);
        } else if (!shouldAlert && existingAlert) {
          await this.resolveAlert(existingAlert);
        }

        // Check for escalation
        if (existingAlert && this.shouldEscalate(rule, existingAlert)) {
          await this.escalateAlert(existingAlert, rule);
        }
      } catch (error) {
        logger.error('Error checking alert rule', {
          ruleId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Manually trigger an alert
   */
  async triggerManualAlert(
    title: string,
    message: string,
    severity: AlertSeverity,
    channels: AlertChannel[] = [AlertChannel.CONSOLE],
    data: Record<string, unknown> = {}
  ): Promise<string> {
    const alert: AlertInstance = {
      id: this.generateAlertId(),
      ruleId: 'manual',
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      data,
      status: 'active',
      escalationLevel: 0,
    };

    this.activeAlerts.set(alert.id, alert);
    await this.sendNotifications(alert, channels);

    return alert.id;
  }

  /**
   * Get current alert status
   */
  getAlertStatus(): {
    activeAlerts: number;
    criticalAlerts: number;
    recentAlerts: AlertInstance[];
  } {
    const activeAlerts = Array.from(this.activeAlerts.values());

    return {
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
      recentAlerts: this.alertHistory
        .slice(-10)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
  }

  private initializeDefaultRules(): void {
    // High error rate alert
    this.addRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      description: 'Triggered when error rate exceeds 10% over 5 minutes',
      condition: {
        type: 'error_rate',
        threshold: 0.1, // 10%
        timeWindowMinutes: 5,
      },
      severity: AlertSeverity.ERROR,
      channels: [AlertChannel.CONSOLE, AlertChannel.SLACK],
      enabled: true,
      cooldownMinutes: 15,
      escalationRules: [
        {
          delayMinutes: 30,
          channels: [AlertChannel.EMAIL],
        },
      ],
    });

    // Critical error alert
    this.addRule({
      id: 'critical_errors',
      name: 'Critical Errors',
      description: 'Triggered immediately on any critical error',
      condition: {
        type: 'error_count',
        threshold: 1,
        timeWindowMinutes: 1,
        filters: {
          severity: 'critical',
        },
      },
      severity: AlertSeverity.CRITICAL,
      channels: [AlertChannel.CONSOLE, AlertChannel.SLACK, AlertChannel.EMAIL],
      enabled: true,
      cooldownMinutes: 1,
      escalationRules: [
        {
          delayMinutes: 5,
          channels: [AlertChannel.SMS],
        },
      ],
    });

    // Authentication failure spike
    this.addRule({
      id: 'auth_failures',
      name: 'Authentication Failure Spike',
      description: 'Triggered when auth failures exceed 20 in 10 minutes',
      condition: {
        type: 'error_count',
        threshold: 20,
        timeWindowMinutes: 10,
        filters: {
          category: 'authentication',
        },
      },
      severity: AlertSeverity.WARNING,
      channels: [AlertChannel.CONSOLE, AlertChannel.SLACK],
      enabled: true,
      cooldownMinutes: 30,
    });

    // Performance degradation
    this.addRule({
      id: 'performance_degradation',
      name: 'Performance Degradation',
      description: 'Triggered when response time performance degrades significantly',
      condition: {
        type: 'performance',
        threshold: 2000, // 2 seconds
        timeWindowMinutes: 10,
      },
      severity: AlertSeverity.WARNING,
      channels: [AlertChannel.CONSOLE, AlertChannel.SLACK],
      enabled: true,
      cooldownMinutes: 20,
    });

    // Health check failure
    this.addRule({
      id: 'health_check_failure',
      name: 'Health Check Failure',
      description: 'Triggered when health checks fail',
      condition: {
        type: 'health_check',
        threshold: 1,
        timeWindowMinutes: 1,
      },
      severity: AlertSeverity.ERROR,
      channels: [AlertChannel.CONSOLE, AlertChannel.SLACK, AlertChannel.EMAIL],
      enabled: true,
      cooldownMinutes: 5,
    });
  }

  private evaluateCondition(condition: AlertCondition, errorStats: ErrorStats): boolean {
    switch (condition.type) {
      case 'error_rate':
        return this.checkErrorRate(condition, errorStats);
      case 'error_count':
        return this.checkErrorCount(condition, errorStats);
      case 'specific_error':
        return this.checkSpecificError(condition, errorStats);
      case 'performance':
        return this.checkPerformance(condition, errorStats);
      case 'health_check':
        return this.checkHealthStatus(condition, errorStats);
      default:
        return false;
    }
  }

  private checkErrorRate(condition: AlertCondition, errorStats: ErrorStats): boolean {
    const totalRequests = errorStats.totalRequests || 1;
    const errorRate = errorStats.totalErrors / totalRequests;
    return errorRate >= condition.threshold;
  }

  private checkErrorCount(condition: AlertCondition, errorStats: ErrorStats): boolean {
    let errorCount = errorStats.totalErrors;

    if (condition.filters) {
      // Apply filters to get specific error count
      errorCount = this.applyFilters(errorStats, condition.filters);
    }

    return errorCount >= condition.threshold;
  }

  private checkSpecificError(condition: AlertCondition, errorStats: ErrorStats): boolean {
    // Check for specific error patterns
    return this.applyFilters(errorStats, condition.filters || {}) >= condition.threshold;
  }

  private checkPerformance(condition: AlertCondition, errorStats: ErrorStats): boolean {
    return (errorStats.averageResponseTime || 0) >= condition.threshold;
  }

  private checkHealthStatus(condition: AlertCondition, errorStats: ErrorStats): boolean {
    return !errorStats.healthStatus;
  }

  private applyFilters(errorStats: ErrorStats, filters: Record<string, unknown>): number {
    // This would need to be implemented based on your error storage
    // For now, return a placeholder value
    if (filters.category === 'authentication') {
      return errorStats.authenticationErrors || 0;
    }
    if (filters.severity === 'critical') {
      return errorStats.criticalErrors || 0;
    }
    return errorStats.totalErrors;
  }

  private async triggerAlert(rule: AlertRule, errorStats: ErrorStats): Promise<void> {
    const alert: AlertInstance = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      severity: rule.severity,
      title: rule.name,
      message: this.buildAlertMessage(rule, errorStats),
      timestamp: new Date().toISOString(),
      data: { errorStats, condition: rule.condition },
      status: 'active',
      escalationLevel: 0,
    };

    this.activeAlerts.set(alert.id, alert);
    this.addToHistory(alert);

    await this.sendNotifications(alert, rule.channels);

    logger.error('Alert triggered', {
      alertId: alert.id,
      ruleId: rule.id,
      severity: alert.severity,
      title: alert.title,
    });
  }

  private async resolveAlert(alert: AlertInstance): Promise<void> {
    alert.status = 'resolved';
    alert.lastNotified = new Date().toISOString();

    this.activeAlerts.delete(alert.id);
    this.addToHistory(alert);

    logger.info('Alert resolved', {
      alertId: alert.id,
      ruleId: alert.ruleId,
      duration: new Date().getTime() - new Date(alert.timestamp).getTime(),
    });
  }

  private async escalateAlert(alert: AlertInstance, rule: AlertRule): Promise<void> {
    const escalationRule = rule.escalationRules?.[alert.escalationLevel];
    if (!escalationRule) return;

    alert.escalationLevel++;
    alert.status = 'escalated';
    alert.lastNotified = new Date().toISOString();

    await this.sendNotifications(alert, escalationRule.channels, escalationRule.contacts);

    logger.error('Alert escalated', {
      alertId: alert.id,
      escalationLevel: alert.escalationLevel,
      channels: escalationRule.channels,
    });
  }

  private async sendNotifications(
    alert: AlertInstance,
    channels: AlertChannel[],
    contacts?: string[]
  ): Promise<void> {
    for (const channel of channels) {
      try {
        await this.sendToChannel(channel, alert, contacts);
      } catch (error) {
        logger.error('Failed to send notification', {
          channel,
          alertId: alert.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private async sendToChannel(
    channel: AlertChannel,
    alert: AlertInstance,
    contacts?: string[]
  ): Promise<void> {
    switch (channel) {
      case AlertChannel.CONSOLE:
        this.sendConsoleAlert(alert);
        break;
      case AlertChannel.SLACK:
        await this.sendSlackAlert(alert);
        break;
      case AlertChannel.EMAIL:
        await this.sendEmailAlert(alert, contacts);
        break;
      case AlertChannel.WEBHOOK:
        await this.sendWebhookAlert(alert);
        break;
      case AlertChannel.SMS:
        await this.sendSMSAlert(alert, contacts);
        break;
    }
  }

  private sendConsoleAlert(alert: AlertInstance): void {
    const icon = this.getSeverityIcon(alert.severity);
    console.error(`${icon} ALERT [${alert.severity.toUpperCase()}]: ${alert.title}`);
    console.error(`   Message: ${alert.message}`);
    console.error(`   Time: ${alert.timestamp}`);
    console.error(`   ID: ${alert.id}`);
  }

  private async sendSlackAlert(alert: AlertInstance): Promise<void> {
    // Placeholder for Slack integration
    // Would use Slack Web API or webhook
    logger.info('Slack alert sent', { alertId: alert.id });
  }

  private async sendEmailAlert(alert: AlertInstance, contacts?: string[]): Promise<void> {
    // Placeholder for email integration
    // Would use SendGrid, SES, or similar service
    logger.info('Email alert sent', { alertId: alert.id, contacts });
  }

  private async sendWebhookAlert(alert: AlertInstance): Promise<void> {
    // Placeholder for webhook integration
    logger.info('Webhook alert sent', { alertId: alert.id });
  }

  private async sendSMSAlert(alert: AlertInstance, contacts?: string[]): Promise<void> {
    // Placeholder for SMS integration
    // Would use Twilio or similar service
    logger.info('SMS alert sent', { alertId: alert.id, contacts });
  }

  private buildAlertMessage(rule: AlertRule, errorStats: ErrorStats): string {
    return `${rule.description}\n\nCurrent stats:\n- Total errors: ${errorStats.totalErrors}\n- Error rate: ${((errorStats.totalErrors / (errorStats.totalRequests || 1)) * 100).toFixed(2)}%\n- Time window: ${rule.condition.timeWindowMinutes} minutes`;
  }

  private isInCooldown(rule: AlertRule, existingAlert?: AlertInstance): boolean {
    if (!existingAlert || !existingAlert.lastNotified) return false;

    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    const timeSinceLastNotified = Date.now() - new Date(existingAlert.lastNotified).getTime();

    return timeSinceLastNotified < cooldownMs;
  }

  private shouldEscalate(rule: AlertRule, alert: AlertInstance): boolean {
    if (!rule.escalationRules || alert.escalationLevel >= rule.escalationRules.length) {
      return false;
    }

    const escalationRule = rule.escalationRules[alert.escalationLevel];
    const delayMs = escalationRule.delayMinutes * 60 * 1000;
    const timeSinceAlert = Date.now() - new Date(alert.timestamp).getTime();

    return timeSinceAlert >= delayMs;
  }

  private getActiveAlert(ruleId: string): AlertInstance | undefined {
    return Array.from(this.activeAlerts.values()).find(alert => alert.ruleId === ruleId);
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSeverityIcon(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.INFO: return 'ℹ️';
      case AlertSeverity.WARNING: return '⚠️';
      case AlertSeverity.ERROR: return '❌';
      case AlertSeverity.CRITICAL: return '🚨';
      default: return '🔔';
    }
  }

  private addToHistory(alert: AlertInstance): void {
    this.alertHistory.push({ ...alert });

    // Keep history size manageable
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
    }
  }
}

// Error statistics interface
interface ErrorStats {
  totalErrors: number;
  totalRequests?: number;
  averageResponseTime?: number;
  healthStatus?: boolean;
  authenticationErrors?: number;
  criticalErrors?: number;
  timestamp: string;
}

// Global instance
export const alertingSystem = new AlertingSystem();

// Convenience functions
export function checkAlerts(errorStats: ErrorStats): Promise<void> {
  return alertingSystem.checkAlerts(errorStats);
}

export function triggerAlert(
  title: string,
  message: string,
  severity: AlertSeverity = AlertSeverity.ERROR,
  channels: AlertChannel[] = [AlertChannel.CONSOLE]
): Promise<string> {
  return alertingSystem.triggerManualAlert(title, message, severity, channels);
}

export { AlertingSystem };
export default alertingSystem;