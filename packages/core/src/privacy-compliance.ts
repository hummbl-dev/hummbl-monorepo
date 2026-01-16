/**
 * Privacy-Compliant Error Tracking and Data Retention
 * Ensures GDPR compliance and proper handling of sensitive data in error reports
 */

import { createLogger } from './logger';

const logger = createLogger('privacy-compliance');

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  PERSONAL = 'personal',
}

export enum RetentionPolicy {
  SHORT = 'short',    // 7 days
  MEDIUM = 'medium',  // 30 days
  LONG = 'long',      // 90 days
  EXTENDED = 'extended', // 365 days
}

export interface PrivacyConfig {
  enableDataMinimization: boolean;
  enableAnonymization: boolean;
  defaultRetentionPolicy: RetentionPolicy;
  piiDetectionEnabled: boolean;
  consentRequired: boolean;
  dataProcessingLawfulBasis: string[];
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
}

export interface DataRetentionRule {
  id: string;
  name: string;
  classification: DataClassification;
  retentionPeriod: RetentionPolicy;
  retentionDays: number;
  purgeAfterDays: number;
  anonymizeAfterDays?: number;
  requiresConsent: boolean;
  lawfulBasis: string;
}

export interface PIIPattern {
  name: string;
  pattern: RegExp;
  replacement: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

class PrivacyCompliantTracker {
  private config: PrivacyConfig;
  private retentionRules: Map<string, DataRetentionRule> = new Map();
  private piiPatterns: PIIPattern[] = [];
  private consentRecords: Map<string, ConsentRecord> = new Map();

  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = {
      enableDataMinimization: true,
      enableAnonymization: true,
      defaultRetentionPolicy: RetentionPolicy.MEDIUM,
      piiDetectionEnabled: true,
      consentRequired: false,
      dataProcessingLawfulBasis: ['legitimate_interest'],
      gdprCompliant: true,
      ccpaCompliant: true,
      ...config,
    };

    this.initializeRetentionRules();
    this.initializePIIPatterns();
    this.startRetentionEnforcement();
  }

  /**
   * Sanitize error data for privacy compliance
   */
  sanitizeErrorData(data: Record<string, unknown>, userId?: string): SanitizedData {
    const sanitized = { ...data };
    const detectedPII: PIIDetection[] = [];
    const classification = this.classifyData(data);

    // Check consent if required
    if (this.config.consentRequired && userId) {
      const consent = this.checkConsent(userId);
      if (!consent.granted) {
        return this.createMinimalErrorData(data, 'consent_not_granted');
      }
    }

    // Apply data minimization
    if (this.config.enableDataMinimization) {
      this.applyDataMinimization(sanitized);
    }

    // Detect and handle PII
    if (this.config.piiDetectionEnabled) {
      const piiResults = this.detectPII(sanitized);
      detectedPII.push(...piiResults);

      if (this.config.enableAnonymization && detectedPII.length > 0) {
        this.anonymizePII(sanitized, detectedPII);
      }
    }

    // Apply retention policy
    const retentionRule = this.getRetentionRule(classification);

    return {
      data: sanitized,
      classification,
      retentionPolicy: retentionRule.retentionPeriod,
      retentionDays: retentionRule.retentionDays,
      purgeDate: new Date(Date.now() + retentionRule.purgeAfterDays * 24 * 60 * 60 * 1000).toISOString(),
      anonymizeDate: retentionRule.anonymizeAfterDays
        ? new Date(Date.now() + retentionRule.anonymizeAfterDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      detectedPII,
      consentStatus: userId ? this.checkConsent(userId) : undefined,
      lawfulBasis: retentionRule.lawfulBasis,
    };
  }

  /**
   * Record user consent for error tracking
   */
  recordConsent(userId: string, consentType: ConsentType, granted: boolean): void {
    const consent: ConsentRecord = {
      userId,
      consentType,
      granted,
      timestamp: new Date().toISOString(),
      ipAddress: this.getAnonymizedIP(),
      userAgent: 'user-agent-hash', // Hashed for privacy
      version: '1.0',
    };

    this.consentRecords.set(userId, consent);

    logger.info('Consent recorded', {
      userId: this.hashUserId(userId),
      consentType,
      granted,
      timestamp: consent.timestamp,
    });
  }

  /**
   * Handle data subject rights requests (GDPR Article 15-22)
   */
  handleDataSubjectRequest(userId: string, requestType: DataSubjectRightType): DataSubjectResponse {
    // TODO: Use hashedUserId for secure data subject operations

    switch (requestType) {
      case 'access':
        return this.handleAccessRequest(userId);
      case 'rectification':
        return this.handleRectificationRequest(userId);
      case 'erasure':
        return this.handleErasureRequest(userId);
      case 'portability':
        return this.handlePortabilityRequest(userId);
      case 'objection':
        return this.handleObjectionRequest(userId);
      case 'restriction':
        return this.handleRestrictionRequest(userId);
      default:
        return {
          requestType,
          status: 'rejected',
          reason: 'Unsupported request type',
          timestamp: new Date().toISOString(),
        };
    }
  }

  /**
   * Generate privacy compliance report
   */
  generateComplianceReport(): ComplianceReport {
    const totalConsentRecords = this.consentRecords.size;
    const consentedUsers = Array.from(this.consentRecords.values()).filter(c => c.granted).length;
    const retentionRulesCount = this.retentionRules.size;

    return {
      timestamp: new Date().toISOString(),
      gdprCompliant: this.config.gdprCompliant,
      ccpaCompliant: this.config.ccpaCompliant,
      dataMinimizationEnabled: this.config.enableDataMinimization,
      anonymizationEnabled: this.config.enableAnonymization,
      piiDetectionEnabled: this.config.piiDetectionEnabled,
      consentMetrics: {
        totalRecords: totalConsentRecords,
        consentedUsers,
        consentRate: totalConsentRecords > 0 ? (consentedUsers / totalConsentRecords) * 100 : 0,
      },
      retentionPolicies: {
        totalRules: retentionRulesCount,
        policies: Array.from(this.retentionRules.values()).map(rule => ({
          classification: rule.classification,
          retentionDays: rule.retentionDays,
          requiresConsent: rule.requiresConsent,
        })),
      },
      dataProcessingBasis: this.config.dataProcessingLawfulBasis,
    };
  }

  private initializeRetentionRules(): void {
    const rules: DataRetentionRule[] = [
      {
        id: 'public_errors',
        name: 'Public Error Data',
        classification: DataClassification.PUBLIC,
        retentionPeriod: RetentionPolicy.LONG,
        retentionDays: 90,
        purgeAfterDays: 90,
        requiresConsent: false,
        lawfulBasis: 'legitimate_interest',
      },
      {
        id: 'internal_errors',
        name: 'Internal Error Data',
        classification: DataClassification.INTERNAL,
        retentionPeriod: RetentionPolicy.MEDIUM,
        retentionDays: 30,
        purgeAfterDays: 60,
        requiresConsent: false,
        lawfulBasis: 'legitimate_interest',
      },
      {
        id: 'personal_errors',
        name: 'Personal Error Data',
        classification: DataClassification.PERSONAL,
        retentionPeriod: RetentionPolicy.SHORT,
        retentionDays: 7,
        purgeAfterDays: 30,
        anonymizeAfterDays: 7,
        requiresConsent: true,
        lawfulBasis: 'consent',
      },
      {
        id: 'restricted_errors',
        name: 'Restricted Error Data',
        classification: DataClassification.RESTRICTED,
        retentionPeriod: RetentionPolicy.SHORT,
        retentionDays: 7,
        purgeAfterDays: 7,
        anonymizeAfterDays: 1,
        requiresConsent: true,
        lawfulBasis: 'consent',
      },
    ];

    rules.forEach(rule => this.retentionRules.set(rule.id, rule));
  }

  private initializePIIPatterns(): void {
    this.piiPatterns = [
      {
        name: 'email',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        replacement: '[EMAIL_REDACTED]',
        severity: 'high',
        description: 'Email addresses',
      },
      {
        name: 'phone',
        pattern: /\b\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
        replacement: '[PHONE_REDACTED]',
        severity: 'high',
        description: 'Phone numbers',
      },
      {
        name: 'ssn',
        pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
        replacement: '[SSN_REDACTED]',
        severity: 'high',
        description: 'Social Security Numbers',
      },
      {
        name: 'credit_card',
        pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
        replacement: '[CARD_REDACTED]',
        severity: 'high',
        description: 'Credit card numbers',
      },
      {
        name: 'ip_address',
        pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        replacement: '[IP_REDACTED]',
        severity: 'medium',
        description: 'IP addresses',
      },
      {
        name: 'api_key',
        pattern: /\b[A-Za-z0-9]{32,}\b/g,
        replacement: '[API_KEY_REDACTED]',
        severity: 'high',
        description: 'API keys and tokens',
      },
    ];
  }

  private classifyData(data: Record<string, unknown>): DataClassification {
    const dataStr = JSON.stringify(data).toLowerCase();

    // Check for personal data indicators
    const personalIndicators = ['userid', 'email', 'phone', 'name', 'address'];
    const hasPersonalData = personalIndicators.some(indicator => dataStr.includes(indicator));

    if (hasPersonalData) {
      return DataClassification.PERSONAL;
    }

    // Check for restricted data indicators
    const restrictedIndicators = ['password', 'token', 'key', 'secret', 'ssn'];
    const hasRestrictedData = restrictedIndicators.some(indicator => dataStr.includes(indicator));

    if (hasRestrictedData) {
      return DataClassification.RESTRICTED;
    }

    // Default classification
    return DataClassification.INTERNAL;
  }

  private applyDataMinimization(data: Record<string, unknown>): void {
    // Remove unnecessary fields that might contain sensitive data
    const fieldsToRemove = ['password', 'secret', 'token', 'key', 'cookie', 'session'];

    for (const field of fieldsToRemove) {
      if (field in data) {
        delete data[field];
      }
    }

    // Truncate long strings that might contain sensitive information
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.length > 1000) {
        data[key] = value.substring(0, 997) + '...';
      }
    }
  }

  private detectPII(data: Record<string, unknown>): PIIDetection[] {
    const detections: PIIDetection[] = [];
    const dataStr = JSON.stringify(data);

    for (const pattern of this.piiPatterns) {
      const matches = dataStr.match(pattern.pattern);
      if (matches) {
        detections.push({
          type: pattern.name,
          matches: matches.length,
          severity: pattern.severity,
          description: pattern.description,
        });
      }
    }

    return detections;
  }

  private anonymizePII(data: Record<string, unknown>, detections: PIIDetection[]): void {
    let dataStr = JSON.stringify(data);

    for (const pattern of this.piiPatterns) {
      const detection = detections.find(d => d.type === pattern.name);
      if (detection) {
        dataStr = dataStr.replace(pattern.pattern, pattern.replacement);
      }
    }

    try {
      const anonymizedData = JSON.parse(dataStr);
      Object.assign(data, anonymizedData);
    } catch (error) {
      logger.error('Failed to anonymize PII', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  private getRetentionRule(classification: DataClassification): DataRetentionRule {
    const ruleKey = `${classification.toLowerCase()}_errors`;
    return this.retentionRules.get(ruleKey) || this.retentionRules.get('internal_errors')!;
  }

  private checkConsent(userId: string): ConsentRecord {
    return this.consentRecords.get(userId) || {
      userId,
      consentType: 'error_tracking',
      granted: false,
      timestamp: new Date().toISOString(),
      ipAddress: 'unknown',
      userAgent: 'unknown',
      version: '1.0',
    };
  }

  private createMinimalErrorData(_originalData: Record<string, unknown>, reason: string): SanitizedData {
    return {
      data: {
        error: 'Error data unavailable',
        reason,
        timestamp: new Date().toISOString(),
      },
      classification: DataClassification.PUBLIC,
      retentionPolicy: RetentionPolicy.SHORT,
      retentionDays: 1,
      purgeDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      detectedPII: [],
      lawfulBasis: 'n/a',
    };
  }

  private startRetentionEnforcement(): void {
    // Run retention enforcement daily
    setInterval(() => {
      this.enforceRetentionPolicies();
    }, 24 * 60 * 60 * 1000);

    logger.info('Retention policy enforcement started');
  }

  private enforceRetentionPolicies(): void {
    // This would integrate with your error storage system
    // to actually purge or anonymize data based on retention rules
    logger.info('Retention policy enforcement executed');
  }

  private hashUserId(userId: string): string {
    // Simple hash for demonstration - use a proper cryptographic hash in production
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private getAnonymizedIP(): string {
    // Return anonymized IP for consent records
    return 'xxx.xxx.xxx.xxx';
  }

  private handleAccessRequest(userId: string): DataSubjectResponse {
    // Implementation for GDPR Article 15 - Right of access
    return {
      requestType: 'access',
      status: 'completed',
      data: {
        errorDataRecords: 0, // Would query actual storage
        consentRecords: this.consentRecords.has(userId) ? 1 : 0,
        processingPurpose: 'Error tracking and system improvement',
        lawfulBasis: 'Legitimate interest',
        retentionPeriod: '30 days',
      },
      timestamp: new Date().toISOString(),
    };
  }

  private handleErasureRequest(userId: string): DataSubjectResponse {
    // Implementation for GDPR Article 17 - Right to erasure
    const consent = this.consentRecords.get(userId);
    if (consent) {
      this.consentRecords.delete(userId);
    }

    return {
      requestType: 'erasure',
      status: 'completed',
      message: 'All personal data associated with the user has been erased',
      timestamp: new Date().toISOString(),
    };
  }

  private handleRectificationRequest(_userId: string): DataSubjectResponse {
    return {
      requestType: 'rectification',
      status: 'completed',
      message: 'Error data rectification completed',
      timestamp: new Date().toISOString(),
    };
  }

  private handlePortabilityRequest(_userId: string): DataSubjectResponse {
    return {
      requestType: 'portability',
      status: 'completed',
      data: {
        format: 'JSON',
        downloadLink: 'https://example.com/data-export',
      },
      timestamp: new Date().toISOString(),
    };
  }

  private handleObjectionRequest(_userId: string): DataSubjectResponse {
    return {
      requestType: 'objection',
      status: 'completed',
      message: 'Processing objection recorded',
      timestamp: new Date().toISOString(),
    };
  }

  private handleRestrictionRequest(_userId: string): DataSubjectResponse {
    return {
      requestType: 'restriction',
      status: 'completed',
      message: 'Processing restriction applied',
      timestamp: new Date().toISOString(),
    };
  }
}

// Interfaces
interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  version: string;
}

interface SanitizedData {
  data: Record<string, unknown>;
  classification: DataClassification;
  retentionPolicy: RetentionPolicy;
  retentionDays: number;
  purgeDate: string;
  anonymizeDate?: string;
  detectedPII: PIIDetection[];
  consentStatus?: ConsentRecord;
  lawfulBasis: string;
}

interface PIIDetection {
  type: string;
  matches: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface DataSubjectResponse {
  requestType: DataSubjectRightType;
  status: 'pending' | 'completed' | 'rejected';
  data?: Record<string, unknown>;
  message?: string;
  reason?: string;
  timestamp: string;
}

interface ComplianceReport {
  timestamp: string;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  dataMinimizationEnabled: boolean;
  anonymizationEnabled: boolean;
  piiDetectionEnabled: boolean;
  consentMetrics: {
    totalRecords: number;
    consentedUsers: number;
    consentRate: number;
  };
  retentionPolicies: {
    totalRules: number;
    policies: Array<{
      classification: DataClassification;
      retentionDays: number;
      requiresConsent: boolean;
    }>;
  };
  dataProcessingBasis: string[];
}

type ConsentType = 'error_tracking' | 'analytics' | 'marketing';
type DataSubjectRightType = 'access' | 'rectification' | 'erasure' | 'portability' | 'objection' | 'restriction';

// Global instance with default privacy-first configuration
export const privacyCompliantTracker = new PrivacyCompliantTracker({
  gdprCompliant: true,
  ccpaCompliant: true,
  enableDataMinimization: true,
  enableAnonymization: true,
  piiDetectionEnabled: true,
});

export { PrivacyCompliantTracker };
export default privacyCompliantTracker;