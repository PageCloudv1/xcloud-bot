/**
 * XCloudBot - Core Bot Implementation
 * Main class responsible for bot initialization and orchestration
 */

import { Logger } from '../utils/Logger';
import { ConfigManager } from '../utils/ConfigManager';
import { DevOpsService } from '../services/DevOpsService';

export interface XCloudBotConfig {
  version: string;
  environment: string;
  logLevel?: string;
  [key: string]: unknown;
}

export class XCloudBot {
  private readonly logger: Logger;
  private readonly config: ConfigManager;
  private readonly devOpsService: DevOpsService;
  private isRunning: boolean = false;

  constructor(config: XCloudBotConfig) {
    this.logger = new Logger('XCloudBot');
    this.config = new ConfigManager(config);
    this.devOpsService = new DevOpsService();

    this.logger.info(`🤖 XCloud Bot v${config.version} initializing...`);
  }

  /**
   * Initialize the bot and all its services
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('🔧 Initializing bot services...');

      // Initialize configuration
      await this.config.load();

      // Initialize DevOps service
      await this.devOpsService.initialize();

      this.logger.info('✅ Bot services initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize bot services:', error);
      throw error;
    }
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('⚠️ Bot is already running');
      return;
    }

    try {
      this.logger.info('🚀 Starting xCloud Bot...');

      // Start services
      await this.devOpsService.start();

      this.isRunning = true;
      this.logger.info('✅ xCloud Bot started successfully');
    } catch (error) {
      this.logger.error('❌ Failed to start bot:', error);
      throw error;
    }
  }

  /**
   * Stop the bot gracefully
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('⚠️ Bot is not running');
      return;
    }

    try {
      this.logger.info('🛑 Stopping xCloud Bot...');

      // Stop services
      await this.devOpsService.stop();

      this.isRunning = false;
      this.logger.info('✅ xCloud Bot stopped successfully');
    } catch (error) {
      this.logger.error('❌ Failed to stop bot:', error);
      throw error;
    }
  }

  /**
   * Get bot status
   */
  getStatus(): { running: boolean; version: string; environment: string } {
    return {
      running: this.isRunning,
      version: this.config.get('version'),
      environment: this.config.get('environment'),
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const devOpsHealthy = await this.devOpsService.healthCheck();
      return this.isRunning && devOpsHealthy;
    } catch (error) {
      this.logger.error('❌ Health check failed:', error);
      return false;
    }
  }
}
