"use strict";
/**
 * Configuration Manager for xCloud Bot
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const Logger_1 = require("./Logger");
class ConfigManager {
    constructor(initialConfig) {
        this.logger = new Logger_1.Logger('ConfigManager');
        this.config = { ...initialConfig };
    }
    /**
     * Load configuration from environment variables and files
     */
    async load() {
        try {
            this.logger.info('📋 Loading configuration...');
            // Load from environment variables
            this.loadFromEnvironment();
            // Validate required configuration
            this.validate();
            this.logger.info('✅ Configuration loaded successfully');
        }
        catch (error) {
            this.logger.error('❌ Failed to load configuration:', error);
            throw error;
        }
    }
    /**
     * Load configuration from environment variables
     */
    loadFromEnvironment() {
        const envMappings = {
            NODE_ENV: 'environment',
            LOG_LEVEL: 'logLevel',
            PORT: 'port',
            API_KEY: 'apiKey',
        };
        for (const [envVar, configKey] of Object.entries(envMappings)) {
            const value = process.env[envVar];
            if (value && !this.config[configKey]) {
                // Only set from env if not already configured
                this.config[configKey] = value;
            }
        }
    }
    /**
     * Validate required configuration
     */
    validate() {
        const required = ['version', 'environment'];
        for (const key of required) {
            if (!this.config[key]) {
                throw new Error(`Missing required configuration: ${key}`);
            }
        }
    }
    /**
     * Get configuration value
     */
    get(key, defaultValue) {
        const value = this.config[key];
        return (value !== undefined ? value : defaultValue);
    }
    /**
     * Set configuration value
     */
    set(key, value) {
        this.config[key] = value;
    }
    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }
    /**
     * Check if configuration key exists
     */
    has(key) {
        return this.config[key] !== undefined;
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map