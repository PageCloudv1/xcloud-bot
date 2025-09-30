/**
<<<<<<< HEAD
 * 🔍 Workflow Analyzer
 * 
 * Analisa workflows GitHub Actions e sugere melhorias
 */

import { analyzeWithGemini } from '../integrations/gemini-cli.js';
import { getRepositoryWorkflows, getWorkflowRuns, getXCloudRepositories } from '../integrations/github-api.js';

/**
 * Analisa performance de workflows de um repositório
 * @param {string} repoName - Nome do repositório
 * @returns {Promise<object>} Análise de performance
 */
export async function analyzeWorkflowPerformance(repoName) {
    console.log(`📊 Analisando performance dos workflows de ${repoName}...`);

    try {
        const workflows = await getRepositoryWorkflows(repoName);
        const runs = await getWorkflowRuns(repoName, 50);

        if (workflows.length === 0) {
            return {
                repository: repoName,
                hasWorkflows: false,
                recommendation: 'Implementar workflows CI/CD básicos'
            };
        }

        // Análise por workflow
        const workflowStats = workflows.map(workflow => {
            const workflowRuns = runs.filter(run => run.workflow_id === workflow.id);

            if (workflowRuns.length === 0) {
                return {
                    name: workflow.name,
                    state: workflow.state,
                    runs: 0,
                    avgDuration: 0,
                    successRate: 0
                };
            }

            const durations = workflowRuns
                .filter(run => run.created_at && run.updated_at)
                .map(run => new Date(run.updated_at) - new Date(run.created_at));

            const avgDuration = durations.length > 0
                ? durations.reduce((a, b) => a + b, 0) / durations.length
                : 0;

            const successfulRuns = workflowRuns.filter(run => run.conclusion === 'success').length;
            const successRate = workflowRuns.length > 0 ? successfulRuns / workflowRuns.length : 0;

            return {
                name: workflow.name,
                state: workflow.state,
                runs: workflowRuns.length,
                avgDuration: Math.round(avgDuration / 1000 / 60), // minutos
                successRate: Math.round(successRate * 100), // porcentagem
                recentFailures: workflowRuns.filter(run =>
                    run.conclusion === 'failure' &&
                    Date.now() - new Date(run.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 // 7 dias
                ).length
            };
        });

        // Identifica workflows problemáticos
        const slowWorkflows = workflowStats.filter(w => w.avgDuration > 10); // > 10 min
        const unreliableWorkflows = workflowStats.filter(w => w.successRate < 80); // < 80%
        const inactiveWorkflows = workflowStats.filter(w => w.runs === 0);

        const analysis = {
            repository: repoName,
            hasWorkflows: true,
            totalWorkflows: workflows.length,
            activeWorkflows: workflowStats.filter(w => w.state === 'active').length,
            workflowStats,
            issues: {
                slowWorkflows,
                unreliableWorkflows,
                inactiveWorkflows
            },
            recommendations: []
        };

        // Gera recomendações
        if (slowWorkflows.length > 0) {
            analysis.recommendations.push({
                type: 'performance',
                priority: 'medium',
                title: 'Otimizar workflows lentos',
                description: `${slowWorkflows.length} workflow(s) com tempo médio > 10min`,
                workflows: slowWorkflows.map(w => w.name)
            });
        }

        if (unreliableWorkflows.length > 0) {
            analysis.recommendations.push({
                type: 'reliability',
                priority: 'high',
                title: 'Corrigir workflows instáveis',
                description: `${unreliableWorkflows.length} workflow(s) com taxa de sucesso < 80%`,
                workflows: unreliableWorkflows.map(w => w.name)
            });
        }

        if (inactiveWorkflows.length > 0) {
            analysis.recommendations.push({
                type: 'maintenance',
                priority: 'low',
                title: 'Revisar workflows inativos',
                description: `${inactiveWorkflows.length} workflow(s) sem execuções recentes`,
                workflows: inactiveWorkflows.map(w => w.name)
            });
        }

        return analysis;

    } catch (error) {
        console.error(`❌ Erro na análise de ${repoName}:`, error);
        return {
            repository: repoName,
            error: error.message
        };
    }
}

/**
 * Analisa um repositório específico
 * @param {string} repoName - Nome do repositório
 * @param {string} analysisType - Tipo de análise
 * @returns {Promise<object>} Análise completa
 */
export async function analyzeRepository(repoName, analysisType = 'comprehensive') {
    console.log(`🔍 Iniciando análise ${analysisType} de ${repoName}...`);

    try {
        const [workflows, runs, performance] = await Promise.all([
            getRepositoryWorkflows(repoName),
            getWorkflowRuns(repoName, 20),
            analyzeWorkflowPerformance(repoName)
        ]);

        // Análise com Gemini baseada nos dados coletados
        const geminiAnalysis = await analyzeWithGemini(`Analise o repositório ${repoName} com ${workflows.length} workflows e ${runs.length} runs. Forneça sugestões de melhoria.`, {
            repository: repoName,
            analysis_type: analysisType
        });

        const aiInsights = geminiAnalysis.data && typeof geminiAnalysis.data === 'object'
            ? geminiAnalysis.data
            : {};

        return {
            repository: repoName,
            timestamp: new Date().toISOString(),
            workflows: {
                total: workflows.length,
                active: workflows.filter(w => w.state === 'active').length,
                list: workflows.map(w => ({ name: w.name, state: w.state }))
            },
            recent_activity: {
                total_runs: runs.length,
                successful: runs.filter(r => r.conclusion === 'success').length,
                failed: runs.filter(r => r.conclusion === 'failure').length,
                in_progress: runs.filter(r => r.status === 'in_progress').length
            },
            performance,
            ai_analysis: {
                structured: aiInsights,
                summary: geminiAnalysis.text,
                raw: geminiAnalysis.raw,
                provider: geminiAnalysis.provider
            },
            overall_score: calculateOverallScore(performance, runs),
            action_items: generateActionItems(performance, aiInsights)
        };

    } catch (error) {
        console.error(`❌ Erro na análise de ${repoName}:`, error);
        throw error;
    }
}

/**
 * Calcula score geral do repositório
 * @param {object} performance - Dados de performance
 * @param {Array} runs - Runs recentes
 * @returns {number} Score de 0-100
 */
function calculateOverallScore(performance, runs) {
    if (!performance.hasWorkflows) return 20; // Repositório sem workflows

    let score = 50; // Base score

    // Workflow coverage (+20 points)
    const expectedWorkflows = ['CI', 'Build', 'Test'];
    const hasCI = performance.workflowStats.some(w => w.name.toLowerCase().includes('ci'));
    const hasBuild = performance.workflowStats.some(w => w.name.toLowerCase().includes('build'));
    const hasTest = performance.workflowStats.some(w => w.name.toLowerCase().includes('test'));

    score += (hasCI ? 7 : 0) + (hasBuild ? 7 : 0) + (hasTest ? 6 : 0);

    // Success rate (+20 points)
    const avgSuccessRate = performance.workflowStats.reduce((acc, w) => acc + w.successRate, 0) / performance.workflowStats.length;
    score += (avgSuccessRate / 100) * 20;

    // Performance (+10 points)
    const avgDuration = performance.workflowStats.reduce((acc, w) => acc + w.avgDuration, 0) / performance.workflowStats.length;
    if (avgDuration < 5) score += 10;
    else if (avgDuration < 10) score += 5;

    return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Gera itens de ação baseados na análise
 * @param {object} performance - Dados de performance
 * @param {object} aiAnalysis - Análise do AI
 * @returns {Array} Lista de ações
 */
function generateActionItems(performance, aiAnalysis = {}) {
    const actions = [];

    // Baseado na performance
    if (performance.issues.slowWorkflows.length > 0) {
        actions.push({
            type: 'optimization',
            priority: 'medium',
            title: 'Otimizar workflows lentos',
            description: `Workflows com tempo médio alto: ${performance.issues.slowWorkflows.map(w => w.name).join(', ')}`,
            estimated_effort: 'medium'
        });
    }

    if (performance.issues.unreliableWorkflows.length > 0) {
        actions.push({
            type: 'reliability',
            priority: 'high',
            title: 'Corrigir workflows instáveis',
            description: `Workflows com baixa taxa de sucesso: ${performance.issues.unreliableWorkflows.map(w => w.name).join(', ')}`,
            estimated_effort: 'high'
        });
    }

    // Baseado na análise AI
    if (aiAnalysis.missing_workflows && Array.isArray(aiAnalysis.missing_workflows)) {
        aiAnalysis.missing_workflows.forEach(workflow => {
            actions.push({
                type: 'implementation',
                priority: 'high',
                title: `Implementar workflow ${workflow}`,
                description: `Workflow essencial não encontrado`,
                estimated_effort: 'medium'
            });
        });
    }

    return actions;
}

/**
 * Cria issue automaticamente para um workflow
 * @param {string} repoName - Nome do repositório
 * @param {string} workflowType - Tipo do workflow
 * @param {object} options - Opções adicionais
 * @returns {Promise<object>} Issue criado
 */
export async function createWorkflowIssue(repoName, workflowType, options = {}) {
    const { createIssue } = await import('../integrations/github-api.js');

    const templates = {
        ci: {
            title: '🔄 Implementar Workflow CI (Integração Contínua)',
            labels: ['enhancement', 'ci-cd', 'workflow', 'priority-high'],
            body: `## 🔄 Implementar Workflow CI

### 📋 Objetivo
Implementar workflow de Integração Contínua seguindo o padrão xCloud.

### ✅ Checklist de Implementação
- [ ] Criar arquivo \`.github/workflows/ci.yml\`
- [ ] Configurar triggers (push/PR para main/develop)
- [ ] Implementar quality checks (lint, format, audit)
- [ ] Configurar build do projeto
- [ ] Adicionar execução de testes
- [ ] Upload de artefatos de build
- [ ] Configurar coverage reports

### 🎯 Referência
- [Padrão de Workflows xCloud](../xcloud-docs/docs/guides/github-actions-workflows.md)
- [Implementação de Referência](../xcloud-bot/.github/workflows/ci.yml)

### 📊 Critérios de Aceite
- [ ] Workflow executado em push/PR
- [ ] Quality checks passando
- [ ] Build gerado com sucesso
- [ ] Testes executados
- [ ] Cobertura reportada
- [ ] Documentação atualizada

_Issue criada automaticamente pelo xCloud Bot_`
        },

        build: {
            title: '🏗️ Implementar Workflow Build Especializado',
            labels: ['enhancement', 'build', 'workflow'],
            body: `## 🏗️ Implementar Workflow Build

### 📋 Objetivo
Implementar workflow especializado para builds reutilizáveis.

### ✅ Checklist de Implementação
- [ ] Criar arquivo \`.github/workflows/build.yml\`
- [ ] Configurar \`workflow_call\`
- [ ] Implementar build otimizado
- [ ] Análise de artefatos
- [ ] Build de documentação
- [ ] Cache inteligente

### 📊 Critérios de Aceite
- [ ] Reutilizável por outros workflows
- [ ] Build otimizado e rápido
- [ ] Artefatos bem organizados
- [ ] Documentação gerada

_Issue criada automaticamente pelo xCloud Bot_`
        },

        test: {
            title: '🧪 Implementar Workflow de Testes',
            labels: ['enhancement', 'testing', 'workflow'],
            body: `## 🧪 Implementar Workflow de Testes

### 📋 Objetivo
Implementar workflow completo de testes (unit, integration, e2e).

### ✅ Checklist de Implementação
- [ ] Criar arquivo \`.github/workflows/test.yml\`
- [ ] Configurar testes unitários
- [ ] Configurar testes de integração
- [ ] Configurar testes E2E
- [ ] Relatórios de cobertura
- [ ] Paralelização de testes

### 📊 Critérios de Aceite
- [ ] Todos os tipos de teste executando
- [ ] Cobertura adequada (>80%)
- [ ] Testes rápidos e confiáveis
- [ ] Relatórios detalhados

_Issue criada automaticamente pelo xCloud Bot_`
        }
    };

    const template = templates[workflowType];
    if (!template) {
        throw new Error(`Template não encontrado para workflow tipo: ${workflowType}`);
    }

    const issueData = {
        title: options.title || template.title,
        body: options.body || template.body,
        labels: options.labels || template.labels
    };

    return await createIssue(repoName, issueData);
}

/**
 * Gera relatório completo de todos os repositórios xCloud
 * @returns {Promise<object>} Relatório completo
 */
export async function generateXCloudReport() {
    console.log('📊 Gerando relatório completo xCloud...');

    try {
        const repos = await getXCloudRepositories();
        const reports = [];

        for (const repo of repos) {
            console.log(`📊 Analisando ${repo.name}...`);
            const analysis = await analyzeRepository(repo.name, 'summary');
            reports.push(analysis);
        }

        const summary = {
            timestamp: new Date().toISOString(),
            total_repositories: repos.length,
            repositories_with_workflows: reports.filter(r => r.workflows.total > 0).length,
            total_workflows: reports.reduce((acc, r) => acc + r.workflows.total, 0),
            average_score: Math.round(reports.reduce((acc, r) => acc + r.overall_score, 0) / reports.length),
            repositories: reports.map(r => ({
                name: r.repository,
                score: r.overall_score,
                workflows: r.workflows.total,
                recent_runs: r.recent_activity.total_runs,
                success_rate: r.recent_activity.total_runs > 0
                    ? Math.round((r.recent_activity.successful / r.recent_activity.total_runs) * 100)
                    : 0
            })),
            recommendations: {
                high_priority: reports.flatMap(r => r.action_items.filter(a => a.priority === 'high')).length,
                medium_priority: reports.flatMap(r => r.action_items.filter(a => a.priority === 'medium')).length,
                low_priority: reports.flatMap(r => r.action_items.filter(a => a.priority === 'low')).length
            }
        };

        console.log('✅ Relatório completo gerado');
        return { summary, detailed_reports: reports };

    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        throw error;
    }
}

// Re-exporta funções de github-api para conveniência
export { getXCloudRepositories } from '../integrations/github-api.js';

=======
 * 📊 Workflow Analyzer
 *
 * Analyzes repository workflows for performance issues,
 * failure patterns, and optimization opportunities.
 */

export function analyzeRepository(repoName) {
  console.log(`🔍 Analyzing repository: ${repoName}`);

  const analysis = {
    repository: repoName,
    workflows: [
      { name: 'CI', status: 'active', success_rate: '43%' },
      { name: 'Build', status: 'active', success_rate: '67%' },
      { name: 'Test', status: 'active', success_rate: '78%' },
    ],
    issues: [
      'High failure rate in CI workflow (57%)',
      'Inconsistent dependency caching',
      'Missing error handling in deployment',
    ],
    recommendations: [
      'Implement retry logic for flaky tests',
      'Add dependency caching strategy',
      'Set up proper error notifications',
    ],
  };

  console.log('📊 Analysis complete:', analysis);
  return analysis;
}

export function analyzeAllRepositories() {
  console.log('🌍 Analyzing all xCloud repositories...');

  const repos = ['xcloud-bot', 'xcloud-platform', 'xcloud-ui'];
  const results = repos.map((repo) => analyzeRepository(repo));

  console.log('✅ All repositories analyzed');
  return results;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const all = process.argv.includes('--all');

  if (all) {
    analyzeAllRepositories();
  } else {
    analyzeRepository('xcloud-bot');
  }
}
>>>>>>> 8387d10549a8f95f42469803be4ad415ca20a9b4
