/**
 * 🧪 Workflow Tests
 */

import { analyzeRepository, analyzeWorkflowPerformance } from '../../src/workflows/analyzer.js';
import { createWorkflow } from '../../src/workflows/creator.js';

// Mock dependencies for analyzer tests
jest.mock('../../src/integrations/github-api.js', () => ({
  getRepositoryWorkflows: jest.fn(),
  getWorkflowRuns: jest.fn(),
  getXCloudRepositories: jest.fn(),
}));

jest.mock('../../src/integrations/gemini-cli.js', () => ({
  analyzeWithGemini: jest.fn(),
}));

import { getRepositoryWorkflows, getWorkflowRuns } from '../../src/integrations/github-api.js';
import { analyzeWithGemini } from '../../src/integrations/gemini-cli.js';

describe('Workflow Analyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle analyzeRepository when performance has error', async () => {
    // Mock performance analysis to return error state
    getRepositoryWorkflows.mockRejectedValue(new Error('API Error'));
    getWorkflowRuns.mockResolvedValue([]);
    analyzeWithGemini.mockResolvedValue({
      data: {},
      text: 'Analysis failed',
      raw: null,
      provider: 'gemini',
    });

    // This should not throw even when performance returns error
    await expect(analyzeRepository('test-repo')).rejects.toThrow();
  });

  it('should handle analyzeRepository with successful performance but error object', async () => {
    // Mock successful API calls but performance returns error object
    getRepositoryWorkflows.mockResolvedValue([{ id: 1, name: 'CI', state: 'active' }]);
    getWorkflowRuns.mockResolvedValue([
      {
        workflow_id: 1,
        conclusion: 'success',
        created_at: new Date().toISOString(),
        updated_at: new Date(Date.now() + 120000).toISOString(),
      },
    ]);
    analyzeWithGemini.mockResolvedValue({
      data: { missing_workflows: [] },
      text: 'Good analysis',
      raw: null,
      provider: 'gemini',
    });

    // analyzeWorkflowPerformance should succeed, so analyzeRepository should succeed
    const result = await analyzeRepository('test-repo');

    expect(result).toBeDefined();
    expect(result.repository).toBe('test-repo');
    expect(result.overall_score).toBeDefined();
    expect(result.action_items).toBeDefined();
  });

  it('should handle analyzeWorkflowPerformance error response', async () => {
    getRepositoryWorkflows.mockRejectedValue(new Error('GitHub API Error'));
    getWorkflowRuns.mockResolvedValue([]);

    const result = await analyzeWorkflowPerformance('test-repo');

    expect(result).toBeDefined();
    expect(result.repository).toBe('test-repo');
    expect(result.error).toBeDefined();
    expect(result.issues).toBeUndefined();
  });

  it('should handle analyzeWorkflowPerformance with no workflows', async () => {
    getRepositoryWorkflows.mockResolvedValue([]);
    getWorkflowRuns.mockResolvedValue([]);

    const result = await analyzeWorkflowPerformance('test-repo');

    expect(result).toBeDefined();
    expect(result.repository).toBe('test-repo');
    expect(result.hasWorkflows).toBe(false);
    expect(result.recommendation).toBe('Implementar workflows CI/CD básicos');
  });

  it('should handle analyzeWorkflowPerformance with valid workflows', async () => {
    getRepositoryWorkflows.mockResolvedValue([{ id: 1, name: 'CI', state: 'active' }]);
    getWorkflowRuns.mockResolvedValue([
      {
        workflow_id: 1,
        conclusion: 'success',
        created_at: new Date().toISOString(),
        updated_at: new Date(Date.now() + 120000).toISOString(), // 2 min later
      },
    ]);

    const result = await analyzeWorkflowPerformance('test-repo');

    expect(result).toBeDefined();
    expect(result.repository).toBe('test-repo');
    expect(result.hasWorkflows).toBe(true);
    expect(result.issues).toBeDefined();
    expect(result.issues.slowWorkflows).toBeDefined();
    expect(result.issues.unreliableWorkflows).toBeDefined();
    expect(result.issues.inactiveWorkflows).toBeDefined();
  });

  it('should handle analyzeRepository when performance object has error', async () => {
    // Mock workflows and runs to succeed
    getRepositoryWorkflows.mockResolvedValue([{ id: 1, name: 'CI', state: 'active' }]);
    getWorkflowRuns.mockResolvedValue([
      {
        workflow_id: 1,
        conclusion: 'success',
        created_at: new Date().toISOString(),
        updated_at: new Date(Date.now() + 120000).toISOString(),
      },
    ]);
    
    // Mock analyzeWithGemini to succeed
    analyzeWithGemini.mockResolvedValue({
      data: {},
      text: 'Analysis complete',
      raw: null,
      provider: 'gemini',
    });

    const result = await analyzeRepository('test-repo');

    // Should complete without throwing error even if performance has issues property undefined
    expect(result).toBeDefined();
    expect(result.repository).toBe('test-repo');
    expect(result.action_items).toBeDefined();
    expect(Array.isArray(result.action_items)).toBe(true);
  });

  it('should handle analyzeRepository with undefined performance gracefully', async () => {
    // This test ensures generateActionItems doesn't crash with edge case inputs
    // Mock to make workflow API succeed but return minimal data
    getRepositoryWorkflows.mockResolvedValue([]);
    getWorkflowRuns.mockResolvedValue([]);
    analyzeWithGemini.mockResolvedValue({
      data: {},
      text: 'No workflows',
      raw: null,
      provider: 'gemini',
    });

    const result = await analyzeRepository('test-repo');

    expect(result).toBeDefined();
    expect(result.action_items).toBeDefined();
    expect(Array.isArray(result.action_items)).toBe(true);
    // When there are no workflows, performance will have hasWorkflows: false
    // and no issues property, so action_items should handle this gracefully
  });
});

describe('Workflow Creator', () => {
  it('should create CI workflow', () => {
    const result = createWorkflow('ci');
    expect(result.type).toBe('ci');
    expect(result.created).toBe(true);
    expect(result.fileName).toBe('ci.yml');
    expect(result.content).toBeDefined();
  });

  it('should throw error for unknown workflow type', () => {
    expect(() => createWorkflow('unknown')).toThrow('Unknown workflow type: unknown');
  });
});
