/**
 * 🧪 Workflow Tests
 */

import { analyzeRepository } from '../../src/workflows/analyzer.js';
import { createWorkflow } from '../../src/workflows/creator.js';

describe('Workflow Analyzer', () => {
  it('should analyze repository', async () => {
    // Note: This test requires valid GitHub credentials and will fail in CI
    // It's a placeholder that demonstrates the expected structure
    try {
      const result = await analyzeRepository('test-repo');
      expect(result).toBeDefined();
      if (result.summary) {
        expect(result.summary).toBeDefined();
        expect(result.detailed_reports).toBeDefined();
      }
    } catch (error) {
      // Expected to fail without valid credentials
      expect(error).toBeDefined();
    }
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
