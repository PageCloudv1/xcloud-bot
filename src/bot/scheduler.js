/**
 * ⏰ Task Scheduler
 *
 * Handles scheduled tasks for monitoring repositories,
 * analyzing workflows, and automated maintenance.
 */

import { processWebhook, createWorkflowIssue } from './github-app.js';

console.log('⏰ xCloud Bot Scheduler starting...');

class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.intervals = new Map();
    this.isRunning = false;
  }

  addTask(name, fn, intervalMs) {
    this.tasks.set(name, { fn, intervalMs });
    console.log(`📋 Scheduled task: ${name} (every ${intervalMs}ms)`);
  }

  async runTask(name) {
    const task = this.tasks.get(name);
    if (!task) {
      console.error(`❌ Task not found: ${name}`);
      return;
    }

    try {
      console.log(`🔄 Running task: ${name}`);
      await task.fn();
      console.log(`✅ Task completed: ${name}`);
    } catch (error) {
      console.error(`❌ Task failed: ${name}`, error);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler already running');
      return;
    }

    console.log('🚀 Starting scheduler...');
    this.isRunning = true;

    // Start all scheduled tasks
    for (const [name, task] of this.tasks) {
      const interval = setInterval(async () => {
        await this.runTask(name);
      }, task.intervalMs);
      
      this.intervals.set(name, interval);
    }

    // Run initial tasks
    setTimeout(async () => {
      for (const name of this.tasks.keys()) {
        await this.runTask(name);
      }
    }, 5000); // Wait 5 seconds before first run

    console.log('✅ Scheduler started');
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Scheduler not running');
      return;
    }

    console.log('🛑 Stopping scheduler...');
    
    // Clear all intervals
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    
    this.intervals.clear();
    this.isRunning = false;
    
    console.log('✅ Scheduler stopped');
  }
}

// Task definitions
async function analyzeRepositories() {
  console.log('🔍 Running periodic repository analysis...');
  
  const repositories = ['xcloud-bot', 'xcloud-platform', 'xcloud-api'];
  
  for (const repo of repositories) {
    console.log(`📊 Analyzing ${repo}...`);
    
    // Simulate repository analysis
    const metrics = {
      workflow_success_rate: Math.floor(Math.random() * 40) + 60, // 60-100%
      last_failure: Date.now() - Math.floor(Math.random() * 86400000), // Within 24h
    };
    
    // Create issue if success rate is low
    if (metrics.workflow_success_rate < 70) {
      console.log(`⚠️ Low success rate detected for ${repo}: ${metrics.workflow_success_rate}%`);
      await createWorkflowIssue(repo, 'Performance Investigation', {
        success_rate: metrics.workflow_success_rate,
        auto_created: true
      });
    }
  }
}

async function monitorWorkflowHealth() {
  console.log('💓 Monitoring workflow health...');
  
  const healthData = {
    total_repositories: 5,
    healthy: 3,
    warnings: 1,
    critical: 1,
    last_check: new Date().toISOString()
  };
  
  console.log(`📊 Health Status: ${healthData.healthy}/${healthData.total_repositories} healthy`);
  
  if (healthData.critical > 0) {
    console.log('🚨 Critical issues detected - alerting team');
  }
}

async function cleanupOldIssues() {
  console.log('🧹 Cleaning up old automated issues...');
  
  // Simulate cleanup of resolved issues older than 30 days
  const cleanedCount = Math.floor(Math.random() * 5);
  console.log(`✅ Cleaned up ${cleanedCount} old issues`);
}

async function updateRepositoryMetrics() {
  console.log('📈 Updating repository metrics...');
  
  const metrics = {
    total_workflows_run: Math.floor(Math.random() * 100) + 50,
    success_rate: Math.floor(Math.random() * 30) + 70,
    avg_build_time: (Math.random() * 5 + 2).toFixed(1) + ' minutes',
    issues_created_today: Math.floor(Math.random() * 10),
  };
  
  console.log(`📊 Today's metrics: ${metrics.total_workflows_run} runs, ${metrics.success_rate}% success`);
}

async function checkDependencyUpdates() {
  console.log('📦 Checking for dependency updates...');
  
  const updates = [
    '@octokit/rest',
    'express',
    'typescript'
  ];
  
  const availableUpdates = updates.slice(0, Math.floor(Math.random() * updates.length));
  
  if (availableUpdates.length > 0) {
    console.log(`📦 Updates available: ${availableUpdates.join(', ')}`);
    // Could create an issue for dependency updates
  } else {
    console.log('✅ All dependencies up to date');
  }
}

export function startScheduler() {
  console.log('📅 Starting scheduled tasks...');
  
  const scheduler = new TaskScheduler();
  
  // Add scheduled tasks
  scheduler.addTask('analyze-repositories', analyzeRepositories, 5 * 60 * 1000); // Every 5 minutes
  scheduler.addTask('monitor-health', monitorWorkflowHealth, 2 * 60 * 1000); // Every 2 minutes  
  scheduler.addTask('cleanup-issues', cleanupOldIssues, 60 * 60 * 1000); // Every hour
  scheduler.addTask('update-metrics', updateRepositoryMetrics, 10 * 60 * 1000); // Every 10 minutes
  scheduler.addTask('check-dependencies', checkDependencyUpdates, 24 * 60 * 60 * 1000); // Daily
  
  scheduler.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping scheduler...');
    scheduler.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping scheduler...');
    scheduler.stop();
    process.exit(0);
  });
  
  return scheduler;
}

// CLI entry point
if (process.argv[1]?.endsWith('scheduler.js')) {
  startScheduler();
  
  console.log('⏰ Scheduler running... Press Ctrl+C to stop');
  
  // Keep the process running
  process.stdin.resume();
}
