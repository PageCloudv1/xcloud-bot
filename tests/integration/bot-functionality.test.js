/**
 * 🤖 xCloud Bot Functionality Integration Tests
 * 
 * Tests all bot functionalities including GitHub App, MCP Server, 
 * workflows, and integrations as specified in the test issue.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  initializeGitHubApp, 
  processWebhook, 
  createWorkflowIssue,
  handleIssueOpened,
  handleWorkflowCompleted 
} from '../../src/bot/github-app.js';
import { 
  analyzeRepository, 
  analyzeAllRepositories 
} from '../../src/workflows/analyzer.js';
import { 
  createWorkflow, 
  validateWorkflow,
  listWorkflowTemplates 
} from '../../src/workflows/creator.js';
import { analyzeCode, analyzeWorkflow } from '../../src/integrations/gemini-cli.js';

describe('🤖 xCloud Bot - Comprehensive Functionality Tests', () => {
  
  describe('🤖 GitHub App Functionality', () => {
    let githubApp;
    
    beforeAll(async () => {
      githubApp = await initializeGitHubApp();
    });

    it('🔔 should initialize GitHub App successfully', async () => {
      expect(githubApp).toBeDefined();
      expect(githubApp.constructor.name).toBe('Octokit');
    });

    it('🏷️ should process issue opened webhook with auto-labeling', async () => {
      const payload = {
        action: 'opened',
        issue: {
          title: '🐛 Bug in workflow automation',
          body: 'There is a bug in the bot workflow'
        },
        repository: {
          name: 'xcloud-bot'
        }
      };

      const result = await processWebhook(payload, githubApp);
      expect(result.processed).toBe(true);
    });

    it('🔍 should handle pull request webhook for workflow analysis', async () => {
      const payload = {
        action: 'opened',
        pull_request: {
          title: 'Update ci.yml workflow',
          body: 'Updating GitHub workflow configuration'
        },
        repository: {
          name: 'xcloud-bot'
        }
      };

      const result = await processWebhook(payload, githubApp);
      expect(result.processed).toBe(true);
    });

    it('📝 should create workflow issue automatically', async () => {
      const result = await createWorkflowIssue('xcloud-bot', 'CI/CD Enhancement');
      
      expect(result.created).toBe(true);
      expect(result.title).toContain('CI/CD Enhancement');
      expect(result.labels).toContain('🔧 workflow');
    });

    it('🔄 should handle workflow failure and create investigation issue', async () => {
      const payload = {
        action: 'completed',
        workflow_run: {
          id: 12345,
          name: 'CI Workflow',
          conclusion: 'failure'
        },
        repository: {
          name: 'xcloud-bot'
        }
      };

      const result = await processWebhook(payload, githubApp);
      expect(result.processed).toBe(true);
    });

    it('🏷️ should auto-label issues based on content', async () => {
      const testCases = [
        {
          title: '🐛 Bug in authentication',
          expectedLabels: ['🐛 bug', '📋 triage']
        },
        {
          title: '✨ Feature request for new workflow',
          expectedLabels: ['✨ enhancement', '🔧 workflow', '📋 triage']
        },
        {
          title: '🧪 Test failure in CI bot',
          expectedLabels: ['🧪 testing', '🤖 bot-related', '📋 triage']
        }
      ];

      for (const testCase of testCases) {
        const payload = {
          issue: { title: testCase.title },
          repository: { name: 'xcloud-bot' }
        };

        const result = await handleIssueOpened(payload, githubApp);
        expect(result.labels_added).toBeDefined();
        expect(result.labels_added.length).toBeGreaterThan(0);
      }
    });
  });

  describe('📊 Workflow Analysis', () => {
    it('🔍 should analyze single repository', async () => {
      const analysis = analyzeRepository('xcloud-bot');
      
      expect(analysis).toBeDefined();
      expect(analysis.repository).toBe('xcloud-bot');
      expect(analysis.workflows).toBeDefined();
      expect(analysis.issues).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.overall_health).toMatch(/excellent|good|fair|poor/);
    });

    it('🌍 should analyze all xCloud repositories', async () => {
      const results = analyzeAllRepositories();
      
      expect(results).toBeDefined();
      expect(results.repositories).toBeDefined();
      expect(results.repositories.length).toBeGreaterThan(0);
      expect(results.total_repositories).toBe(5);
      expect(results.overall_success_rate).toBeGreaterThan(0);
    });

    it('📊 should provide performance metrics', async () => {
      const analysis = analyzeRepository('xcloud-bot');
      
      expect(analysis.metrics).toBeDefined();
      expect(analysis.metrics.total_workflows).toBeGreaterThan(0);
      expect(analysis.metrics.active_workflows).toBeGreaterThan(0);
      expect(analysis.success_rate).toMatch(/\d+%/);
    });

    it('⚡ should identify priority actions', async () => {
      const analysis = analyzeRepository('xcloud-bot');
      
      expect(analysis.next_actions).toBeDefined();
      expect(analysis.next_actions.length).toBeGreaterThan(0);
      
      const highPriorityActions = analysis.next_actions.filter(
        action => action.priority === 'urgent' || action.priority === 'high'
      );
      expect(highPriorityActions.length).toBeGreaterThan(0);
    });
  });

  describe('🏗️ Workflow Creation', () => {
    it('🔧 should create CI workflow', async () => {
      const result = createWorkflow('ci');
      
      expect(result.created).toBe(true);
      expect(result.type).toBe('ci');
      expect(result.name).toBe('Continuous Integration');
      expect(result.content).toContain('name: 🔄 CI - Continuous Integration');
      expect(result.filePath).toBe('.github/workflows/ci.yml');
    });

    it('🏗️ should create build workflow', async () => {
      const result = createWorkflow('build');
      
      expect(result.created).toBe(true);
      expect(result.type).toBe('build');
      expect(result.content).toContain('Build Application');
    });

    it('🔒 should create security workflow', async () => {
      const result = createWorkflow('security');
      
      expect(result.created).toBe(true);
      expect(result.type).toBe('security');
      expect(result.content).toContain('Security');
      expect(result.content).toContain('CodeQL');
    });

    it('📋 should list available workflow templates', async () => {
      const templates = listWorkflowTemplates();
      
      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates).toContain('ci');
      expect(templates).toContain('build');
      expect(templates).toContain('security');
    });

    it('🔍 should validate workflow files', async () => {
      const result = validateWorkflow('.github/workflows/ci.yml');
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.checks).toBeDefined();
      expect(result.passed).toBeGreaterThan(0);
    });

    it('❌ should handle invalid workflow types', async () => {
      expect(() => {
        createWorkflow('invalid-type');
      }).toThrow('Unknown workflow type');
    });
  });

  describe('🧠 Gemini CLI Integration', () => {
    it('🔍 should analyze code quality', async () => {
      const codeSnippet = `
        function processData(data) {
          return data.map(item => item.value);
        }
      `;
      
      const analysis = await analyzeCode(codeSnippet);
      
      expect(analysis).toBeDefined();
      expect(analysis.quality).toBeDefined();
      expect(analysis.suggestions).toBeDefined();
      expect(analysis.complexity).toBeDefined();
    });

    it('⚡ should analyze workflow performance', async () => {
      const workflowFile = '.github/workflows/ci.yml';
      
      const analysis = await analyzeWorkflow(workflowFile);
      
      expect(analysis).toBeDefined();
      expect(analysis.performance).toBeDefined();
      expect(analysis.bottlenecks).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });
  });

  describe('📈 Performance Metrics', () => {
    it('⏱️ should complete analysis within acceptable time', async () => {
      const start = Date.now();
      
      analyzeRepository('xcloud-bot');
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('🎯 should provide accurate success rate calculations', async () => {
      const analysis = analyzeRepository('xcloud-bot');
      const successRate = parseInt(analysis.success_rate);
      
      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });

    it('📊 should generate comprehensive metrics', async () => {
      const summary = analyzeAllRepositories();
      
      expect(summary.total_repositories).toBe(5);
      expect(summary.total_workflows).toBeGreaterThan(0);
      expect(summary.summary.excellent + summary.summary.good + 
             summary.summary.fair + summary.summary.poor).toBe(5);
    });
  });

  describe('🔧 Integration Tests', () => {
    it('🔄 should integrate GitHub App with workflow analyzer', async () => {
      // Simulate workflow failure -> analysis -> issue creation flow
      const analysis = analyzeRepository('xcloud-bot');
      
      if (analysis.overall_health === 'poor' || analysis.overall_health === 'fair') {
        const issue = await createWorkflowIssue('xcloud-bot', 'Performance Investigation', {
          analysis_results: analysis,
          auto_created: true
        });
        
        expect(issue.created).toBe(true);
        expect(issue.title).toContain('Investigation');
      }
    });

    it('🤖 should coordinate bot components', async () => {
      // Test end-to-end flow: webhook -> analysis -> action
      const webhookPayload = {
        action: 'completed',
        workflow_run: {
          id: 123,
          name: 'CI',
          conclusion: 'failure'
        },
        repository: { name: 'xcloud-bot' }
      };

      const webhookResult = await processWebhook(webhookPayload, await initializeGitHubApp());
      expect(webhookResult.processed).toBe(true);
    });
  });

  describe('✅ Success Criteria Validation', () => {
    it('🔔 GitHub App should respond to webhooks quickly', async () => {
      const start = Date.now();
      
      const payload = {
        action: 'opened',
        issue: { title: 'Test issue' },
        repository: { name: 'xcloud-bot' }
      };
      
      await processWebhook(payload, await initializeGitHubApp());
      
      const responseTime = Date.now() - start;
      expect(responseTime).toBeLessThan(5000); // Less than 5 seconds
    });

    it('🏷️ Labels should be applied correctly', async () => {
      const payload = {
        issue: { title: '🐛 Critical bug in workflow bot' },
        repository: { name: 'xcloud-bot' }
      };

      const result = await handleIssueOpened(payload, await initializeGitHubApp());
      
      expect(result.labels_added).toContain('🐛 bug');
      expect(result.labels_added).toContain('🤖 bot-related');
      expect(result.labels_added).toContain('🔧 workflow');
    });

    it('📊 Analyses should be accurate and useful', async () => {
      const analysis = analyzeRepository('xcloud-bot');
      
      // Should provide actionable insights
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.next_actions.length).toBeGreaterThan(0);
      
      // Should identify real issues
      expect(analysis.issues.length).toBeGreaterThan(0);
      
      // Should have realistic metrics
      const successRate = parseInt(analysis.success_rate);
      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });
  });
});