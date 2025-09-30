/**
 * Logger utility for consistent logging across the application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private readonly context: string;
  private readonly logLevel: LogLevel;

  constructor(context: string, logLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.logLevel = logLevel;
  }

  private formatMessage(level: string, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs =
      args.length > 0
        ? ` ${args
            .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
            .join(' ')}`
        : '';

    return `[${timestamp}] [${level}] [${this.context}] ${message}${formattedArgs}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('INFO', message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('WARN', message, ...args));
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('ERROR', message, ...args));
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: string): Logger {
    return new Logger(`${this.context}:${additionalContext}`, this.logLevel);
  }
}
