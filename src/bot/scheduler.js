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

console.log('⏰ xCloud Bot Scheduler starting...');

export function startScheduler() {
  console.log('📅 Starting scheduled tasks...');

  // Example scheduled task
  setInterval(() => {
    console.log('🔍 Running periodic repository analysis...');
    // Analysis logic would go here
  }, 60000); // Every minute for demo

  console.log('✅ Scheduler initialized');
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  startScheduler();

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping scheduler...');
    process.exit(0);
  });
}
>>>>>>> 8387d10549a8f95f42469803be4ad415ca20a9b4
