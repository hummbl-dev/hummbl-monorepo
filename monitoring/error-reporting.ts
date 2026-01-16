/**
 * Error Reporting Workflow and Automation
 * Provides automated issue creation, classification, and resolution tracking
 */

import { errorTracker, type TrackedError, ErrorCategory, ErrorSeverity } from '@hummbl/core';
import { createLogger } from '@hummbl/core';

const logger = createLogger('error-reporting');

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  DUPLICATE = 'duplicate',
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

export interface ErrorIssue {
  id: string;
  title: string;
  description: string;
  errorId: string;
  errorFingerprint: string;
  status: IssueStatus;
  priority: IssuePriority;
  category: ErrorCategory;
  severity: ErrorSeverity;
  assignee?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  occurrenceCount: number;
  firstOccurrence: string;
  lastOccurrence: string;
  affectedUsers: Set<string>;
  relatedIssues: string[];
  autoCreated: boolean;
  metadata: {
    stackTrace?: string;
    userAgents: Set<string>;
    endpoints: Set<string>;
    ips: Set<string>;
    environments: Set<string>;
  };
}

export interface PostMortemTemplate {
  title: string;
  summary: string;
  timeline: TimelineEvent[];
  rootCause: string;
  resolution: string;
  preventionMeasures: string[];
  lessonsLearned: string[];
  actionItems: ActionItem[];
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  description: string;
  source: 'system' | 'human';
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: IssuePriority;
  status: 'open' | 'completed';
}

class ErrorReporting {
  private issues: Map<string, ErrorIssue> = new Map();
  private issuesByFingerprint: Map<string, string> = new Map();
  private autoCreateThresholds: Map<ErrorSeverity, number> = new Map([
    [ErrorSeverity.CRITICAL, 1],
    [ErrorSeverity.HIGH, 5],
    [ErrorSeverity.MEDIUM, 25],
    [ErrorSeverity.LOW, 100],
  ]);

  constructor() {
    this.initializeWorkflow();
  }

  /**
   * Process error and potentially create issue
   */
  async processError(trackedError: TrackedError): Promise<string | null> {
    const fingerprint = trackedError.metadata.fingerprint || trackedError.id;

    // Check if issue already exists for this error pattern
    const existingIssueId = this.issuesByFingerprint.get(fingerprint);
    if (existingIssueId) {
      await this.updateExistingIssue(existingIssueId, trackedError);
      return existingIssueId;
    }

    // Check if we should auto-create an issue
    const threshold = this.autoCreateThresholds.get(trackedError.metadata.severity) || 100;
    if (trackedError.count >= threshold) {
      return await this.createIssue(trackedError);
    }

    return null;
  }

  /**
   * Manually create an issue from an error
   */
  async createIssue(trackedError: TrackedError, assignee?: string): Promise<string> {
    const issue: ErrorIssue = {
      id: this.generateIssueId(),
      title: this.generateIssueTitle(trackedError),
      description: this.generateIssueDescription(trackedError),
      errorId: trackedError.id,
      errorFingerprint: trackedError.metadata.fingerprint || trackedError.id,
      status: IssueStatus.OPEN,
      priority: this.determinePriority(trackedError),
      category: trackedError.metadata.category,
      severity: trackedError.metadata.severity,
      assignee,
      labels: this.generateLabels(trackedError),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      occurrenceCount: trackedError.count,
      firstOccurrence: trackedError.firstSeen,
      lastOccurrence: trackedError.lastSeen,
      affectedUsers: new Set(trackedError.metadata.userId ? [trackedError.metadata.userId] : []),
      relatedIssues: [],
      autoCreated: !assignee, // Manual creation has assignee
      metadata: {
        stackTrace: trackedError.stack,
        userAgents: new Set(trackedError.metadata.userAgent ? [trackedError.metadata.userAgent] : []),
        endpoints: new Set(trackedError.metadata.endpoint ? [trackedError.metadata.endpoint] : []),
        ips: new Set(trackedError.metadata.ip ? [trackedError.metadata.ip] : []),
        environments: new Set(trackedError.metadata.tags?.environment ? [trackedError.metadata.tags.environment] : []),
      },
    };

    this.issues.set(issue.id, issue);
    this.issuesByFingerprint.set(issue.errorFingerprint, issue.id);

    // Auto-assign based on error category
    if (!assignee) {
      issue.assignee = this.autoAssign(issue);
    }

    await this.notifyIssueCreated(issue);

    logger.info('Issue created', {
      issueId: issue.id,
      errorId: trackedError.id,
      severity: issue.severity,
      autoCreated: issue.autoCreated,
    });

    return issue.id;
  }

  /**
   * Update issue status
   */
  async updateIssueStatus(issueId: string, status: IssueStatus, assignee?: string): Promise<void> {
    const issue = this.issues.get(issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    const previousStatus = issue.status;
    issue.status = status;
    issue.updatedAt = new Date().toISOString();

    if (assignee) {
      issue.assignee = assignee;
    }

    if (status === IssueStatus.RESOLVED || status === IssueStatus.CLOSED) {
      issue.resolvedAt = new Date().toISOString();
    }

    await this.notifyStatusChange(issue, previousStatus);

    // If critical issue is resolved, trigger post-mortem creation
    if (status === IssueStatus.RESOLVED && issue.severity === ErrorSeverity.CRITICAL) {
      await this.generatePostMortem(issue);
    }

    logger.info('Issue status updated', {
      issueId,
      previousStatus,
      newStatus: status,
      assignee,
    });
  }

  /**
   * Get issue statistics
   */
  getIssueStats(): IssueStatistics {
    const issues = Array.from(this.issues.values());

    return {
      total: issues.length,
      byStatus: this.groupBy(issues, issue => issue.status),
      byPriority: this.groupBy(issues, issue => issue.priority),
      byCategory: this.groupBy(issues, issue => issue.category),
      averageResolutionTime: this.calculateAverageResolutionTime(issues),
      oldestUnresolved: this.getOldestUnresolvedIssue(issues),
      recentlyResolved: issues
        .filter(issue => issue.resolvedAt)
        .sort((a, b) => new Date(b.resolvedAt!).getTime() - new Date(a.resolvedAt!).getTime())
        .slice(0, 5),
    };
  }

  /**
   * Generate comprehensive post-mortem for critical issues
   */
  async generatePostMortem(issue: ErrorIssue): Promise<PostMortemTemplate> {
    const timeline = await this.buildErrorTimeline(issue);

    const postMortem: PostMortemTemplate = {
      title: `Post-Mortem: ${issue.title}`,
      summary: this.generatePostMortemSummary(issue),
      timeline,
      rootCause: this.analyzeRootCause(issue),
      resolution: this.describeResolution(issue),
      preventionMeasures: this.generatePreventionMeasures(issue),
      lessonsLearned: this.extractLessonsLearned(issue),
      actionItems: this.createActionItems(issue),
    };

    // Save post-mortem
    await this.savePostMortem(issue.id, postMortem);

    logger.info('Post-mortem generated', {
      issueId: issue.id,
      severity: issue.severity,
    });

    return postMortem;
  }

  /**
   * Find duplicate issues
   */
  findDuplicates(issueId: string): string[] {
    const issue = this.issues.get(issueId);
    if (!issue) return [];

    const duplicates: string[] = [];

    for (const [id, otherIssue] of this.issues) {
      if (id === issueId) continue;

      // Check for similar error patterns
      const similarity = this.calculateSimilarity(issue, otherIssue);
      if (similarity > 0.8) {
        duplicates.push(id);
      }
    }

    return duplicates;
  }

  /**
   * Mark issue as duplicate
   */
  async markAsDuplicate(issueId: string, duplicateOfId: string): Promise<void> {
    const issue = this.issues.get(issueId);
    const parentIssue = this.issues.get(duplicateOfId);

    if (!issue || !parentIssue) {
      throw new Error('Issue not found');
    }

    issue.status = IssueStatus.DUPLICATE;
    issue.updatedAt = new Date().toISOString();

    // Merge data into parent issue
    parentIssue.occurrenceCount += issue.occurrenceCount;
    parentIssue.lastOccurrence = new Date(Math.max(
      new Date(parentIssue.lastOccurrence).getTime(),
      new Date(issue.lastOccurrence).getTime()
    )).toISOString();

    // Merge affected users
    issue.affectedUsers.forEach(user => parentIssue.affectedUsers.add(user));

    // Merge metadata
    issue.metadata.userAgents.forEach(ua => parentIssue.metadata.userAgents.add(ua));
    issue.metadata.endpoints.forEach(ep => parentIssue.metadata.endpoints.add(ep));
    issue.metadata.ips.forEach(ip => parentIssue.metadata.ips.add(ip));

    // Add to related issues
    if (!parentIssue.relatedIssues.includes(issueId)) {
      parentIssue.relatedIssues.push(issueId);
    }

    logger.info('Issue marked as duplicate', {
      duplicateIssue: issueId,
      parentIssue: duplicateOfId,
    });
  }

  private async updateExistingIssue(issueId: string, trackedError: TrackedError): Promise<void> {
    const issue = this.issues.get(issueId);
    if (!issue) return;

    // Update counts and timestamps
    issue.occurrenceCount = trackedError.count;
    issue.lastOccurrence = trackedError.lastSeen;
    issue.updatedAt = new Date().toISOString();

    // Add new user if present
    if (trackedError.metadata.userId) {
      issue.affectedUsers.add(trackedError.metadata.userId);
    }

    // Add new metadata
    if (trackedError.metadata.userAgent) {
      issue.metadata.userAgents.add(trackedError.metadata.userAgent);
    }
    if (trackedError.metadata.endpoint) {
      issue.metadata.endpoints.add(trackedError.metadata.endpoint);
    }
    if (trackedError.metadata.ip) {
      issue.metadata.ips.add(trackedError.metadata.ip);
    }

    // Check if priority should be escalated
    const newPriority = this.determinePriority(trackedError);
    if (this.isPriorityHigher(newPriority, issue.priority)) {
      issue.priority = newPriority;
      await this.notifyPriorityEscalation(issue);
    }
  }

  private initializeWorkflow(): void {
    // Set up periodic cleanup and maintenance
    setInterval(() => {
      this.performMaintenance();
    }, 60 * 60 * 1000); // Every hour

    logger.info('Error reporting workflow initialized');
  }

  private performMaintenance(): void {
    // Auto-resolve old issues with no recent occurrences
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

    for (const [issueId, issue] of this.issues) {
      if (
        issue.status === IssueStatus.OPEN &&
        new Date(issue.lastOccurrence).getTime() < cutoff &&
        issue.severity !== ErrorSeverity.CRITICAL
      ) {
        issue.status = IssueStatus.RESOLVED;
        issue.resolvedAt = new Date().toISOString();
        issue.updatedAt = new Date().toISOString();

        logger.info('Auto-resolved stale issue', {
          issueId,
          lastOccurrence: issue.lastOccurrence,
        });
      }
    }
  }

  private generateIssueId(): string {
    return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateIssueTitle(trackedError: TrackedError): string {
    const category = trackedError.metadata.category;
    const message = trackedError.message.length > 60
      ? `${trackedError.message.substring(0, 57)}...`
      : trackedError.message;

    return `[${category.toUpperCase()}] ${message}`;
  }

  private generateIssueDescription(trackedError: TrackedError): string {
    const sections = [
      `## Error Details`,
      `**Message:** ${trackedError.message}`,
      `**Category:** ${trackedError.metadata.category}`,
      `**Severity:** ${trackedError.metadata.severity}`,
      `**Occurrences:** ${trackedError.count}`,
      `**First Seen:** ${trackedError.firstSeen}`,
      `**Last Seen:** ${trackedError.lastSeen}`,
      '',
    ];

    if (trackedError.metadata.endpoint) {
      sections.push(`**Endpoint:** ${trackedError.metadata.endpoint}`);
    }

    if (trackedError.metadata.userAgent) {
      sections.push(`**User Agent:** ${trackedError.metadata.userAgent}`);
    }

    if (trackedError.stack) {
      sections.push('', '## Stack Trace', '```', trackedError.stack, '```');
    }

    if (trackedError.context) {
      sections.push('', '## Context', '```json', JSON.stringify(trackedError.context, null, 2), '```');
    }

    return sections.join('\n');
  }

  private determinePriority(trackedError: TrackedError): IssuePriority {
    if (trackedError.metadata.severity === ErrorSeverity.CRITICAL) {
      return IssuePriority.URGENT;
    }
    if (trackedError.metadata.severity === ErrorSeverity.HIGH) {
      return IssuePriority.HIGH;
    }
    if (trackedError.count > 100) {
      return IssuePriority.HIGH;
    }
    if (trackedError.metadata.severity === ErrorSeverity.MEDIUM) {
      return IssuePriority.MEDIUM;
    }
    return IssuePriority.LOW;
  }

  private generateLabels(trackedError: TrackedError): string[] {
    const labels = [
      `category:${trackedError.metadata.category}`,
      `severity:${trackedError.metadata.severity}`,
    ];

    if (trackedError.metadata.tags?.environment) {
      labels.push(`env:${trackedError.metadata.tags.environment}`);
    }

    if (trackedError.metadata.tags?.source) {
      labels.push(`source:${trackedError.metadata.tags.source}`);
    }

    return labels;
  }

  private autoAssign(issue: ErrorIssue): string | undefined {
    // Simple auto-assignment logic based on category
    const assignments: Record<ErrorCategory, string> = {
      [ErrorCategory.AUTHENTICATION]: 'auth-team',
      [ErrorCategory.AUTHORIZATION]: 'auth-team',
      [ErrorCategory.DATABASE]: 'backend-team',
      [ErrorCategory.NETWORK]: 'infrastructure-team',
      [ErrorCategory.MCP_TOOL]: 'mcp-team',
      [ErrorCategory.PERFORMANCE]: 'performance-team',
      [ErrorCategory.VALIDATION]: 'frontend-team',
      [ErrorCategory.USER_INPUT]: 'frontend-team',
      [ErrorCategory.RATE_LIMIT]: 'infrastructure-team',
      [ErrorCategory.SYSTEM]: 'on-call',
      [ErrorCategory.UNKNOWN]: 'triage-team',
    };

    return assignments[issue.category];
  }

  private async notifyIssueCreated(issue: ErrorIssue): Promise<void> {
    // Integration points for notifications
    logger.info('New issue notification', {
      issueId: issue.id,
      priority: issue.priority,
      assignee: issue.assignee,
    });
  }

  private async notifyStatusChange(issue: ErrorIssue, previousStatus: IssueStatus): Promise<void> {
    logger.info('Issue status change notification', {
      issueId: issue.id,
      previousStatus,
      newStatus: issue.status,
    });
  }

  private async notifyPriorityEscalation(issue: ErrorIssue): Promise<void> {
    logger.warn('Issue priority escalated', {
      issueId: issue.id,
      newPriority: issue.priority,
    });
  }

  private groupBy<T, K extends string | number | symbol>(
    items: T[],
    keyFn: (item: T) => K
  ): Record<K, number> {
    return items.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as Record<K, number>);
  }

  private calculateAverageResolutionTime(issues: ErrorIssue[]): number {
    const resolvedIssues = issues.filter(issue => issue.resolvedAt);
    if (resolvedIssues.length === 0) return 0;

    const totalTime = resolvedIssues.reduce((sum, issue) => {
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.resolvedAt!).getTime();
      return sum + (resolved - created);
    }, 0);

    return totalTime / resolvedIssues.length / 1000 / 60 / 60; // Hours
  }

  private getOldestUnresolvedIssue(issues: ErrorIssue[]): ErrorIssue | null {
    const unresolvedIssues = issues.filter(issue =>
      issue.status === IssueStatus.OPEN || issue.status === IssueStatus.IN_PROGRESS
    );

    if (unresolvedIssues.length === 0) return null;

    return unresolvedIssues.reduce((oldest, issue) =>
      new Date(issue.createdAt) < new Date(oldest.createdAt) ? issue : oldest
    );
  }

  private async buildErrorTimeline(issue: ErrorIssue): Promise<TimelineEvent[]> {
    // This would integrate with your logging system to build a comprehensive timeline
    return [
      {
        timestamp: issue.firstOccurrence,
        event: 'First Error Occurrence',
        description: 'Initial error detected',
        source: 'system',
      },
      {
        timestamp: issue.createdAt,
        event: 'Issue Created',
        description: 'Automated issue creation triggered',
        source: 'system',
      },
    ];
  }

  private generatePostMortemSummary(issue: ErrorIssue): string {
    return `Critical error occurred affecting ${issue.affectedUsers.size} users with ${issue.occurrenceCount} occurrences between ${issue.firstOccurrence} and ${issue.lastOccurrence}.`;
  }

  private analyzeRootCause(issue: ErrorIssue): string {
    // AI-powered root cause analysis would go here
    return 'Root cause analysis pending - requires manual investigation';
  }

  private describeResolution(issue: ErrorIssue): string {
    return 'Resolution details to be documented';
  }

  private generatePreventionMeasures(issue: ErrorIssue): string[] {
    return [
      'Implement additional error handling',
      'Add monitoring for early detection',
      'Review and improve testing coverage',
    ];
  }

  private extractLessonsLearned(issue: ErrorIssue): string[] {
    return [
      'Importance of comprehensive error handling',
      'Value of early detection systems',
    ];
  }

  private createActionItems(issue: ErrorIssue): ActionItem[] {
    return [
      {
        id: `action_${Date.now()}_1`,
        description: 'Implement preventive measures',
        assignee: issue.assignee || 'team-lead',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: IssuePriority.HIGH,
        status: 'open',
      },
    ];
  }

  private async savePostMortem(issueId: string, postMortem: PostMortemTemplate): Promise<void> {
    // Save to documentation system or database
    logger.info('Post-mortem saved', { issueId });
  }

  private calculateSimilarity(issue1: ErrorIssue, issue2: ErrorIssue): number {
    let score = 0;

    // Category match
    if (issue1.category === issue2.category) score += 0.3;

    // Message similarity (simple approach)
    const words1 = issue1.title.toLowerCase().split(' ');
    const words2 = issue2.title.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    score += (commonWords.length / Math.max(words1.length, words2.length)) * 0.4;

    // Endpoint similarity
    const endpoints1 = Array.from(issue1.metadata.endpoints);
    const endpoints2 = Array.from(issue2.metadata.endpoints);
    const commonEndpoints = endpoints1.filter(ep => endpoints2.includes(ep));
    if (commonEndpoints.length > 0) score += 0.3;

    return score;
  }

  private isPriorityHigher(priority1: IssuePriority, priority2: IssuePriority): boolean {
    const priorities = [IssuePriority.LOW, IssuePriority.MEDIUM, IssuePriority.HIGH, IssuePriority.CRITICAL, IssuePriority.URGENT];
    return priorities.indexOf(priority1) > priorities.indexOf(priority2);
  }
}

interface IssueStatistics {
  total: number;
  byStatus: Record<IssueStatus, number>;
  byPriority: Record<IssuePriority, number>;
  byCategory: Record<ErrorCategory, number>;
  averageResolutionTime: number; // hours
  oldestUnresolved: ErrorIssue | null;
  recentlyResolved: ErrorIssue[];
}

// Global instance
export const errorReporting = new ErrorReporting();

export default errorReporting;