import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    });
  }

  /**
   * Analisa uma issue e sugere labels e prioridade
   * @param {Object} issue - Objeto da issue do GitHub
   * @returns {Promise<Object>} Análise da issue
   */
  async analyzeIssue(issue) {
    try {
      const prompt = `
Analise esta issue do GitHub e forneça uma resposta em JSON:

**Título:** ${issue.title}
**Descrição:** ${issue.body || 'Sem descrição'}
**Labels existentes:** ${issue.labels?.map(l => l.name).join(', ') || 'Nenhuma'}

Forneça uma análise em JSON com:
1. "labels": array de labels sugeridas (bug, enhancement, documentation, question, etc.)
2. "priority": prioridade (low, medium, high, critical)
3. "category": categoria técnica (frontend, backend, database, security, etc.)
4. "estimated_complexity": complexidade estimada (simple, medium, complex)
5. "suggested_assignees": array de tipos de desenvolvedores necessários
6. "response": resposta amigável para comentar na issue (em português)

Responda APENAS com JSON válido.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Tenta fazer parse do JSON
      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.warn('Resposta da IA não é JSON válido:', text);
        return this.getFallbackIssueAnalysis(issue);
      }
    } catch (error) {
      logger.error('Erro ao analisar issue com IA:', error);
      return this.getFallbackIssueAnalysis(issue);
    }
  }

  /**
   * Analisa um Pull Request
   * @param {Object} pr - Objeto do PR do GitHub
   * @param {Array} files - Arquivos modificados
   * @returns {Promise<Object>} Análise do PR
   */
  async analyzePullRequest(pr, files = []) {
    try {
      const filesList = files
        .map(f => `${f.filename} (+${f.additions}/-${f.deletions})`)
        .join('\n');

      const prompt = `
Analise este Pull Request do GitHub:

**Título:** ${pr.title}
**Descrição:** ${pr.body || 'Sem descrição'}
**Arquivos modificados:**
${filesList}

**Total de mudanças:** +${pr.additions || 0}/-${pr.deletions || 0}

Forneça análise em JSON com:
1. "size": tamanho do PR (XS, S, M, L, XL, XXL)
2. "type": tipo de mudança (feature, bugfix, refactor, docs, style, test)
3. "risk_level": nível de risco (low, medium, high)
4. "review_time_estimate": tempo estimado de review em minutos
5. "suggestions": array de sugestões de melhoria
6. "labels": labels sugeridas
7. "response": comentário amigável para o PR (em português)

Responda APENAS com JSON válido.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.warn('Resposta da IA não é JSON válido:', text);
        return this.getFallbackPRAnalysis(pr);
      }
    } catch (error) {
      logger.error('Erro ao analisar PR com IA:', error);
      return this.getFallbackPRAnalysis(pr);
    }
  }

  /**
   * Responde a uma menção do bot
   * @param {string} comment - Comentário que menciona o bot
   * @param {Object} context - Contexto (issue, PR, etc.)
   * @returns {Promise<string>} Resposta do bot
   */
  async respondToMention(comment, context) {
    try {
      const prompt = `
Você é o xcloud-bot, um assistente inteligente para repositórios GitHub.

**Contexto:** ${context.type} - "${context.title}"
**Comentário do usuário:** ${comment}

Responda de forma útil e amigável em português. Seja conciso mas informativo.
Se o usuário pedir ajuda com código, análise ou sugestões, forneça respostas práticas.

Resposta:
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Erro ao responder menção:', error);
      return '🤖 Olá! Sou o xcloud-bot. Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns minutos.';
    }
  }

  /**
   * Análise de fallback para issues
   */
  getFallbackIssueAnalysis(issue) {
    const title = issue.title.toLowerCase();
    const body = (issue.body || '').toLowerCase();

    let labels = [];
    let priority = 'medium';
    let category = 'general';

    // Análise simples baseada em palavras-chave
    if (title.includes('bug') || body.includes('erro') || body.includes('error')) {
      labels.push('bug');
      priority = 'high';
    }

    if (title.includes('feature') || title.includes('funcionalidade')) {
      labels.push('enhancement');
    }

    if (title.includes('doc') || body.includes('documentação')) {
      labels.push('documentation');
      category = 'documentation';
    }

    if (title.includes('urgent') || title.includes('crítico')) {
      priority = 'critical';
    }

    return {
      labels,
      priority,
      category,
      estimated_complexity: 'medium',
      suggested_assignees: ['developer'],
      response: `👋 Olá! Analisei sua issue e identifiquei que se trata de um **${labels[0] || 'item'}** com prioridade **${priority}**. 

🔍 **Análise inicial:**
- Categoria: ${category}
- Complexidade estimada: média

📋 **Próximos passos:**
- Vou adicionar as labels apropriadas
- A equipe será notificada automaticamente

*Análise gerada pelo xcloud-bot* 🤖`,
    };
  }

  /**
   * Análise de fallback para PRs
   */
  getFallbackPRAnalysis(pr) {
    const additions = pr.additions || 0;
    const deletions = pr.deletions || 0;
    const total = additions + deletions;

    let size = 'M';
    if (total < 10) size = 'XS';
    else if (total < 50) size = 'S';
    else if (total < 200) size = 'M';
    else if (total < 500) size = 'L';
    else if (total < 1000) size = 'XL';
    else size = 'XXL';

    return {
      size,
      type: 'feature',
      risk_level: total > 500 ? 'high' : 'medium',
      review_time_estimate: Math.min(total / 10, 120),
      suggestions: ['Considere dividir PRs grandes em menores', 'Adicione testes se necessário'],
      labels: [`size:${size}`],
      response: `🔍 **Análise do PR:**

📊 **Estatísticas:**
- Tamanho: ${size} (+${additions}/-${deletions})
- Tempo estimado de review: ${Math.min(total / 10, 120)} minutos

✅ **Recomendações:**
- ${total > 500 ? 'Considere dividir este PR em partes menores' : 'Tamanho adequado para review'}
- Verifique se há testes cobrindo as mudanças

*Análise gerada pelo xcloud-bot* 🤖`,
    };
  }
}

export default new AIService();
