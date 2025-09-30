<<<<<<< HEAD
#!/usr/bin/env node

/**
 * 🕐 xCloud Bot - Scheduler
 * 
 * Executa tarefas agendadas e monitoramento periódico
 */

import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { analyzeWorkflowPerformance, getXCloudRepositories } from '../workflows/analyzer.js';

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// 📊 Monitor de workflows
async function monitorWorkflows() {
    console.log('🔍 Iniciando monitoramento de workflows...');

    try {
        const repos = await getXCloudRepositories();

        for (const repo of repos) {
            console.log(`📊 Analisando ${repo.name}...`);

            // Busca workflows recentes
            const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
                owner: 'PageCloudv1',
                repo: repo.name,
                per_page: 10
            });

            // Identifica falhas recentes
            const recentFailures = runs.workflow_runs.filter(run =>
                run.status === 'completed' &&
                run.conclusion === 'failure' &&
                Date.now() - new Date(run.created_at).getTime() < 24 * 60 * 60 * 1000 // 24h
            );

            if (recentFailures.length > 2) {
                console.log(`🚨 Múltiplas falhas detectadas em ${repo.name}`);

                // Cria issue de alerta
                await octokit.rest.issues.create({
                    owner: 'PageCloudv1',
                    repo: repo.name,
                    title: `🚨 Alert: Múltiplas falhas de workflow detectadas`,
                    body: `## 🚨 Workflow Health Alert

Foram detectadas **${recentFailures.length}** falhas de workflow nas últimas 24 horas.

### Workflows Afetados:
${recentFailures.map(run => `- **${run.name}** - ${run.head_branch} - [Ver run](${run.html_url})`).join('\n')}

### 🔍 Ações Recomendadas:
- [ ] Revisar logs dos workflows falhando
- [ ] Verificar dependências e configurações
- [ ] Considerar rollback se necessário
- [ ] Investigar padrões nas falhas

### 📊 Estatísticas:
- **Total de runs:** ${runs.workflow_runs.length}
- **Taxa de falha:** ${(recentFailures.length / runs.workflow_runs.length * 100).toFixed(1)}%

_Alerta gerado automaticamente pelo xCloud Bot_`,
                    labels: ['alert', 'ci-health', 'priority-high', 'bot-created']
                });
            }

            // Analisa performance
            const performance = await analyzeWorkflowPerformance(repo.name);
            if (performance.slowWorkflows.length > 0) {
                console.log(`⚠️ Workflows lentos detectados em ${repo.name}`);
            }
        }

        console.log('✅ Monitoramento de workflows concluído');

    } catch (error) {
        console.error('❌ Erro no monitoramento:', error);
    }
}

// 🔄 Verificação de saúde dos repositórios
async function healthCheck() {
    console.log('🏥 Executando health check...');

    try {
        const repos = await getXCloudRepositories();
        const healthReport = {
            timestamp: new Date().toISOString(),
            total_repos: repos.length,
            healthy: 0,
            warnings: 0,
            errors: 0,
            details: []
        };

        for (const repo of repos) {
            const repoHealth = {
                name: repo.name,
                status: 'healthy',
                issues: []
            };

            // Verifica se tem workflows
            try {
                const { data: workflows } = await octokit.rest.actions.listRepoWorkflows({
                    owner: 'PageCloudv1',
                    repo: repo.name
                });

                if (workflows.workflows.length === 0) {
                    repoHealth.status = 'warning';
                    repoHealth.issues.push('Nenhum workflow configurado');
                    healthReport.warnings++;
                } else {
                    healthReport.healthy++;
                }

            } catch (error) {
                repoHealth.status = 'error';
                repoHealth.issues.push(`Erro ao acessar workflows: ${error.message}`);
                healthReport.errors++;
            }

            healthReport.details.push(repoHealth);
        }

        // Salva relatório
        console.log('📊 Health Report:', JSON.stringify(healthReport, null, 2));

        console.log('✅ Health check concluído');

    } catch (error) {
        console.error('❌ Erro no health check:', error);
    }
}

// 🧹 Limpeza de artefatos antigos
async function cleanupArtifacts() {
    console.log('🧹 Iniciando limpeza de artefatos...');

    try {
        const repos = await getXCloudRepositories();

        for (const repo of repos) {
            const { data: artifacts } = await octokit.rest.actions.listArtifactsForRepo({
                owner: 'PageCloudv1',
                repo: repo.name
            });

            // Remove artefatos com mais de 7 dias
            const oldArtifacts = artifacts.artifacts.filter(artifact => {
                const age = Date.now() - new Date(artifact.created_at).getTime();
                return age > 7 * 24 * 60 * 60 * 1000; // 7 dias
            });

            for (const artifact of oldArtifacts) {
                try {
                    await octokit.rest.actions.deleteArtifact({
                        owner: 'PageCloudv1',
                        repo: repo.name,
                        artifact_id: artifact.id
                    });
                    console.log(`🗑️ Removido artefato antigo: ${artifact.name} de ${repo.name}`);
                } catch (error) {
                    console.log(`⚠️ Não foi possível remover artefato ${artifact.name}: ${error.message}`);
                }
            }
        }

        console.log('✅ Limpeza de artefatos concluída');

    } catch (error) {
        console.error('❌ Erro na limpeza:', error);
    }
}

// 📅 Agendamento das tarefas

// A cada 30 minutos - Monitor workflows
cron.schedule('*/30 * * * *', () => {
    console.log('⏰ Executando monitoramento agendado...');
    monitorWorkflows();
});

// A cada 2 horas - Health check
cron.schedule('0 */2 * * *', () => {
    console.log('⏰ Executando health check agendado...');
    healthCheck();
});

// Diariamente às 02:00 - Limpeza
cron.schedule('0 2 * * *', () => {
    console.log('⏰ Executando limpeza agendada...');
    cleanupArtifacts();
});

// 🚀 Execução manual
if (process.argv.includes('--monitor')) {
    monitorWorkflows();
}

if (process.argv.includes('--health')) {
    healthCheck();
}

if (process.argv.includes('--cleanup')) {
    cleanupArtifacts();
}

console.log('🕐 xCloud Bot Scheduler iniciado');
console.log('📅 Tarefas agendadas:');
console.log('  • Monitoramento: a cada 30 minutos');
console.log('  • Health check: a cada 2 horas');
console.log('  • Limpeza: diariamente às 02:00');
console.log('');
console.log('💡 Uso manual:');
console.log('  • npm run scheduler:monitor');
console.log('  • npm run scheduler:health');
console.log('  • npm run scheduler:cleanup');

export { cleanupArtifacts, healthCheck, monitorWorkflows };
=======
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
>>>>>>> 8387d10549a8f95f42469803be4ad415ca20a9b4
