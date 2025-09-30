/**
 * Configuration Manager for xCloud Bot
 */
export interface Config {
    version: string;
    environment: string;
    logLevel?: string;
    [key: string]: unknown;
}
export declare class ConfigManager {
    private readonly logger;
    private config;
    constructor(initialConfig: Config);
    /**
     * Load configuration from environment variables and files
     */
    load(): Promise<void>;
    /**
     * Load configuration from environment variables
     */
    private loadFromEnvironment;
    /**
     * Validate required configuration
     */
    private validate;
    /**
     * Get configuration value
     */
    get<T = unknown>(key: string, defaultValue?: T): T;
    /**
     * Set configuration value
     */
    set(key: string, value: unknown): void;
    /**
     * Get all configuration
     */
    getAll(): Config;
    /**
     * Check if configuration key exists
     */
    has(key: string): boolean;
}
//# sourceMappingURL=ConfigManager.d.ts.map