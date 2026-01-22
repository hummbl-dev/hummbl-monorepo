// Enhanced logging utility for HUMMBL Backend
// Structured logging with different levels and contexts

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const baseLog = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      return `${baseLog} ${JSON.stringify(context)}`;
    }

    return baseLog;
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, context);
    console.log(formatted);
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);
  }

  error(message: string, error?: Error | LogContext): void {
    let context: LogContext = {};

    if (error instanceof Error) {
      context = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    } else if (error) {
      context = error;
    }

    const formatted = this.formatMessage('error', message, context);
    console.error(formatted);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context);
      console.debug(formatted);
    }
  }

  // Telemetry-specific logging
  telemetry(event: string, data: LogContext): void {
    this.info(`TELEMETRY: ${event}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // API request logging
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API ${method} ${path}`, context);
  }

  // Model routing logging
  modelRouting(taskId: string, selectedModel: string, confidence: number, latency?: number): void {
    this.telemetry('MODEL_ROUTING', {
      taskId,
      selectedModel,
      confidence,
      latency,
    });
  }
}

export const logger = new Logger();
