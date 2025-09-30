const { getInstallationOctokit } = require('../config/github-app');
const aiService = require('../services/ai-service');
const logger = require('../utils/logger');

/**
 * Handler para quando um PR é aberto
 */
async function handlePullRequestOpened({ payload }) {
  const { installation, repository, pull_request } = payload;
  
  try {
    logger.info(`Novo PR aberto: ${pull_request.title} em ${repository.full_name}`);
    
    const octokit = await getInstallationOctokit(installation.id);
    
    // Obtém arquivos modificados
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: pull_request.number,
    });
    
    // Analisa o PR com IA
    const analysis = await aiService.analyzePullRequest(pull_request, files);
    
    // Adiciona comentário com análise
    await octokit.rest.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: pull_request.number,
      body: `🤖 **xcloud-bot** - Análise Automática do PR

${analysis.response}

📁 **Arquivos modificados:** ${files.length}
${files.slice(0, 5).map(f => `- \`${f.filename}\` (+${f.additions}/-${f.deletions})`).join('\n')}
${files.length > 5 ? `\n... e mais ${files.length - 5} arquivo(s)` : ''}

---
*Análise gerada automaticamente. Mencione @xcloud-bot para interagir comigo.*`
    });
    
    // Adiciona labels baseadas na análise
    if (analysis.labels && analysis.labels.length > 0) {
      await octokit.rest.issues.addLabels({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pull_request.number,
        labels: analysis.labels
      });
      
      logger.info(`Labels adicionadas ao PR #${pull_request.number}: ${analysis.labels.join(', ')}`);
    }
    
    // Adiciona reviewers sugeridos se o PR for grande
    if (analysis.size === 'XL' || analysis.size === 'XXL') {
      await suggestReviewers(octokit, repository, pull_request, files);
    }
    
    // Cria check se necessário
    await createQualityCheck(octokit, repository, pull_request, analysis);
    
  } catch (error) {
    logger.error('Erro ao processar PR aberto:', error);
  }
}

/**
 * Handler para quando um PR é editado
 */
async function handlePullRequestEdited({ payload }) {
  const { installation, repository, pull_request, changes } = payload;
  
  try {
    // Re-analisa se o título ou descrição mudaram significativamente
    if (changes.title || changes.body) {
      logger.info(`PR editado: ${pull_request.title} em ${repository.full_name}`);
      
      const octokit = await getInstallationOctokit(installation.id);
      
      const titleChanged = changes.title && 
        Math.abs(changes.title.from.length - pull_request.title.length) > 10;
      const bodyChanged = changes.body && 
        Math.abs((changes.body.from || '').length - (pull_request.body || '').length) > 50;
      
      if (titleChanged || bodyChanged) {
        const { data: files } = await octokit.rest.pulls.listFiles({
          owner: repository.owner.login,
          repo: repository.name,
          pull_number: pull_request.number,
        });
        
        const analysis = await aiService.analyzePullRequest(pull_request, files);
        
        await octokit.rest.issues.createComment({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: pull_request.number,
          body: `🔄 **xcloud-bot** - Análise Atualizada

Detectei mudanças na descrição do PR. Aqui está minha nova análise:

${analysis.response}

---
*Análise atualizada automaticamente pelo xcloud-bot*`
        });
      }
    }
  } catch (error) {
    logger.error('Erro ao processar PR editado:', error);
  }
}

/**
 * Handler para quando um PR é fechado/merged
 */
async function handlePullRequestClosed({ payload }) {
  const { installation, repository, pull_request } = payload;
  
  try {
    logger.info(`PR ${pull_request.merged ? 'merged' : 'fechado'}: ${pull_request.title} em ${repository.full_name}`);
    
    const octokit = await getInstallationOctokit(installation.id);
    
    if (pull_request.merged) {
      // Celebra o merge
      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pull_request.number,
        body: `🎉 **PR Merged com Sucesso!**

Parabéns @${pull_request.user.login}! Seu PR foi integrado ao projeto.

📊 **Estatísticas do PR:**
- Arquivos modificados: ${pull_request.changed_files}
- Adições: +${pull_request.additions}
- Remoções: -${pull_request.deletions}
- Commits: ${pull_request.commits}
- Tempo aberto: ${calculateTimeOpen(pull_request.created_at, pull_request.merged_at)}

Obrigado pela contribuição! 🚀

*Celebração gerada pelo xcloud-bot* 🤖`
      });
    }
    
  } catch (error) {
    logger.error('Erro ao processar PR fechado:', error);
  }
}

/**
 * Handler para review de PR
 */
async function handlePullRequestReview({ payload }) {
  const { installation, repository, pull_request, review } = payload;
  
  try {
    if (review.state === 'approved') {
      logger.info(`PR aprovado: ${pull_request.title} em ${repository.full_name}`);
      
      const octokit = await getInstallationOctokit(installation.id);
      
      // Verifica quantas aprovações tem
      const { data: reviews } = await octokit.rest.pulls.listReviews({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: pull_request.number,
      });
      
      const approvals = reviews.filter(r => r.state === 'APPROVED').length;
      
      if (approvals >= 2) {
        await octokit.rest.issues.createComment({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: pull_request.number,
          body: `✅ **PR Aprovado por ${approvals} reviewer(s)!**

Este PR está pronto para merge! 🎯

@${pull_request.user.login} Você pode fazer o merge quando estiver pronto.

*Notificação gerada pelo xcloud-bot* 🤖`
        });
      }
    }
    
  } catch (error) {
    logger.error('Erro ao processar review do PR:', error);
  }
}

/**
 * Sugere reviewers baseado nos arquivos modificados
 */
async function suggestReviewers(octokit, repository, pullRequest, files) {
  try {
    const codeOwners = await getCodeOwners(octokit, repository);
    const suggestedReviewers = [];
    
    // Lógica simples para sugerir reviewers baseado em tipos de arquivo
    const hasJavaScript = files.some(f => f.filename.endsWith('.js') || f.filename.endsWith('.ts'));
    const hasCSS = files.some(f => f.filename.endsWith('.css') || f.filename.endsWith('.scss'));
    const hasTests = files.some(f => f.filename.includes('test') || f.filename.includes('spec'));
    
    let suggestions = [];
    if (hasJavaScript) suggestions.push('Considere solicitar review de um desenvolvedor JavaScript/TypeScript');
    if (hasCSS) suggestions.push('Considere solicitar review de um desenvolvedor Frontend');
    if (hasTests) suggestions.push('Ótimo! Testes incluídos');
    
    if (suggestions.length > 0) {
      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pullRequest.number,
        body: `👥 **Sugestões de Review:**

${suggestions.map(s => `- ${s}`).join('\n')}

*Sugestões geradas pelo xcloud-bot baseadas nos arquivos modificados*`
      });
    }
    
  } catch (error) {
    logger.error('Erro ao sugerir reviewers:', error);
  }
}

/**
 * Cria um check de qualidade para o PR
 */
async function createQualityCheck(octokit, repository, pullRequest, analysis) {
  try {
    const conclusion = analysis.risk_level === 'high' ? 'neutral' : 'success';
    const title = `xcloud-bot Quality Check`;
    
    await octokit.rest.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: title,
      head_sha: pullRequest.head.sha,
      status: 'completed',
      conclusion,
      output: {
        title: `Análise de Qualidade - ${analysis.size}`,
        summary: `**Tamanho:** ${analysis.size}\n**Tipo:** ${analysis.type}\n**Risco:** ${analysis.risk_level}\n**Tempo estimado de review:** ${analysis.review_time_estimate} minutos`,
        text: analysis.suggestions.map(s => `- ${s}`).join('\n')
      }
    });
    
  } catch (error) {
    logger.error('Erro ao criar check de qualidade:', error);
  }
}

/**
 * Obtém CODEOWNERS se existir
 */
async function getCodeOwners(octokit, repository) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repository.owner.login,
      repo: repository.name,
      path: '.github/CODEOWNERS'
    });
    
    return Buffer.from(data.content, 'base64').toString();
  } catch (error) {
    return null;
  }
}

/**
 * Calcula tempo que o PR ficou aberto
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
  handlePullRequestOpened,
  handlePullRequestEdited,
  handlePullRequestClosed,
  handlePullRequestReview,
};