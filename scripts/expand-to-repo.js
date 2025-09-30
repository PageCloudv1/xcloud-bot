#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
const { multiRepoManager } = require('../src/config/multi-repo');
const logger = require('../src/utils/logger');

/**
 * Script para expandir o xCloud Bot para outros repositórios
 */
class RepoExpansion {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: 'xcloud-bot-expansion/1.0.0'
    });
  }

  /**
   * Expande o bot para um repositório específico
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   * @param {Object} options - Opções de configuração
   */
  async expandToRepository(owner, repo, options = {}) {
    try {
      console.log(`🚀 Expandindo xCloud Bot para ${owner}/${repo}...`);

      // Verificar se o repositório existe e temos acesso
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      console.log(`✅ Repositório encontrado: ${repoData.full_name}`);

      // Configuração padrão
      const config = {
        features: {
          autoReview: true,
          geminiIntegration: true,
          issueManagement: true,
          prAutomation: true,
          securityScanning: false,
          performanceMonitoring: false,
          ...options.features
        },
        workflows: {
          'auto-copilot-review': true,
          'enhanced-gemini-cli': true,
          'gemini-review': true,
          'gemini-triage': true,
          ...options.workflows
        }
      };

      // Criar workflows no repositório de destino
      await this.createWorkflows(owner, repo, config);

      // Criar configuração do bot
      await this.createBotConfiguration(owner, repo, config);

      // Atualizar README
      await this.updateReadme(owner, repo);

      // Criar issue de boas-vindas
      await this.createWelcomeIssue(owner, repo, config);

      // Registrar no multi-repo manager (se tiver installationId)
      if (options.installationId) {
        await multiRepoManager.registerRepository(owner, repo, options.installationId, config);
      }

      console.log(`🎉 xCloud Bot expandido com sucesso para ${owner}/${repo}!`);
      
      return {
        success: true,
        repository: `${owner}/${repo}`,
        config
      };

    } catch (error) {
      console.error(`❌ Erro ao expandir para ${owner}/${repo}:`, error.message);
      return {
        success: false,
        repository: `${owner}/${repo}`,
        error: error.message
      };
    }
  }

  /**
   * Cria workflows no repositório de destino
   */
  async createWorkflows(owner, repo, config) {
    console.log('📥 Criando workflows...');

    const workflowsToCreate = [];

    // Auto Copilot Review
    if (config.workflows['auto-copilot-review']) {
      workflowsToCreate.push({
        path: '.github/workflows/auto-copilot-review.yml',
        source: '.github/workflows/auto-copilot-review.yml'
      });
    }

    // Enhanced Gemini CLI
    if (config.workflows['enhanced-gemini-cli']) {
      workflowsToCreate.push({
        path: '.github/workflows/enhanced-gemini-cli.yml',
        source: '.github/workflows/enhanced-gemini-cli.yml'
      });
    }

    // Gemini Review
    if (config.workflows['gemini-review']) {
      workflowsToCreate.push({
        path: '.github/workflows/gemini-review.yml',
        source: '.github/workflows/gemini-review.yml'
      });
    }

    // Gemini Triage
    if (config.workflows['gemini-triage']) {
      workflowsToCreate.push({
        path: '.github/workflows/gemini-triage.yml',
        source: '.github/workflows/gemini-triage.yml'
      });
    }

    // Criar cada workflow
    for (const workflow of workflowsToCreate) {
      try {
        // Ler conteúdo do workflow local
        const workflowPath = path.join(__dirname, '..', workflow.source);
        const content = fs.readFileSync(workflowPath, 'utf8');

        // Verificar se já existe
        let existingFile = null;
        try {
          const { data } = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: workflow.path
          });
          existingFile = data;
        } catch (error) {
          // Arquivo não existe, tudo bem
        }

        if (existingFile) {
          // Atualizar arquivo existente
          await this.octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: workflow.path,
            message: `🤖 Update xCloud Bot workflow: ${path.basename(workflow.path)}`,
            content: Buffer.from(content).toString('base64'),
            sha: existingFile.sha
          });
          console.log(`  ✅ Atualizado: ${workflow.path}`);
        } else {
          // Criar novo arquivo
          await this.octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: workflow.path,
            message: `🤖 Add xCloud Bot workflow: ${path.basename(workflow.path)}`,
            content: Buffer.from(content).toString('base64')
          });
          console.log(`  ✅ Criado: ${workflow.path}`);
        }

        // Aguardar um pouco entre criações
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  ❌ Erro ao criar ${workflow.path}:`, error.message);
      }
    }
  }

  /**
   * Cria configuração do bot no repositório
   */
  async createBotConfiguration(owner, repo, config) {
    console.log('📄 Criando configuração do bot...');

    const configContent = {
      repository: `${owner}/${repo}`,
      features: config.features,
      workflows: config.workflows,
      setupDate: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      // Verificar se já existe
      let existingFile = null;
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: '.xcloud-bot/config.json'
        });
        existingFile = data;
      } catch (error) {
        // Arquivo não existe
      }

      const content = JSON.stringify(configContent, null, 2);

      if (existingFile) {
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: '.xcloud-bot/config.json',
          message: '🤖 Update xCloud Bot configuration',
          content: Buffer.from(content).toString('base64'),
          sha: existingFile.sha
        });
      } else {
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: '.xcloud-bot/config.json',
          message: '🤖 Add xCloud Bot configuration',
          content: Buffer.from(content).toString('base64')
        });
      }

      console.log('  ✅ Configuração criada!');
    } catch (error) {
      console.error('  ❌ Erro ao criar configuração:', error.message);
    }
  }

  /**
   * Atualiza README com seção do bot
   */
  async updateReadme(owner, repo) {
    console.log('📚 Atualizando README...');

    try {
      // Obter README atual
      let readmeData = null;
      let readmePath = 'README.md';

      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: readmePath
        });
        readmeData = data;
      } catch (error) {
        // README não existe, será criado
      }

      const botSection = `

## 🤖 xCloud Bot

Este repositório está integrado com o xCloud Bot para automação e assistência em desenvolvimento.

### Features Ativas

- ✅ **Auto Review**: Reviews automáticos com @Copilot
- 🧠 **Gemini Integration**: Análise de código com IA
- 📝 **Issue Management**: Gerenciamento inteligente de issues
- 🔄 **PR Automation**: Automação de pull requests

### Como Usar

O bot responde automaticamente a:
- Novos issues e pull requests
- Comentários mencionando @Copilot
- Comandos específicos nos comentários

### Comandos Disponíveis

- \`@Copilot review this\` - Solicita review detalhado
- \`@Copilot analyze code\` - Análise de código
- \`@Copilot suggest improvements\` - Sugestões de melhorias
- \`@Copilot security scan\` - Verificação de segurança

---
*Powered by [xCloud Bot](https://github.com/PageCloudv1/xcloud-bot)*`;

      let newContent;

      if (readmeData) {
        // README existe, verificar se já tem seção do bot
        const currentContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
        
        if (currentContent.includes('## 🤖 xCloud Bot')) {
          console.log('  ℹ️ Seção do xCloud Bot já existe no README');
          return;
        }

        newContent = currentContent + botSection;
      } else {
        // Criar novo README
        newContent = `# ${repo}${botSection}`;
      }

      if (readmeData) {
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: readmePath,
          message: '🤖 Add xCloud Bot section to README',
          content: Buffer.from(newContent).toString('base64'),
          sha: readmeData.sha
        });
      } else {
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: readmePath,
          message: '🤖 Create README with xCloud Bot section',
          content: Buffer.from(newContent).toString('base64')
        });
      }

      console.log('  ✅ README atualizado!');
    } catch (error) {
      console.error('  ❌ Erro ao atualizar README:', error.message);
    }
  }

  /**
   * Cria issue de boas-vindas
   */
  async createWelcomeIssue(owner, repo, config) {
    console.log('🎉 Criando issue de boas-vindas...');

    const welcomeMessage = `# 🎉 xCloud Bot Configurado com Sucesso!

Olá! O xCloud Bot foi configurado neste repositório e está pronto para ajudar.

## 🚀 Features Ativas

${Object.entries(config.features)
  .filter(([_, enabled]) => enabled)
  .map(([feature, _]) => `- ✅ **${feature}**`)
  .join('\n')}

## 🤖 Como Usar

O bot agora responderá automaticamente a:

- **Novos Issues**: Análise automática e triagem
- **Pull Requests**: Reviews automáticos e sugestões
- **Comentários**: Responde a menções e comandos

## 📋 Comandos Disponíveis

Você pode usar os seguintes comandos nos comentários:

- \`@Copilot review this\` - Solicita review detalhado
- \`@Copilot analyze code\` - Análise de código
- \`@Copilot suggest improvements\` - Sugestões de melhorias
- \`@Copilot security scan\` - Verificação de segurança

## 🔧 Configuração

A configuração do bot está em \`.xcloud-bot/config.json\`. Você pode modificar as features ativas editando este arquivo.

## 📚 Documentação

Para mais informações, consulte a [documentação completa](https://github.com/PageCloudv1/xcloud-bot).

---

**Próximos Passos:**
1. ✅ Bot configurado
2. 🔄 Teste criando um novo issue ou PR
3. 🎯 Personalize as configurações conforme necessário

*Este issue foi criado automaticamente pela expansão do xCloud Bot.*`;

    try {
      await this.octokit.rest.issues.create({
        owner,
        repo,
        title: '🤖 xCloud Bot - Configuração Concluída',
        body: welcomeMessage,
        labels: ['xcloud-bot', 'setup', 'documentation']
      });

      console.log('  ✅ Issue de boas-vindas criado!');
    } catch (error) {
      console.error('  ❌ Erro ao criar issue:', error.message);
    }
  }

  /**
   * Expande para múltiplos repositórios
   */
  async expandToMultipleRepositories(repositories, options = {}) {
    console.log(`🚀 Expandindo para ${repositories.length} repositórios...`);

    const results = [];

    for (const repoInfo of repositories) {
      const [owner, repo] = repoInfo.split('/');
      const result = await this.expandToRepository(owner, repo, {
        ...options,
        ...repoInfo.options
      });
      results.push(result);

      // Aguardar entre expansões para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Resumo
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 Resumo da expansão:`);
    console.log(`  ✅ Sucessos: ${successful}`);
    console.log(`  ❌ Falhas: ${failed}`);

    if (failed > 0) {
      console.log(`\n❌ Repositórios com falha:`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.repository}: ${r.error}`);
      });
    }

    return results;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🤖 xCloud Bot Repository Expansion

Uso:
  node expand-to-repo.js <owner/repo> [options]
  node expand-to-repo.js --batch <file.json>

Exemplos:
  node expand-to-repo.js PageCloudv1/my-project
  node expand-to-repo.js --batch repos.json

Variáveis de ambiente necessárias:
  GITHUB_TOKEN - Token do GitHub com permissões adequadas
`);
    process.exit(1);
  }

  const expansion = new RepoExpansion();

  if (args[0] === '--batch') {
    // Expansão em lote
    const batchFile = args[1];
    if (!batchFile) {
      console.error('❌ Arquivo de lote não especificado');
      process.exit(1);
    }

    try {
      const repositories = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
      expansion.expandToMultipleRepositories(repositories);
    } catch (error) {
      console.error('❌ Erro ao ler arquivo de lote:', error.message);
      process.exit(1);
    }
  } else {
    // Expansão única
    const [owner, repo] = args[0].split('/');
    if (!owner || !repo) {
      console.error('❌ Formato inválido. Use: owner/repo');
      process.exit(1);
    }

    expansion.expandToRepository(owner, repo);
  }
}

module.exports = { RepoExpansion };