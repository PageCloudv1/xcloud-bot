#!/usr/bin/env node

/**
 * 🤖 xCloud Bot - GitHub App Handler
 * 
 * Bot inteligente para automação da plataforma xCloud
 * Reage a eventos do GitHub e executa ações automatizadas
 */

import { App } from '@octokit/app';
import { createNodeMiddleware } from '@octokit/webhooks';
import dotenv from 'dotenv';
import express from 'express';
import { analyzeWithGemini } from '../integrations/gemini-cli.js';
import { analyzeRepository } from '../workflows/analyzer.js';

dotenv.config();

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
        // Analisa o issue com Gemini
        const analysis = await analyzeWithGemini(`
      Analise este issue do GitHub e sugira labels apropriadas:
      
      Título: ${issue.title}
      Corpo: ${issue.body}
      
      Repositório: ${repository.name}
      
      Retorne apenas um JSON com:
      {
        "labels": ["label1", "label2"],
        "priority": "high|medium|low",
        "type": "bug|feature|enhancement|documentation"
      }
    `);

        if (analysis.labels && analysis.labels.length > 0) {
            await octokit.rest.issues.addLabels({
                owner: repository.owner.login,
                repo: repository.name,
                issue_number: issue.number,
                labels: analysis.labels
            });

            console.log(`✅ Labels adicionadas: ${analysis.labels.join(', ')}`);
        }

        // Comenta no issue
        await octokit.rest.issues.createComment({
            owner: repository.owner.login,
            repo: repository.name,
            issue_number: issue.number,
            body: `🤖 **xCloud Bot Analysis**

📊 **Análise automática:**
- **Tipo:** ${analysis.type}
- **Prioridade:** ${analysis.priority}
- **Labels sugeridas:** ${analysis.labels?.join(', ')}

_Análise gerada automaticamente pelo xCloud Bot_`
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

export { app };
