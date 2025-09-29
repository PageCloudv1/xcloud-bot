/**
 * Unit tests for XCloudBot class
 */

import { XCloudBot, XCloudBotConfig } from '../../../src/core/XCloudBot';

describe('XCloudBot', () => {
  let bot: XCloudBot;
  let config: XCloudBotConfig;

  beforeEach(() => {
    config = {
      version: '1.0.0',
      environment: 'test',
      logLevel: 'error',
    };
    bot = new XCloudBot(config);
  });

  afterEach(async () => {
    if (bot) {
      try {
        await bot.stop();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  });

  describe('Constructor', () => {
    it('should create a new XCloudBot instance', () => {
      expect(bot).toBeInstanceOf(XCloudBot);
    });

    it('should initialize with correct configuration', () => {
      const status = bot.getStatus();
      expect(status.version).toBe('1.0.0');
      expect(status.environment).toBe('test');
      expect(status.running).toBe(false);
    });
  });

  describe('initialize()', () => {
    it('should initialize successfully', async () => {
      await expect(bot.initialize()).resolves.not.toThrow();
    });

    it('should handle initialization errors gracefully', async () => {
      // Create a new bot and spy on its config load method
      const testConfig = {
        version: '1.0.0',
        environment: 'test',
        logLevel: 'error',
      };
      const testBot = new XCloudBot(testConfig);
      
      // Mock the config.load method to throw an error
      jest.spyOn(testBot['config'], 'load').mockRejectedValue(new Error('Config load failed'));

      await expect(testBot.initialize()).rejects.toThrow('Config load failed');
    });
  });

  describe('start() and stop()', () => {
    beforeEach(async () => {
      await bot.initialize();
    });

    it('should start successfully', async () => {
      await expect(bot.start()).resolves.not.toThrow();
      expect(bot.getStatus().running).toBe(true);
    });

    it('should stop successfully', async () => {
      await bot.start();
      await expect(bot.stop()).resolves.not.toThrow();
      expect(bot.getStatus().running).toBe(false);
    });

    it('should handle multiple start calls gracefully', async () => {
      await bot.start();
      await expect(bot.start()).resolves.not.toThrow();
      expect(bot.getStatus().running).toBe(true);
    });

    it('should handle multiple stop calls gracefully', async () => {
      await bot.start();
      await bot.stop();
      await expect(bot.stop()).resolves.not.toThrow();
      expect(bot.getStatus().running).toBe(false);
    });
  });

  describe('healthCheck()', () => {
    beforeEach(async () => {
      await bot.initialize();
    });

    it('should return false when bot is not running', async () => {
      const healthy = await bot.healthCheck();
      expect(healthy).toBe(false);
    });

    it('should return true when bot is running and healthy', async () => {
      await bot.start();
      const healthy = await bot.healthCheck();
      expect(healthy).toBe(true);
    });
  });

  describe('getStatus()', () => {
    it('should return correct status information', () => {
      const status = bot.getStatus();
      expect(status).toHaveProperty('running');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('environment');
      expect(typeof status.running).toBe('boolean');
      expect(typeof status.version).toBe('string');
      expect(typeof status.environment).toBe('string');
    });
  });
});