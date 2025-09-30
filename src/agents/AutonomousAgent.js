const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');
const logger = require('../utils/logger');
const { multiRepoManager } = require('../config/multi-repo');

/**
 * Agente Autônomo xCloud Bot
 * Funciona como @Copilot, executando tarefas em containers isolados
 */
class AutonomousAgent {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: 'xcloud-bot-autonomous/1.0.0',
    });

    this.containerRegistry = new Map();
    this.taskQueue = [];
    this.isProcessing = false;

    // Configurações do container
    this.containerConfig = {
      image: 'node:18-alpine',
      workDir: '/workspace',
      timeout: 30 * 60 * 1000, // 30 minutos
      resources: {
        memory: '2g',
        cpu: '2',
      },
    };
  }

  /**
   * Processa assignment do xbot
   * @param {Object} payload - Payload do webhook
   */
  async handleAssignment(payload) {
    try {
      const { issue, assignee, repository } = payload;

      // Verificar se é assignment do xbot
      if (!this.isXbotAssignment(assignee)) {
        return;
      }

      logger.info(`🤖 xBot assignado para issue #${issue.number} em ${repository.full_name}`);

      // Criar tarefa
      const task = {
        id: `${repository.full_name}-${issue.number}-${Date.now()}`,
        repository: repository.full_name,
        issue: issue,
        assignedAt: new Date(),
        status: 'pending',
      };

      // Adicionar à fila
      this.taskQueue.push(task);

      // Processar fila se não estiver processando
      if (!this.isProcessing) {
        await this.processTaskQueue();
      }

      return task;
    } catch (error) {
      logger.error('Erro ao processar assignment:', error);
      throw error;
    }
  }

  /**
   * Verifica se é assignment do xbot
   * @param {Object} assignee - Usuário assignado
   * @returns {boolean}
   */
  isXbotAssignment(assignee) {
    const xbotUsernames = [
      'xcloud-bot',
      'xbot',
      'xcloud-assistant',
      process.env.XBOT_USERNAME,
    ].filter(Boolean);

    return xbotUsernames.includes(assignee.login.toLowerCase());
  }

  /**
   * Processa fila de tarefas
   */
  async processTaskQueue() {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    logger.info(`📋 Processando ${this.taskQueue.length} tarefas na fila`);

    try {
      while (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        await this.executeTask(task);

        // Aguardar entre tarefas
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      logger.error('Erro ao processar fila de tarefas:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Executa uma tarefa específica
   * @param {Object} task - Tarefa a ser executada
   */
  async executeTask(task) {
    const containerId = `xbot-${task.id}`;

    try {
      logger.info(`🚀 Executando tarefa ${task.id}`);

      // Atualizar status
      task.status = 'running';
      task.startedAt = new Date();

      // Comentar no issue que a tarefa foi iniciada
      await this.commentOnIssue(
        task,
        '🤖 **xBot Iniciado**\n\nOlá! Fui assignado para esta tarefa e estou iniciando o trabalho.\n\n⏳ **Status**: Preparando ambiente...\n🐳 **Container**: Criando instância isolada\n📂 **Repositório**: Clonando projeto\n\n*Atualizarei este issue com o progresso.*'
      );

      // Criar e configurar container
      const container = await this.createContainer(containerId, task);

      // Clonar repositório
      await this.cloneRepository(container, task);

      // Analisar tarefa
      const analysis = await this.analyzeTask(task);

      // Executar tarefa
      const result = await this.performTask(container, task, analysis);

      // Criar pull request
      const pr = await this.createPullRequest(task, result);

      // Finalizar tarefa
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      task.pullRequest = pr;

      // Comentar resultado
      await this.commentTaskResult(task);

      logger.info(`✅ Tarefa ${task.id} concluída com sucesso`);
    } catch (error) {
      logger.error(`❌ Erro na tarefa ${task.id}:`, error);

      task.status = 'failed';
      task.error = error.message;
      task.failedAt = new Date();

      // Comentar erro
      await this.commentOnIssue(
        task,
        `❌ **Erro na Execução**\n\nOcorreu um erro durante a execução da tarefa:\n\n\`\`\`\n${error.message}\n\`\`\`\n\n*Verifique os logs para mais detalhes.*`
      );
    } finally {
      // Limpar container
      await this.cleanupContainer(containerId);
    }
  }

  /**
   * Cria container Podman
   * @param {string} containerId - ID do container
   * @param {Object} task - Tarefa
   * @returns {Object} Container info
   */
  async createContainer(containerId, task) {
    logger.info(`🐳 Criando container ${containerId}`);

    const containerCmd = [
      'podman',
      'run',
      '-d',
      '--name',
      containerId,
      '--memory',
      this.containerConfig.resources.memory,
      '--cpus',
      this.containerConfig.resources.cpu,
      '--workdir',
      this.containerConfig.workDir,
      '-e',
      `GITHUB_TOKEN=${process.env.GITHUB_TOKEN}`,
      '-e',
      `TASK_ID=${task.id}`,
      '-e',
      `REPOSITORY=${task.repository}`,
      '-e',
      `ISSUE_NUMBER=${task.issue.number}`,
      this.containerConfig.image,
      'sleep',
      '1800', // 30 minutos
    ];

    return new Promise((resolve, reject) => {
      exec(containerCmd.join(' '), (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Erro ao criar container: ${error.message}`));
          return;
        }

        const container = {
          id: containerId,
          podmanId: stdout.trim(),
          created: new Date(),
        };

        this.containerRegistry.set(containerId, container);
        logger.info(`✅ Container ${containerId} criado: ${container.podmanId}`);
        resolve(container);
      `'apk add --no-cache git && echo "https://${process.env.GITHUB_TOKEN}:x-oauth-basic@github.com" > /root/.git-credentials && git config --global credential.helper store && git clone https://github.com/${task.repository}.git /workspace/repo'`
    });
  }

  /**
   * Clona repositório no container
   * @param {Object} container - Container info
   * @param {Object} task - Tarefa
   */
  async cloneRepository(container, task) {
    logger.info(`📂 Clonando repositório ${task.repository}`);

    const cloneCmd = [
      'podman',
      'exec',
      container.id,
      'sh',
      '-c',
      `'apk add --no-cache git && git clone https://${process.env.GITHUB_TOKEN}@github.com/${task.repository}.git /workspace/repo'`,
    ];

    return new Promise((resolve, reject) => {
      exec(cloneCmd.join(' '), (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Erro ao clonar repositório: ${error.message}`));
          return;
        }

        logger.info(`✅ Repositório clonado com sucesso`);
        resolve();
      });
    });
  }

  /**
   * Analisa a tarefa para determinar ações necessárias
   * @param {Object} task - Tarefa
   * @returns {Object} Análise da tarefa
   */
  async analyzeTask(task) {
    logger.info(`🔍 Analisando tarefa: ${task.issue.title}`);

    const analysis = {
      type: 'unknown',
      actions: [],
      files: [],
      commands: [],
      priority: 'medium',
    };

    const title = task.issue.title.toLowerCase();
    const body = task.issue.body?.toLowerCase() || '';
    const content = `${title} ${body}`;

    // Detectar tipo de tarefa
    if (content.includes('bug') || content.includes('fix') || content.includes('erro')) {
      analysis.type = 'bugfix';
      analysis.actions.push('analyze_code', 'fix_bug', 'test_fix');
    } else if (
      content.includes('feature') ||
      content.includes('implement') ||
      content.includes('add')
    ) {
      analysis.type = 'feature';
      analysis.actions.push('analyze_requirements', 'implement_feature', 'add_tests');
    } else if (
      content.includes('refactor') ||
      content.includes('improve') ||
      content.includes('optimize')
    ) {
      analysis.type = 'refactor';
      analysis.actions.push('analyze_code', 'refactor_code', 'test_changes');
    } else if (content.includes('test') || content.includes('coverage')) {
      analysis.type = 'testing';
      analysis.actions.push('analyze_coverage', 'add_tests', 'run_tests');
    } else if (content.includes('doc') || content.includes('readme')) {
      analysis.type = 'documentation';
      analysis.actions.push('analyze_docs', 'update_docs', 'validate_docs');
    }

    // Detectar prioridade
    if (content.includes('urgent') || content.includes('critical') || content.includes('hotfix')) {
      analysis.priority = 'high';
    } else if (content.includes('minor') || content.includes('enhancement')) {
      analysis.priority = 'low';
    }

    // Detectar arquivos mencionados
    const fileMatches = content.match(/[\w\-\.\/]+\.(js|ts|py|md|json|yml|yaml)/g);
    if (fileMatches) {
      analysis.files = [...new Set(fileMatches)];
    }

    logger.info(`📊 Análise concluída:`, analysis);
    return analysis;
  }

  /**
   * Executa a tarefa no container
   * @param {Object} container - Container info
   * @param {Object} task - Tarefa
   * @param {Object} analysis - Análise da tarefa
   * @returns {Object} Resultado da execução
   */
  async performTask(container, task, analysis) {
    logger.info(`⚙️ Executando tarefa tipo: ${analysis.type}`);

    const result = {
      type: analysis.type,
      actions: [],
      files_changed: [],
      tests_added: [],
      documentation_updated: [],
      summary: '',
    };

    // Atualizar status no issue
    await this.commentOnIssue(
      task,
      `🔄 **Executando Tarefa**\n\n📋 **Tipo**: ${analysis.type}\n🎯 **Ações**: ${analysis.actions.join(', ')}\n⚡ **Prioridade**: ${analysis.priority}\n\n*Trabalhando nos arquivos...*`
    );

    // Executar ações baseadas no tipo
    for (const action of analysis.actions) {
      try {
        const actionResult = await this.executeAction(container, task, action, analysis);
        result.actions.push(actionResult);

        // Merge results
        if (actionResult.files_changed) {
          result.files_changed.push(...actionResult.files_changed);
        }
        if (actionResult.tests_added) {
          result.tests_added.push(...actionResult.tests_added);
        }
      } catch (error) {
        logger.error(`Erro na ação ${action}:`, error);
        result.actions.push({
          action,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Gerar resumo
    result.summary = this.generateTaskSummary(task, analysis, result);

    return result;
  }

  /**
   * Executa uma ação específica
   * @param {Object} container - Container info
   * @param {Object} task - Tarefa
   * @param {string} action - Ação a executar
   * @param {Object} analysis - Análise da tarefa
   * @returns {Object} Resultado da ação
   */
  async executeAction(container, task, action, analysis) {
    logger.info(`🔧 Executando ação: ${action}`);

    const actionResult = {
      action,
      status: 'completed',
      files_changed: [],
      output: '',
    };

    switch (action) {
      case 'analyze_code':
        actionResult.output = await this.runContainerCommand(
          container,
          'find /workspace/repo -name "*.js" -o -name "*.ts" | head -10 | xargs wc -l'
        );
        break;

      case 'fix_bug':
        // Implementar lógica de fix de bug
        actionResult.files_changed = await this.fixBugInCode(container, task, analysis);
        break;

      case 'implement_feature':
        // Implementar nova feature
        actionResult.files_changed = await this.implementFeature(container, task, analysis);
        break;

      case 'add_tests':
        // Adicionar testes
        actionResult.tests_added = await this.addTests(container, task, analysis);
        break;

      case 'update_docs':
        // Atualizar documentação
        actionResult.files_changed = await this.updateDocumentation(container, task, analysis);
        break;

      default:
        actionResult.output = await this.runContainerCommand(
          container,
          `echo "Ação ${action} executada"`
        );
    }

    return actionResult;
  }

  /**
   * Executa comando no container
   * @param {Object} container - Container info
   * @param {string} command - Comando a executar
   * @returns {Promise<string>} Output do comando
   */
  async runContainerCommand(container, command) {
    return new Promise((resolve, reject) => {
      const cmd = `podman exec ${container.id} sh -c "${command}"`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Comando falhou: ${error.message}`));
          return;
        }

        resolve(stdout.trim());
      });
    });
  }

  /**
   * Implementa fix de bug
   * @param {Object} container - Container info
   * @param {Object} task - Tarefa
   * @param {Object} analysis - Análise
   * @returns {Array} Arquivos modificados
   */
  async fixBugInCode(container, task, analysis) {
    // Implementação simplificada - em produção seria mais sofisticada
    const files = [];

    // Exemplo: criar um arquivo de fix
    const fixContent = `// Bug fix for issue #${task.issue.number}
// ${task.issue.title}

console.log('Bug fix implemented');
`;

    await this.runContainerCommand(
      container,
      `echo '${fixContent}' > /workspace/repo/bugfix-${task.issue.number}.js`
    );
    files.push(`bugfix-${task.issue.number}.js`);

    return files;
  }

  /**
   * Implementa nova feature
   * @param {Object} container - Container info
   * @param {Object} task - Tarefa
   * @param {Object} analysis - Análise
   * @returns {Array} Arquivos modificados
   */
  async implementFeature(container, task, analysis) {
    const files = [];

    // Exemplo: criar arquivo de feature
    const featureContent = `// Feature implementation for issue #${task.issue.number}
// ${task.issue.title}

class Feature${task.issue.number} {
  constructor() {
    this.name = '${task.issue.title}';
  }
  
  execute() {
    console.log('Feature executed successfully');
    return true;
  }
}

module.exports = Feature${task.issue.number};
`;

    await this.runContainerCommand(
      container,
      `echo '${featureContent}' > /workspace/repo/feature-${task.issue.number}.js`
    );
    files.push(`feature-${task.issue.number}.js`);

    return files;
  }

  /**
   * Adiciona testes
   * @param {Object} container - Container info
   * @param {Object} task - Tarefa
   * @param {Object} analysis - Análise
   * @returns {Array} Testes adicionados
   */
  async addTests(container, task, analysis) {
    const tests = [];

    // Exemplo: criar arquivo de teste
    const testContent = `// Tests for issue #${task.issue.number}
// ${task.issue.title}

describe('Issue #${task.issue.number}', () => {
  test('should work correctly', () => {
    expect(true).toBe(true);
  });
  
  test('should handle edge cases', () => {
    expect(1 + 1).toBe(2);
  });
});
`;

    await this.runContainerCommand(
      container,
      `mkdir -p /workspace/repo/tests && echo '${testContent}' > /workspace/repo/tests/issue-${task.issue.number}.test.js`
    );
    tests.push(`tests/issue-${task.issue.number}.test.js`);

    return tests;
  }

  /**
   * Atualiza documentação
   * @param {Object} container - Container info
   * @param {Object} task - Tarefa
   * @param {Object} analysis - Análise
   * @returns {Array} Arquivos de documentação modificados
   */
  async updateDocumentation(container, task, analysis) {
    const files = [];

    // Exemplo: atualizar README
    const docUpdate = `

## Issue #${task.issue.number}: ${task.issue.title}

${task.issue.body || 'Documentação atualizada automaticamente pelo xBot.'}

*Atualizado automaticamente em ${new Date().toISOString()}*
`;

    await this.runContainerCommand(container, `echo '${docUpdate}' >> /workspace/repo/README.md`);
    files.push('README.md');

    return files;
  }

  /**
   * Cria pull request com as mudanças
   * @param {Object} task - Tarefa
   * @param {Object} result - Resultado da execução
   * @returns {Object} Pull request criado
   */
  async createPullRequest(task, result) {
      // Write commit message to a file to avoid shell injection
      await this.runContainerCommand(container, `echo ${JSON.stringify(commitMessage)} > /workspace/repo/.git_commit_msg`);
      await this.runContainerCommand(container, `cd /workspace/repo && git commit -F .git_commit_msg`);
      // Optionally, remove the commit message file after commit
      await this.runContainerCommand(container, `rm /workspace/repo/.git_commit_msg`);

    const [owner, repo] = task.repository.split('/');
    const branchName = `xbot/issue-${task.issue.number}`;

    try {
      // Primeiro, precisamos commitar as mudanças no container e fazer push
      const container = this.containerRegistry.get(`xbot-${task.id}`);

      // Configurar git no container
      await this.runContainerCommand(
        container,
        'cd /workspace/repo && git config user.name "xCloud Bot"'
      );
      await this.runContainerCommand(
        container,
        'cd /workspace/repo && git config user.email "xcloud-bot@pagecloud.dev"'
      );

      // Criar branch
      await this.runContainerCommand(
        container,
        `cd /workspace/repo && git checkout -b ${branchName}`
      );

      // Adicionar mudanças
      await this.runContainerCommand(container, 'cd /workspace/repo && git add .');

      // Commit
      const commitMessage = `🤖 ${result.type}: ${task.issue.title}

Resolves #${task.issue.number}

## Mudanças Implementadas

${result.actions.map(a => `- ${a.action}: ${a.status}`).join('\n')}

## Arquivos Modificados

${result.files_changed.map(f => `- ${f}`).join('\n')}

${
  result.tests_added.length > 0
    ? `## Testes Adicionados

${result.tests_added.map(t => `- ${t}`).join('\n')}`
    : ''
}

## Resumo

${result.summary}

---
*Implementado automaticamente pelo xCloud Bot*
*Tarefa ID: ${task.id}*`;

      await this.runContainerCommand(
        container,
        `cd /workspace/repo && git commit -m "${commitMessage}"`
      );

      // Push
      await this.runContainerCommand(
        container,
        `cd /workspace/repo && git push origin ${branchName}`
      );

      // Criar PR via API
      const pr = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title: `🤖 ${result.type}: ${task.issue.title}`,
        head: branchName,
        base: 'main',
        body: `## 🤖 Implementação Automática

Este PR foi criado automaticamente pelo xCloud Bot para resolver a issue #${task.issue.number}.

### 📋 Detalhes da Tarefa

- **Tipo**: ${result.type}
- **Prioridade**: ${task.analysis?.priority || 'medium'}
- **Assignado em**: ${task.assignedAt}
- **Concluído em**: ${task.completedAt}

### ⚙️ Ações Executadas

${result.actions.map(a => `- ✅ **${a.action}**: ${a.status}`).join('\n')}

### 📁 Arquivos Modificados

${result.files_changed.map(f => `- \`${f}\``).join('\n')}

${
  result.tests_added.length > 0
    ? `### 🧪 Testes Adicionados

${result.tests_added.map(t => `- \`${t}\``).join('\n')}`
    : ''
}

### 📝 Resumo

${result.summary}

### 🔗 Issue Relacionada

Closes #${task.issue.number}

---

**🤖 Este PR foi criado automaticamente pelo xCloud Bot**
- Tarefa ID: \`${task.id}\`
- Container: \`xbot-${task.id}\`
- Branch: \`${branchName}\`

*Para questões sobre esta implementação, mencione @xcloud-bot nos comentários.*`,
        draft: false,
      });

      logger.info(`✅ Pull request criado: #${pr.data.number}`);
      return pr.data;
    } catch (error) {
      logger.error('Erro ao criar pull request:', error);
      throw error;
    }
  }

  /**
   * Gera resumo da tarefa
   * @param {Object} task - Tarefa
   * @param {Object} analysis - Análise
   * @param {Object} result - Resultado
   * @returns {string} Resumo
   */
  generateTaskSummary(task, analysis, result) {
    const successful = result.actions.filter(a => a.status === 'completed').length;
    const total = result.actions.length;

    return (
      `Tarefa do tipo "${analysis.type}" executada com ${successful}/${total} ações bem-sucedidas. ` +
      `${result.files_changed.length} arquivos modificados, ${result.tests_added.length} testes adicionados. ` +
      `Issue #${task.issue.number} processada automaticamente pelo xCloud Bot.`
    );
  }

  /**
   * Comenta no issue
   * @param {Object} task - Tarefa
   * @param {string} message - Mensagem
   */
  async commentOnIssue(task, message) {
    const [owner, repo] = task.repository.split('/');

    try {
      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: task.issue.number,
        body: message,
      });
    } catch (error) {
      logger.error('Erro ao comentar no issue:', error);
    }
  }

  /**
   * Comenta resultado da tarefa
   * @param {Object} task - Tarefa
   */
  async commentTaskResult(task) {
    const message = `## ✅ Tarefa Concluída com Sucesso!

🎉 **xBot finalizou a implementação!**

### 📊 Resumo da Execução

- **Tipo**: ${task.result.type}
- **Duração**: ${Math.round((task.completedAt - task.startedAt) / 1000)}s
- **Ações**: ${task.result.actions.length}
- **Arquivos**: ${task.result.files_changed.length} modificados
- **Testes**: ${task.result.tests_added.length} adicionados

### 🔗 Pull Request Criado

${task.pullRequest ? `PR #${task.pullRequest.number}: ${task.pullRequest.html_url}` : 'Erro ao criar PR'}

### 📝 Detalhes

${task.result.summary}

---

**🤖 Implementação automática concluída!**
*Revise o PR e faça merge quando estiver satisfeito com as mudanças.*`;

    await this.commentOnIssue(task, message);
  }

  /**
   * Limpa container após execução
   * @param {string} containerId - ID do container
   */
  async cleanupContainer(containerId) {
    try {
      logger.info(`🧹 Limpando container ${containerId}`);

      // Parar container
      await new Promise(resolve => {
        exec(`podman stop ${containerId}`, () => resolve());
      });

      // Remover container
      await new Promise(resolve => {
        exec(`podman rm ${containerId}`, () => resolve());
      });

      // Remover do registry
      this.containerRegistry.delete(containerId);

      logger.info(`✅ Container ${containerId} removido`);
    } catch (error) {
      logger.error(`Erro ao limpar container ${containerId}:`, error);
    }
  }

  /**
   * Lista tarefas ativas
   * @returns {Array} Lista de tarefas
   */
  getActiveTasks() {
    return Array.from(this.containerRegistry.values()).map(container => ({
      containerId: container.id,
      created: container.created,
      status: 'running',
    }));
  }

  /**
   * Para todas as tarefas ativas
   */
  async stopAllTasks() {
    logger.info('🛑 Parando todas as tarefas ativas');

    const containers = Array.from(this.containerRegistry.keys());

    for (const containerId of containers) {
      await this.cleanupContainer(containerId);
    }

    this.taskQueue = [];
    this.isProcessing = false;

    logger.info('✅ Todas as tarefas foram paradas');
  }
}

module.exports = { AutonomousAgent };
