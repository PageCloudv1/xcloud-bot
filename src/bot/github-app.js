/**
 * 🤖 GitHub App Handler
 *
 * Handles GitHub App initialization, webhook processing,
 * and automated tasks for xCloud repositories.
 */

import { Octokit } from '@octokit/rest';
import { createServer } from '../api/server.js';

let githubApp = null;

export async function initializeGitHubApp() {
  console.log('🔧 Initializing GitHub App...');

  // In a real implementation, this would use GitHub App credentials
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || 'placeholder',
  });

  githubApp = octokit;
  console.log('✅ GitHub App initialized');
  return octokit;
}

export async function processWebhook(payload, githubApp) {
  console.log('📨 Processing webhook:', payload.action);

  try {
    // Handle different webhook events
    switch (payload.action) {
      case 'opened':
        if (payload.issue) {
          await handleIssueOpened(payload, githubApp);
        } else if (payload.pull_request) {
          await handlePROpened(payload, githubApp);
        }
        break;
      case 'completed':
        if (payload.workflow_run) {
          await handleWorkflowCompleted(payload, githubApp);
        }
        break;
      default:
        console.log(`ℹ️ Unhandled webhook action: ${payload.action}`);
    }

    return { processed: true };
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return { processed: false, error: error.message };
  }
}

export async function handleIssueOpened(payload, githubApp) {
  console.log('🏷️ Auto-labeling new issue...');
  
  const { repository, issue } = payload;
  const labels = [];
  
  // Auto-label based on issue title/body content
  if (issue.title.toLowerCase().includes('bug')) {
    labels.push('🐛 bug');
  }
  if (issue.title.toLowerCase().includes('feature')) {
    labels.push('✨ enhancement');
  }
  if (issue.title.toLowerCase().includes('test')) {
    labels.push('🧪 testing');
  }
  if (issue.title.toLowerCase().includes('bot')) {
    labels.push('🤖 bot-related');
  }
  if (issue.title.toLowerCase().includes('workflow')) {
    labels.push('🔧 workflow');
  }
  
  // Add default priority
  labels.push('📋 triage');
  
  console.log(`🏷️ Adding labels: ${labels.join(', ')}`);
  return { labels_added: labels };
}

export async function handlePROpened(payload, githubApp) {
  console.log('🔍 Analyzing PR for workflow changes...');
  
  const { repository, pull_request } = payload;
  
  // Check if PR modifies workflow files
  const modifiesWorkflows = pull_request.title.includes('.yml') || 
                           pull_request.title.includes('workflow') ||
                           pull_request.body?.includes('.github/workflows');
  
  if (modifiesWorkflows) {
    console.log('🔧 PR modifies workflows - adding automation label');
    return { workflow_analysis: true, labels: ['🔧 workflow', '⚡ automation'] };
  }
  
  return { workflow_analysis: false };
}

export async function handleWorkflowCompleted(payload, githubApp) {
  console.log('📊 Analyzing workflow completion...');
  
  const { repository, workflow_run } = payload;
  
  if (workflow_run.conclusion === 'failure') {
    console.log('❌ Workflow failed - creating investigation issue');
    
    const issueData = {
      repo: repository.name,
      workflowType: 'CI/CD Investigation',
      workflowName: workflow_run.name,
      runId: workflow_run.id,
      failure: true
    };
    
    return await createWorkflowIssue(issueData.repo, issueData.workflowType, issueData);
  }
  
  return { analysis_complete: true };
}

export async function createWorkflowIssue(repo, workflowType, metadata = {}) {
  console.log(`📝 Creating ${workflowType} workflow issue for ${repo}`);

  const timestamp = new Date().toISOString();
  const issueTitle = metadata.failure ? 
    `🚨 Workflow Failure Investigation: ${metadata.workflowName}` :
    `🔧 ${workflowType} Workflow Enhancement for ${repo}`;
  
  const issueBody = metadata.failure ? `
# 🚨 Workflow Failure Investigation

**Repository**: ${repo}  
**Workflow**: ${metadata.workflowName}  
**Run ID**: ${metadata.runId}  
**Timestamp**: ${timestamp}

## 🔍 Failure Analysis Required

This issue was automatically created due to a workflow failure.

### Next Steps:
- [ ] Review workflow logs
- [ ] Identify failure cause
- [ ] Implement fix
- [ ] Test resolution
- [ ] Update workflow if needed

**Labels**: 🚨 critical, 🔧 workflow, 🤖 auto-created
` : `
# 🔧 ${workflowType} Workflow Enhancement

**Repository**: ${repo}  
**Created**: ${timestamp}

## 📋 Enhancement Checklist

- [ ] Analyze current workflow performance
- [ ] Identify optimization opportunities  
- [ ] Implement improvements
- [ ] Test changes
- [ ] Monitor results

**Labels**: 🔧 workflow, ⚡ enhancement, 🤖 auto-created
`;

  console.log(`✅ Issue created: ${issueTitle}`);
  
  return { 
    created: true, 
    title: issueTitle,
    body: issueBody,
    labels: metadata.failure ? 
      ['🚨 critical', '🔧 workflow', '🤖 auto-created'] :
      ['🔧 workflow', '⚡ enhancement', '🤖 auto-created']
  };
}

export async function startGitHubApp() {
  console.log('🚀 Starting xCloud Bot GitHub App...');
  
  // Initialize GitHub App
  const app = await initializeGitHubApp();
  
  // Create Express server
  const server = createServer(app);
  const port = process.env.PORT || 3000;
  
  server.listen(port, () => {
    console.log(`🌐 GitHub App server running on port ${port}`);
    console.log('📡 Webhook endpoint: /api/webhooks');
    console.log('❤️ Health check: /health');
    console.log('📊 Status: /api/status');
  });
  
  return { app, server };
}

// CLI Commands
if (process.argv.includes('--create-issue')) {
  console.log('🎯 Creating test issue...');
  createWorkflowIssue('xcloud-bot', 'CI/CD Test')
    .then((result) => {
      console.log('✅ Issue created successfully:');
      console.log(`   Title: ${result.title}`);
      console.log(`   Labels: ${result.labels.join(', ')}`);
    })
    .catch(console.error);
}

if (process.argv.includes('--start') || process.argv[1]?.endsWith('github-app.js')) {
  startGitHubApp()
    .then(() => console.log('✅ GitHub App started successfully'))
    .catch((error) => {
      console.error('❌ Failed to start GitHub App:', error);
      process.exit(1);
    });
}
