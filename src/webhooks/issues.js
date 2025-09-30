const { getInstallationOctokit } = require('../config/github-app');
const aiService = require('../services/ai-service');
const logger = require('../utils/logger');

/**
 * Handler para quando uma issue é aberta
 */
async function handleIssueOpened({ payload }) {
  const { installation, repository, issue } = payload;

  try {
    logger.info(`Nova issue aberta: ${issue.title} em ${repository.full_name}`);

    const octokit = await getInstallationOctokit(installation.id);

    // Analisa a issue com IA
    const analysis = await aiService.analyzeIssue(issue);

    // Adiciona comentário com análise
    await octokit.rest.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: `🤖 **xcloud-bot** - Análise Automática

${analysis.response}

---
*Este comentário foi gerado automaticamente. Para interagir comigo, mencione @xcloud-bot em seus comentários.*`,
    });

    // Adiciona labels sugeridas
    if (analysis.labels && analysis.labels.length > 0) {
      await octokit.rest.issues.addLabels({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        labels: analysis.labels,
      });

      logger.info(`Labels adicionadas à issue #${issue.number}: ${analysis.labels.join(', ')}`);
    }

    // Adiciona label de prioridade se não existir
    if (analysis.priority && !issue.labels.some(l => l.name.includes('priority'))) {
      await octokit.rest.issues.addLabels({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        labels: [`priority:${analysis.priority}`],
      });
    }
  } catch (error) {
    logger.error('Erro ao processar issue aberta:', error);
  }
}

/**
 * Handler para quando uma issue é editada
 */
async function handleIssueEdited({ payload }) {
  const { installation, repository, issue, changes } = payload;

  try {
    // Se o título ou corpo foram alterados significativamente, re-analisa
    if (changes.title || changes.body) {
      logger.info(`Issue editada: ${issue.title} em ${repository.full_name}`);

      const octokit = await getInstallationOctokit(installation.id);

      // Re-analisa apenas se houve mudanças substanciais
      const titleChanged =
        changes.title && Math.abs(changes.title.from.length - issue.title.length) > 10;
      const bodyChanged =
        changes.body && Math.abs((changes.body.from || '').length - (issue.body || '').length) > 50;

      if (titleChanged || bodyChanged) {
        const analysis = await aiService.analyzeIssue(issue);

        await octokit.rest.issues.createComment({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: issue.number,
          body: `🔄 **xcloud-bot** - Análise Atualizada

Detectei mudanças significativas na issue. Aqui está minha nova análise:

${analysis.response}

---
*Análise atualizada automaticamente pelo xcloud-bot*`,
        });
      }
    }
  } catch (error) {
    logger.error('Erro ao processar issue editada:', error);
  }
}

/**
 * Handler para quando uma issue é fechada
 */
async function handleIssueClosed({ payload }) {
  const { installation, repository, issue } = payload;

  try {
    logger.info(`Issue fechada: ${issue.title} em ${repository.full_name}`);

    const octokit = await getInstallationOctokit(installation.id);

    // Adiciona comentário de fechamento se foi resolvida
    if (issue.state_reason === 'completed') {
      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: `✅ **Issue Resolvida!**

Parabéns pela resolução desta issue! 🎉

📊 **Estatísticas:**
- Tempo aberta: ${calculateTimeOpen(issue.created_at, issue.closed_at)}
- Comentários: ${issue.comments}

Obrigado por manter o projeto organizado!

*Comentário gerado pelo xcloud-bot* 🤖`,
      });
    }
  } catch (error) {
    logger.error('Erro ao processar issue fechada:', error);
  }
}

/**
 * Handler para comentários em issues
 */
async function handleIssueComment({ payload }) {
  const { installation, repository, issue, comment } = payload;

  try {
    // Verifica se o bot foi mencionado
    if (comment.body.includes('@xcloud-bot') || comment.body.includes('xcloud-bot')) {
      logger.info(`Bot mencionado na issue #${issue.number} em ${repository.full_name}`);

      const octokit = await getInstallationOctokit(installation.id);

      // Responde à menção
      const response = await aiService.respondToMention(comment.body, {
        type: 'issue',
        title: issue.title,
        number: issue.number,
      });

      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: `@${comment.user.login} ${response}

---
*Resposta gerada pelo xcloud-bot. Mencione-me novamente se precisar de mais ajuda!* 🤖`,
      });
    }
  } catch (error) {
    logger.error('Erro ao processar comentário da issue:', error);
  }
}

/**
 * Calcula o tempo que uma issue ficou aberta
 */
function calculateTimeOpen(createdAt, closedAt) {
  const created = new Date(createdAt);
  const closed = new Date(closedAt);
  const diffMs = closed - created;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} dia${days > 1 ? 's' : ''} e ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  }
}

module.exports = {
  handleIssueOpened,
  handleIssueEdited,
  handleIssueClosed,
  handleIssueComment,
};
