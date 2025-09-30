/**
 * Unit tests for Logger utility
 */

import { Logger, LogLevel } from '../../../src/utils/Logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger('TestContext', LogLevel.DEBUG);
    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create a logger with context', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should use default log level INFO when not specified', () => {
      const defaultLogger = new Logger('Default');
      expect(defaultLogger).toBeInstanceOf(Logger);
    });
  });

  describe('Logging methods', () => {
    it('should log debug messages when log level allows', () => {
      logger.debug('Test debug message');
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] [TestContext] Test debug message')
      );
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [TestContext] Test info message')
      );
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] [TestContext] Test warning message')
      );
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] [TestContext] Test error message')
      );
    });

    it('should format messages with additional arguments', () => {
      const obj = { key: 'value' };
      logger.info('Test message with args', 'string arg', obj);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Test message with args string arg')
      );
    });

    it('should respect log level filtering', () => {
      const warnLogger = new Logger('WarnOnly', LogLevel.WARN);

      // Clear previous calls
      jest.clearAllMocks();

      warnLogger.debug('Should not appear');
      warnLogger.info('Should not appear');
      warnLogger.warn('Should appear');
      warnLogger.error('Should appear');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('child()', () => {
    it('should create a child logger with extended context', () => {
      const childLogger = logger.child('SubContext');
      expect(childLogger).toBeInstanceOf(Logger);

      childLogger.info('Child message');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestContext:SubContext] Child message')
      );
    });
  });

  describe('Message formatting', () => {
    it('should include timestamp in messages', () => {
      logger.info('Test message');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
      );
    });

    it('should handle object arguments correctly', () => {
      const testObj = { test: 'value', nested: { key: 'val' } };
      logger.info('Object test', testObj);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(testObj, null, 2))
      );
    });
  });
});
