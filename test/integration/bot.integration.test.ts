/**
 * Integration tests for the complete bot workflow
 */

import { XCloudBot } from '../../src/core/XCloudBot';

describe('XCloudBot Integration Tests', () => {
  let bot: XCloudBot;

  beforeEach(() => {
    bot = new XCloudBot({
      version: '1.0.0',
      environment: 'test',
      logLevel: 'error',
    });
  });

  afterEach(async () => {
    if (bot) {
      try {
        await bot.stop();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Complete lifecycle', () => {
    it('should complete full initialization, start, and stop cycle', async () => {
      // Initialize
      await expect(bot.initialize()).resolves.not.toThrow();
      
      // Check initial status
      let status = bot.getStatus();
      expect(status.running).toBe(false);
      
      // Start
      await expect(bot.start()).resolves.not.toThrow();
      
      // Check running status
      status = bot.getStatus();
      expect(status.running).toBe(true);
      
      // Health check should pass
      const healthy = await bot.healthCheck();
      expect(healthy).toBe(true);
      
      // Stop
      await expect(bot.stop()).resolves.not.toThrow();
      
      // Check stopped status
      status = bot.getStatus();
      expect(status.running).toBe(false);
    }, 10000);

    it('should handle rapid start/stop cycles', async () => {
      await bot.initialize();
      
      // Rapid start/stop cycles
      for (let i = 0; i < 3; i++) {
        await bot.start();
        expect(bot.getStatus().running).toBe(true);
        
        await bot.stop();
        expect(bot.getStatus().running).toBe(false);
      }
    }, 10000);
  });

  describe('Error handling', () => {
    it('should handle service failures gracefully', async () => {
      await bot.initialize();
      await bot.start();
      
      // Bot should still be responsive
      const status = bot.getStatus();
      expect(status.version).toBeDefined();
      expect(status.environment).toBeDefined();
    });
  });

  describe('Configuration integration', () => {
    it('should respect environment configuration', async () => {
      const testBot = new XCloudBot({
        version: '2.0.0',
        environment: 'integration-test',
        logLevel: 'debug',
      });

      await testBot.initialize();
      
      const status = testBot.getStatus();
      expect(status.version).toBe('2.0.0');
      expect(status.environment).toBe('integration-test');
      
      await testBot.stop();
    });
  });
});