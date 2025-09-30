"use strict";
/**
 * XCloudBot - Core Bot Implementation
 * Main class responsible for bot initialization and orchestration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XCloudBot = void 0;
const Logger_1 = require("../utils/Logger");
const ConfigManager_1 = require("../utils/ConfigManager");
const DevOpsService_1 = require("../services/DevOpsService");
class XCloudBot {
    constructor(config) {
        this.isRunning = false;
        this.logger = new Logger_1.Logger('XCloudBot');
        this.config = new ConfigManager_1.ConfigManager(config);
        this.devOpsService = new DevOpsService_1.DevOpsService();
        this.logger.info(`🤖 XCloud Bot v${config.version} initializing...`);
    }
    /**
     * Initialize the bot and all its services
     */
    async initialize() {
        try {
            this.logger.info('🔧 Initializing bot services...');
            // Initialize configuration
            await this.config.load();
            // Initialize DevOps service
            await this.devOpsService.initialize();
            this.logger.info('✅ Bot services initialized successfully');
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize bot services:', error);
            throw error;
        }
    }
    /**
     * Start the bot
     */
    async start() {
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
        }
        catch (error) {
            this.logger.error('❌ Failed to start bot:', error);
            throw error;
        }
    }
    /**
     * Stop the bot gracefully
     */
    async stop() {
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
        }
        catch (error) {
            this.logger.error('❌ Failed to stop bot:', error);
            throw error;
        }
    }
    /**
     * Get bot status
     */
    getStatus() {
        return {
            running: this.isRunning,
            version: this.config.get('version'),
            environment: this.config.get('environment'),
        };
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const devOpsHealthy = await this.devOpsService.healthCheck();
            return this.isRunning && devOpsHealthy;
        }
        catch (error) {
            this.logger.error('❌ Health check failed:', error);
            return false;
        }
    }
}
exports.XCloudBot = XCloudBot;
//# sourceMappingURL=XCloudBot.js.map