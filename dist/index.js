#!/usr/bin/env node
"use strict";
/**
 * xCloud Bot - Main Entry Point
 * 🤖 Assistant inteligente para orquestração e gerenciamento da plataforma xCloud
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const XCloudBot_1 = require("./core/XCloudBot");
const Logger_1 = require("./utils/Logger");
const logger = new Logger_1.Logger('Main');
async function main() {
    try {
        logger.info('🚀 Starting xCloud Bot...');
        const bot = new XCloudBot_1.XCloudBot({
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        });
        await bot.initialize();
        await bot.start();
        // Graceful shutdown handling
        process.on('SIGINT', async () => {
            logger.info('🛑 Received SIGINT, shutting down gracefully...');
            await bot.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            logger.info('🛑 Received SIGTERM, shutting down gracefully...');
            await bot.stop();
            process.exit(0);
        });
        logger.info('✅ xCloud Bot started successfully');
    }
    catch (error) {
        logger.error('❌ Failed to start xCloud Bot:', error);
        process.exit(1);
    }
}
exports.main = main;
// Start the application
if (require.main === module) {
    main().catch(error => {
        // eslint-disable-next-line no-console
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map