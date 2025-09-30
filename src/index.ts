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
    const shutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
      try {
        await bot.stop();
        logger.info('✅ Shutdown completed');
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        throw error;
      }
    };

    process.on('SIGINT', () => {
      shutdown('SIGINT').catch(error => {
        logger.error('❌ Error during SIGINT shutdown:', error);
        process.exitCode = 1;
      });
    });
    process.on('SIGTERM', () => {
      shutdown('SIGTERM').catch(error => {
        logger.error('❌ Error during SIGTERM shutdown:', error);
        process.exitCode = 1;
      });
    });

    logger.info('✅ xCloud Bot started successfully');
  } catch (error) {
    logger.error('❌ Failed to start xCloud Bot:', error);
    throw error;
  }
}

// Start the application
if (require.main === module) {
  main().catch(error => {
    // eslint-disable-next-line no-console
    console.error('Fatal error:', error);
    // Let the process exit naturally with a non-zero code
    process.exitCode = 1;
  });
}

export { main };
