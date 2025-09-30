/**
 * 🧪 Scheduler Tests
 */

import { monitorWorkflows } from '../../src/bot/scheduler.js';

// Mock dependencies
jest.mock('../../src/workflows/analyzer.js', () => ({
  analyzeWorkflowPerformance: jest.fn(),
  getXCloudRepositories: jest.fn(),
}));

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      actions: {
        listWorkflowRuns: jest.fn().mockResolvedValue({
          data: {
            workflow_runs: [],
          },
        }),
      },
      issues: {
        create: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      },
    },
  })),
}));

import { analyzeWorkflowPerformance, getXCloudRepositories } from '../../src/workflows/analyzer.js';

describe('Scheduler - monitorWorkflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('should handle repository with no workflows', async () => {
    getXCloudRepositories.mockResolvedValue([{ name: 'test-repo-no-workflows' }]);

    analyzeWorkflowPerformance.mockResolvedValue({
      repository: 'test-repo-no-workflows',
      hasWorkflows: false,
      recommendation: 'Implementar workflows CI/CD básicos',
    });

    // Should not throw error
    await expect(monitorWorkflows()).resolves.toBeUndefined();
  });

  it('should handle repository with error in analysis', async () => {
    getXCloudRepositories.mockResolvedValue([{ name: 'test-repo-error' }]);

    analyzeWorkflowPerformance.mockResolvedValue({
      repository: 'test-repo-error',
      error: 'API Error',
    });

    // Should not throw error
    await expect(monitorWorkflows()).resolves.toBeUndefined();
  });

  it('should handle repository with slow workflows', async () => {
    getXCloudRepositories.mockResolvedValue([{ name: 'test-repo-slow' }]);

    analyzeWorkflowPerformance.mockResolvedValue({
      repository: 'test-repo-slow',
      hasWorkflows: true,
      issues: {
        slowWorkflows: [{ name: 'slow-workflow', avgDuration: 15 }],
        unreliableWorkflows: [],
        inactiveWorkflows: [],
      },
    });

    // Should not throw error and should log warning
    await expect(monitorWorkflows()).resolves.toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ Workflows lentos detectados em test-repo-slow')
    );
  });

  it('should handle repository with no slow workflows', async () => {
    getXCloudRepositories.mockResolvedValue([{ name: 'test-repo-fast' }]);

    analyzeWorkflowPerformance.mockResolvedValue({
      repository: 'test-repo-fast',
      hasWorkflows: true,
      issues: {
        slowWorkflows: [],
        unreliableWorkflows: [],
        inactiveWorkflows: [],
      },
    });

    // Should not throw error and should not log slow workflow warning
    await expect(monitorWorkflows()).resolves.toBeUndefined();
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('⚠️ Workflows lentos detectados')
    );
  });

  it('should handle empty repository list', async () => {
    getXCloudRepositories.mockResolvedValue([]);

    // Should not throw error
    await expect(monitorWorkflows()).resolves.toBeUndefined();
  });
});
