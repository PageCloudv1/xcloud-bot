#!/usr/bin/env node

/**
 * xCloud Bot - Main Entry Point
 * 🤖 Assistant inteligente para orquestração e gerenciamento da plataforma xCloud
 */

import { XCloudBot } from './core/XCloudBot';
import { Logger } from './utils/Logger';

const logger = new Logger('Main');

async function main(): Promise<void> {
  try {
    logger.info('🚀 Starting xCloud Bot...');

    const bot = new XCloudBot({
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
  } catch (error) {
    logger.error('❌ Failed to start xCloud Bot:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main().catch(error => {
    // eslint-disable-next-line no-console
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
