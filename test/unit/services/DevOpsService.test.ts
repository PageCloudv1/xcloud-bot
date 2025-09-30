/**
 * Unit tests for DevOpsService
 */

import { DevOpsService } from '../../../src/services/DevOpsService';

describe('DevOpsService', () => {
  let service: DevOpsService;

  beforeEach(() => {
    service = new DevOpsService();
  });

  afterEach(async () => {
    if (service) {
      try {
        await service.stop();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Constructor', () => {
    it('should create a new DevOpsService instance', () => {
      expect(service).toBeInstanceOf(DevOpsService);
    });
  });

  describe('initialize()', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });
  });

  describe('start() and stop()', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should start successfully after initialization', async () => {
      await expect(service.start()).resolves.not.toThrow();
    });

    it('should fail to start without initialization', async () => {
      const uninitializedService = new DevOpsService();
      await expect(uninitializedService.start()).rejects.toThrow(
        'DevOps service not initialized'
      );
    });

    it('should stop successfully', async () => {
      await service.start();
      await expect(service.stop()).resolves.not.toThrow();
    });
  });

  describe('getWorkflowStatus()', () => {
    beforeEach(async () => {
      await service.initialize();
      await service.start();
    });

    it('should return workflow status', async () => {
      const status = await service.getWorkflowStatus('test-workflow-123');
      
      expect(status).toBeDefined();
      expect(status).toHaveProperty('id', 'test-workflow-123');
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('startTime');
      expect(status!.status).toMatch(/pending|running|completed|failed/);
    });
  });

  describe('triggerDeployment()', () => {
    beforeEach(async () => {
      await service.initialize();
      await service.start();
    });

    it('should trigger deployment and return deployment info', async () => {
      const deployment = await service.triggerDeployment('feature/test', 'staging');
      
      expect(deployment).toBeDefined();
      expect(deployment).toHaveProperty('environment', 'staging');
      expect(deployment).toHaveProperty('branch', 'feature/test');
      expect(deployment).toHaveProperty('version');
      expect(deployment).toHaveProperty('status');
      expect(deployment).toHaveProperty('timestamp');
      expect(deployment.status).toMatch(/deploying|deployed|failed/);
    });
  });

  describe('getDeploymentStatus()', () => {
    beforeEach(async () => {
      await service.initialize();
      await service.start();
    });

    it('should return deployment status', async () => {
      const status = await service.getDeploymentStatus('production');
      
      expect(status).toBeDefined();
      expect(status).toHaveProperty('environment', 'production');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('branch');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('timestamp');
      expect(status!.status).toMatch(/deploying|deployed|failed/);
    });
  });

  describe('healthCheck()', () => {
    it('should return false when not initialized', async () => {
      const healthy = await service.healthCheck();
      expect(healthy).toBe(false);
    });

    it('should return false when not running', async () => {
      await service.initialize();
      const healthy = await service.healthCheck();
      expect(healthy).toBe(false);
    });

    it('should return true when initialized and running', async () => {
      await service.initialize();
      await service.start();
      const healthy = await service.healthCheck();
      expect(healthy).toBe(true);
    });
  });
});