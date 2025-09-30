import { getInstallationOctokit } from '../config/github-app.js';
import aiService from '../services/ai-service.js';
import logger from '../utils/logger.js';

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
*Este comentário foi gerado automaticamente. Para interagir comigo, mencione @xcloudapp-bot ou @xcloud-bot em seus comentários.*`,
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
    logger.debug(`Comentário recebido na issue #${issue.number} de ${comment.user.login}`);

    // Verifica se o bot foi mencionado
    const mentionPattern = /@xcloudapp-bot|@xcloud-bot|xcloudapp-bot|xcloud-bot/i;
    if (!mentionPattern.test(comment.body)) {
      logger.debug(`Comentário não menciona o bot, ignorando.`);
      return;
    }

    logger.info(`Bot mencionado na issue #${issue.number} em ${repository.full_name}`);

    const octokit = await getInstallationOctokit(installation.id);
    const commentLower = comment.body.toLowerCase();
    
    // Cria comentário inicial indicando que está processando
    const processingComment = await octokit.rest.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: `⏳ Processando seu comando, @${comment.user.login}... Por favor, aguarde.`,
    });

    logger.info(`⏳ Comentário de processamento criado #${processingComment.data.id}`);
    
    let responseBody;

    // Detecta comando específico
    if (commentLower.includes('help') || commentLower.includes('ajuda')) {
      // Comando de ajuda
      responseBody = `@${comment.user.login} 👋

Olá! Sou o **xcloud-bot** e estou aqui para ajudar!

**Comandos disponíveis:**
- \`@xcloudapp-bot help\` ou \`@xcloud-bot help\` - Mostra esta mensagem de ajuda
- \`@xcloudapp-bot analyze\` ou \`@xcloud-bot analyze\` - Re-analisa a issue atual

**Sobre mim:**
- 🔍 Analiso automaticamente issues quando são criadas
- 🏷️ Adiciono labels relevantes baseado no conteúdo
- 📊 Forneço insights e análises inteligentes
- 🤝 Respondo a menções e ajudo no desenvolvimento

**Status:** ✅ Funcionando!

---
*Resposta gerada pelo xcloud-bot* 🤖`;
    } else if (commentLower.includes('analyze') || commentLower.includes('analisa')) {
      // Comando de análise
      logger.info(`Comando 'analyze' detectado para issue #${issue.number}`);
      const analysis = await aiService.analyzeIssue(issue);

      responseBody = `@${comment.user.login}

🔍 **Re-análise da Issue**

${analysis.response}

---
*Análise atualizada pelo xcloud-bot* 🤖`;
    } else {
      // Menção sem comando específico - usa AI para responder
      const response = await aiService.respondToMention(comment.body, {
        type: 'issue',
        title: issue.title,
        number: issue.number,
      });

      responseBody = `@${comment.user.login} ${response}

---
*Resposta gerada pelo xcloud-bot. Use \`@xcloudapp-bot help\` ou \`@xcloud-bot help\` para ver comandos disponíveis!* 🤖`;
    }

    // Atualiza o comentário de processamento com a resposta final
    await octokit.rest.issues.updateComment({
      owner: repository.owner.login,
      repo: repository.name,
      comment_id: processingComment.data.id,
      body: responseBody,
    });

    logger.info(`✅ Resposta enviada para issue #${issue.number}`);
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

export { handleIssueOpened, handleIssueEdited, handleIssueClosed, handleIssueComment };
