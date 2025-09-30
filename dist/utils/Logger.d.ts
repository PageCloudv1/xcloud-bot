/**
 * Logger utility for consistent logging across the application
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class Logger {
    private readonly context;
    private readonly logLevel;
    constructor(context: string, logLevel?: LogLevel);
    private formatMessage;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    /**
     * Create a child logger with additional context
     */
    child(additionalContext: string): Logger;
}
//# sourceMappingURL=Logger.d.ts.map