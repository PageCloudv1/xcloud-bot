"use strict";
/**
 * Logger utility for consistent logging across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(context, logLevel = LogLevel.INFO) {
        this.context = context;
        this.logLevel = logLevel;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0
            ? ` ${args
                .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
                .join(' ')}`
            : '';
        return `[${timestamp}] [${level}] [${this.context}] ${message}${formattedArgs}`;
    }
    debug(message, ...args) {
        if (this.logLevel <= LogLevel.DEBUG) {
            // eslint-disable-next-line no-console
            console.debug(this.formatMessage('DEBUG', message, ...args));
        }
    }
    info(message, ...args) {
        if (this.logLevel <= LogLevel.INFO) {
            // eslint-disable-next-line no-console
            console.info(this.formatMessage('INFO', message, ...args));
        }
    }
    warn(message, ...args) {
        if (this.logLevel <= LogLevel.WARN) {
            // eslint-disable-next-line no-console
            console.warn(this.formatMessage('WARN', message, ...args));
        }
    }
    error(message, ...args) {
        if (this.logLevel <= LogLevel.ERROR) {
            // eslint-disable-next-line no-console
            console.error(this.formatMessage('ERROR', message, ...args));
        }
    }
    /**
     * Create a child logger with additional context
     */
    child(additionalContext) {
        return new Logger(`${this.context}:${additionalContext}`, this.logLevel);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map