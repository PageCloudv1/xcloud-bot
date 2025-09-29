/**
 * 🧪 Workflow Tests
 */

import { describe, it, expect } from 'vitest';
import { analyzeRepository } from '../../src/workflows/analyzer.js';
import { createWorkflow } from '../../src/workflows/creator.js';

describe('Workflow Analyzer', () => {
  it('should analyze repository', () => {
    const result = analyzeRepository('test-repo');
    expect(result.repository).toBe('test-repo');
    expect(result.workflows).toBeDefined();
    expect(Array.isArray(result.workflows)).toBe(true);
  });
});

describe('Workflow Creator', () => {
  it('should create CI workflow', () => {
    const result = createWorkflow('ci');
    expect(result.type).toBe('ci');
    expect(result.created).toBe(true);
    expect(result.template).toBe('ci.yml');
  });

  it('should throw error for unknown workflow type', () => {
    expect(() => createWorkflow('unknown')).toThrow('Unknown workflow type: unknown');
  });
});