/**
 * End-to-end tests for XCloud Bot
 */

import { XCloudBot } from '../../src/core/XCloudBot';

describe('XCloud Bot E2E Tests', () => {
  describe('Full application workflow', () => {
    it('should complete a full bot lifecycle', async () => {
      // Create bot with test configuration
      const bot = new XCloudBot({
        version: '1.0.0',
        environment: 'e2e-test',
        logLevel: 'error',
      });

      // Initialize the bot
      await expect(bot.initialize()).resolves.not.toThrow();

      // Start the bot
      await expect(bot.start()).resolves.not.toThrow();

      // Verify it's running
      expect(bot.getStatus().running).toBe(true);

      // Verify health check
      const healthy = await bot.healthCheck();
      expect(healthy).toBe(true);

      // Stop the bot
      await expect(bot.stop()).resolves.not.toThrow();

      // Verify it's stopped
      expect(bot.getStatus().running).toBe(false);
    }, 10000);

    it('should handle multiple bot instances', async () => {
      const bot1 = new XCloudBot({
        version: '1.0.0',
        environment: 'e2e-test-1',
      });

      const bot2 = new XCloudBot({
        version: '1.0.0',
        environment: 'e2e-test-2',
      });

      // Initialize both bots
      await Promise.all([bot1.initialize(), bot2.initialize()]);

      // Start both bots
      await Promise.all([bot1.start(), bot2.start()]);

      // Both should be running
      expect(bot1.getStatus().running).toBe(true);
      expect(bot2.getStatus().running).toBe(true);

      // Stop both bots
      await Promise.all([bot1.stop(), bot2.stop()]);

      // Both should be stopped
      expect(bot1.getStatus().running).toBe(false);
      expect(bot2.getStatus().running).toBe(false);
    }, 10000);
  });

  describe('Environment validation', () => {
    it('should work in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should respect custom environment settings', async () => {
      const customBot = new XCloudBot({
        version: '1.0.0',
        environment: 'custom-e2e',
        logLevel: 'debug',
      });

      await customBot.initialize();
      const status = customBot.getStatus();
      expect(status.environment).toBe('custom-e2e');
      
      await customBot.stop();
    });
  });
});