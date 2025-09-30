/**
 * Configuration Manager for xCloud Bot
 */

import { Logger } from './Logger';

export interface Config {
  version: string;
  environment: string;
  logLevel?: string;
  [key: string]: unknown;
}

export class ConfigManager {
  private readonly logger: Logger;
  private config: Config;

  constructor(initialConfig: Config) {
    this.logger = new Logger('ConfigManager');
    this.config = { ...initialConfig };
  }

  /**
   * Load configuration from environment variables and files
   */
  async load(): Promise<void> {
    try {
      this.logger.info('📋 Loading configuration...');

      // Load from environment variables
      this.loadFromEnvironment();

      // Validate required configuration
      this.validate();

      this.logger.info('✅ Configuration loaded successfully');
    } catch (error) {
      this.logger.error('❌ Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): void {
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
  private validate(): void {
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
  get<T = unknown>(key: string, defaultValue?: T): T {
    const value = this.config[key];
    return (value !== undefined ? value : defaultValue) as T;
  }

  /**
   * Set configuration value
   */
  set(key: string, value: unknown): void {
    this.config[key] = value;
  }

  /**
   * Get all configuration
   */
  getAll(): Config {
    return { ...this.config };
  }

  /**
   * Check if configuration key exists
   */
  has(key: string): boolean {
    return this.config[key] !== undefined;
  }
}
