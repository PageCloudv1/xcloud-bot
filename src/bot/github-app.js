#!/usr/bin/env node

/**
 * 🤖 xCloud Bot - GitHub App Handler
 * 
 * Bot inteligente para automação da plataforma xCloud
 * Reage a eventos do GitHub e executa ações automatizadas
 */

import { App } from '@octokit/app';
import { Octokit as RestOctokit } from '@octokit/rest';
import { createNodeMiddleware } from '@octokit/webhooks';
import dotenv from 'dotenv';
import express from 'express';
import { analyzeIssue } from '../integrations/gemini-cli.js';
import { analyzeRepository } from '../workflows/analyzer.js';

dotenv.config();

const args = process.argv.slice(2);
const isActEnvironment = process.env.ACT === 'true';
const defaultOwner = process.env.GITHUB_OWNER || 'PageCloudv1';

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY,
    webhooks: {
        secret: process.env.WEBHOOK_SECRET
    }
});

// 🎯 Event Handlers

// Quando um issue é criado
app.webhooks.on('issues.opened', async ({ octokit, payload }) => {
    const { repository, issue } = payload;

    console.log(`🔍 Novo issue criado: ${issue.title} em ${repository.full_name}`);

    try {
        const analysis = await analyzeIssue(issue);

        const candidateLabels = Array.isArray(analysis.labels)
            ? analysis.labels
            : typeof analysis.labels === 'string'
                ? analysis.labels.split(/[,;\n]/)
                    .map(label => label.trim())
                    .filter(Boolean)
                : [];

        const normalizedLabels = candidateLabels
            .map(label => label.replace(/^['"]|['"]$/g, '').trim())
            .filter(Boolean);

        const labelSet = new Set();
        const labels = [];
        for (const label of normalizedLabels) {
            const key = label.toLowerCase();
            if (!labelSet.has(key)) {
                labelSet.add(key);
                labels.push(label);
            }
        }

        if (labels.length > 0) {
            await octokit.rest.issues.addLabels({
                owner: repository.owner.login,
                repo: repository.name,
                issue_number: issue.number,
                labels
            });

            console.log(`✅ Labels adicionadas: ${labels.join(', ')}`);
        }

        const suggestedAssignees = Array.isArray(analysis.assignee_suggestions)
            ? analysis.assignee_suggestions
            : typeof analysis.assignee_suggestions === 'string'
                ? analysis.assignee_suggestions.split(/[,;\n]/)
                    .map(name => name.trim())
                    .filter(Boolean)
                : [];

        const assigneeSet = new Set();
        const assignees = [];
        for (const name of suggestedAssignees) {
            const key = name.toLowerCase();
            if (!assigneeSet.has(key)) {
                assigneeSet.add(key);
                assignees.push(name);
            }
        }

        const commentLines = [
            '🤖 **xCloud Bot Analysis**',
            '',
            '📊 **Análise automática:**',
            `- **Tipo:** ${analysis.type || '—'}`,
            `- **Prioridade:** ${analysis.priority || '—'}`,
            `- **Complexidade:** ${analysis.complexity ?? '—'}`,
            `- **Labels sugeridas:** ${labels.length > 0 ? labels.join(', ') : 'Nenhuma'}`,
            `- **Sugestões de responsável:** ${assignees.length > 0 ? assignees.join(', ') : 'N/A'}`
        ];

        if (analysis.summary) {
            commentLines.push('', '📝 **Resumo:**', analysis.summary);
        }

        commentLines.push('', `_Análise gerada automaticamente pelo xCloud Bot (${analysis.provider ?? 'gemini'})_`);

        await octokit.rest.issues.createComment({
            owner: repository.owner.login,
            repo: repository.name,
            issue_number: issue.number,
            body: commentLines.join('\n')
        });

    } catch (error) {
        console.error('❌ Erro ao analisar issue:', error);
    }
});

// Quando um PR é criado
app.webhooks.on('pull_request.opened', async ({ octokit, payload }) => {
    const { repository, pull_request } = payload;

    console.log(`🔀 Novo PR criado: ${pull_request.title} em ${repository.full_name}`);

    try {
        // Analisa as mudanças do PR
        const files = await octokit.rest.pulls.listFiles({
            owner: repository.owner.login,
            repo: repository.name,
            pull_number: pull_request.number
        });

        const hasWorkflowChanges = files.data.some(file =>
            file.filename.includes('.github/workflows/')
        );

        if (hasWorkflowChanges) {
            await octokit.rest.issues.createComment({
                owner: repository.owner.login,
                repo: repository.name,
                issue_number: pull_request.number,
                body: `🔄 **Workflow Changes Detected**

Este PR contém mudanças em workflows GitHub Actions. 

**Checklist de Revisão:**
- [ ] Sintaxe YAML válida
- [ ] Triggers apropriados
- [ ] Secrets necessários configurados
- [ ] Testes dos workflows

🤖 _Análise automática do xCloud Bot_`
            });
        }

    } catch (error) {
        console.error('❌ Erro ao analisar PR:', error);
    }
});

// Quando um workflow falha
app.webhooks.on('workflow_run.completed', async ({ octokit, payload }) => {
    const { repository, workflow_run } = payload;

    if (workflow_run.conclusion === 'failure') {
        console.log(`❌ Workflow falhou: ${workflow_run.name} em ${repository.full_name}`);

        try {
            // Cria issue automático para falha crítica
            if (workflow_run.name.includes('CI') || workflow_run.name.includes('Deploy')) {
                await octokit.rest.issues.create({
                    owner: repository.owner.login,
                    repo: repository.name,
                    title: `🚨 Falha crítica no workflow: ${workflow_run.name}`,
                    body: `## ❌ Workflow Failure Report

**Workflow:** ${workflow_run.name}
**Branch:** ${workflow_run.head_branch}
**Commit:** ${workflow_run.head_sha.substring(0, 7)}
**Ator:** ${workflow_run.actor.login}
**Tempo:** ${new Date(workflow_run.created_at).toLocaleString()}

**URL do Run:** ${workflow_run.html_url}

### 🔍 Próximos Passos
- [ ] Verificar logs do workflow
- [ ] Identificar causa da falha
- [ ] Corrigir problema
- [ ] Re-executar workflow

_Issue criada automaticamente pelo xCloud Bot_`,
                    labels: ['bug', 'ci-failure', 'priority-high', 'bot-created']
                });

                console.log('✅ Issue de falha criada automaticamente');
            }

        } catch (error) {
            console.error('❌ Erro ao criar issue de falha:', error);
        }
    }
});

function parseRepositoryIdentifier(repoInput) {
    if (!repoInput) {
        return [defaultOwner, 'xcloud-bot'];
    }

    const sanitized = repoInput.trim();

    if (sanitized.includes('/')) {
        const [owner, repo] = sanitized.split('/');
        return [owner || defaultOwner, repo];
    }

    return [defaultOwner, sanitized];
}

async function buildIssueBody(repoFullName) {
    const lines = [
        '## 🤖 xCloud Bot Automated Analysis',
        '',
        `- **Repositório:** ${repoFullName}`,
        `- **Gerado em:** ${new Date().toISOString()}`
    ];

    try {
        const analysis = await analyzeRepository(repoFullName, 'general');

        if (analysis?.summary) {
            lines.push('', '### 📄 Resumo', analysis.summary);
        }

        if (Array.isArray(analysis?.improvements) && analysis.improvements.length > 0) {
            lines.push('', '### ✅ Sugestões de melhoria');
            lines.push(...analysis.improvements.map(item => `- ${item}`));
        }

        if (analysis?.quality_score) {
            lines.push('', `- **Quality score:** ${analysis.quality_score}`);
        }

    } catch (error) {
        lines.push('', `⚠️ Não foi possível gerar análise detalhada: ${error.message}`);
    }

    return lines.join('\n');
}

async function createAnalysisIssue(targetRepo, issueTitle) {
    const [owner, repo] = parseRepositoryIdentifier(targetRepo);
    const fullName = `${owner}/${repo}`;
    const body = await buildIssueBody(fullName);

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    if (!token || isActEnvironment) {
        console.log('⚠️ Token GitHub indisponível ou execução em modo ACT. Simulando criação de issue.');
        console.log(`📝 Issue: ${issueTitle}`);
        console.log(body);
        return;
    }

    const restClient = new RestOctokit({ auth: token });

    try {
        await restClient.rest.issues.create({
            owner,
            repo,
            title: issueTitle,
            body,
            labels: ['bot-created', 'analysis']
        });

        console.log(`✅ Issue criada em https://github.com/${fullName}`);
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            console.warn(`⚠️ Falha de autenticação ao criar issue em ${fullName}: ${error.message}`);
            return;
        }

        throw error;
    }
}

async function main() {
    if (args.includes('--create-issue')) {
        const index = args.indexOf('--create-issue');
        const targetRepo = args[index + 1] || process.env.GITHUB_REPOSITORY || `${defaultOwner}/xcloud-bot`;
        const issueTitle = args[index + 2] || 'Automated Analysis Report';

        await createAnalysisIssue(targetRepo, issueTitle);
        return;
    }

    // 🌐 Express Server para webhooks
    const server = express();
    server.use(express.json());

    // Health check
    server.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            bot: 'xcloud-bot',
            timestamp: new Date().toISOString()
        });
    });

    // Webhook endpoint
    server.use('/webhook', createNodeMiddleware(app.webhooks));

    // API endpoint para análise manual
    server.post('/api/analyze', async (req, res) => {
        try {
            const { repository, type = 'general' } = req.body;

            const analysis = await analyzeRepository(repository, type);

            res.json({
                repository,
                analysis,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
        console.log(`🤖 xCloud Bot rodando na porta ${PORT}`);
        console.log(`🌐 Webhook URL: http://localhost:${PORT}/webhook`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
}

main().catch(error => {
    console.error('❌ Erro ao iniciar o xCloud Bot:', error);
    if (args.includes('--create-issue')) {
        process.exit(1);
    }
});

if (args.includes('--create-issue')) {
    process.on('beforeExit', code => {
        if (code === 0) {
            console.log('✅ Processo de criação de issue concluído');
        }
    });
}

export { app };
