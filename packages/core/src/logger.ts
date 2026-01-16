/**
 * Structured Logging Utility
 * Provides consistent, searchable logging across HUMMBL applications
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  source?: string;
  traceId?: string;
}

class Logger {
  private source: string;
  private minLevel: LogLevel;

  constructor(source: string, minLevel: LogLevel = LogLevel.INFO) {
    this.source = source;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    traceId?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context,
      source: this.source,
      traceId,
    };
  }

  private output(entry: LogEntry): void {
    const logString = JSON.stringify(entry);

    // Use console methods for proper log level handling
    switch (entry.level) {
      case 'DEBUG':
        console.debug(logString);
        break;
      case 'INFO':
        console.info(logString);
        break;
      case 'WARN':
        console.warn(logString);
        break;
      case 'ERROR':
        console.error(logString);
        break;
      default:
        console.log(logString);
    }
  }

  debug(message: string, context?: LogContext, traceId?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLogEntry(LogLevel.DEBUG, message, context, traceId));
    }
  }

  info(message: string, context?: LogContext, traceId?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLogEntry(LogLevel.INFO, message, context, traceId));
    }
  }

  warn(message: string, context?: LogContext, traceId?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLogEntry(LogLevel.WARN, message, context, traceId));
    }
  }

  error(message: string, context?: LogContext, traceId?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLogEntry(LogLevel.ERROR, message, context, traceId));
    }
  }

  child(additionalSource: string): Logger {
    return new Logger(`${this.source}:${additionalSource}`, this.minLevel);
  }
}

// Factory function to create loggers
export function createLogger(source: string, minLevel?: LogLevel): Logger {
  return new Logger(source, minLevel);
}

// Default logger for immediate use
export const logger = createLogger('hummbl');

// Convenience method for quick migration from console.log
export function log(message: string, context?: LogContext): void {
  logger.info(message, context);
}

// Error logging with stack trace support
export function logError(error: Error | unknown, context?: LogContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(message, {
    ...context,
    stack,
    type: error instanceof Error ? error.constructor.name : 'Unknown',
  });
}