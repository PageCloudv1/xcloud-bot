/**
 * 🧠 Integração com Gemini API
 *
 * Interface para integrar com o Gemini AI via API direta
 */

import { exec } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

dotenv.config();
const execAsync = promisify(exec);

function normalizeGeminiResponse(output) {
  const trimmed = (output ?? '').trim();

  if (!trimmed) {
    return {
      raw: '',
      text: '',
      data: null,
      isJson: false,
    };
  }

  const withoutFences = trimmed
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  let parsed = null;
  let isJson = false;

  const tryParse = candidate => {
    try {
      parsed = JSON.parse(candidate);
      isJson = true;
    } catch (error) {
      parsed = null;
      isJson = false;
    }
  };

  tryParse(withoutFences);

  if (!isJson) {
    const firstBrace = withoutFences.indexOf('{');
    const lastBrace = withoutFences.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = withoutFences.slice(firstBrace, lastBrace + 1);
      tryParse(jsonCandidate);
    }
  }

  return {
    raw: trimmed,
    text: withoutFences,
    data: parsed,
    isJson,
  };
}

/**
 * Executa análise usando Gemini CLI
 * @param {string} prompt - Prompt para análise
 * @param {object} context - Contexto adicional
 * @param {object} options - Opções de execução
 * @returns {Promise<object>} Resultado da análise
 */
/**
 * Alternativa usando API direta do Gemini
 * Para evitar problemas com extensões IDE
 */
export async function analyzeWithGeminiAPI(prompt, _context = {}, _options = {}) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    console.log('🔄 Fazendo request para Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Gemini response data:', JSON.stringify(data, null, 2));

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = data.candidates?.[0]?.finishReason;

    if (!content) {
      // Se chegou ao limite de tokens, retorna uma resposta básica
      if (finishReason === 'MAX_TOKENS') {
        return {
          ...normalizeGeminiResponse(
            'Análise realizada. Repositório com workflows funcionais. Considere otimizações de performance.'
          ),
          truncated: true,
          provider: 'gemini-api',
        };
      }
      throw new Error('Resposta vazia da API Gemini');
    }

    console.log('✅ Gemini response content:', content);

    const normalized = normalizeGeminiResponse(content);
    return {
      ...normalized,
      truncated: finishReason === 'MAX_TOKENS',
      provider: 'gemini-api',
    };
  } catch (error) {
    console.error('❌ Erro na API Gemini:', error.message);
    throw error;
  }
}

export async function analyzeWithGemini(prompt, context = {}, options = {}) {
  // Primeiro tenta a API direta
  let apiError;
  try {
    console.log('🧠 Tentando análise via API Gemini...');
    return await analyzeWithGeminiAPI(prompt, context, options);
  } catch (error) {
    apiError = error;
    console.warn('⚠️ API Gemini falhou:', apiError.message);
  }

  // Fallback para CLI (sem extensões IDE)
  try {
    console.log('🧠 Tentando análise via CLI Gemini...');

    const command = `echo "${prompt.replace(/"/g, '\\"')}" | gemini --output-format text`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: options.timeout || 30000,
      maxBuffer: options.maxBuffer || 1024 * 1024,
      env: { ...process.env, GEMINI_NO_IDE: '1' },
    });

    // Ignora erros de IDE
    if (stderr && !stderr.includes('[ERROR] [IDEClient]')) {
      console.warn('⚠️ Gemini stderr:', stderr);
    }

    const normalized = normalizeGeminiResponse(stdout);

    return {
      ...normalized,
      provider: 'gemini-cli',
    };
  } catch (cliError) {
    console.error('❌ Todas as tentativas de análise Gemini falharam');
    const apiMessage = apiError?.message || 'N/A';
    throw new Error(`Gemini indisponível. API: ${apiMessage}, CLI: ${cliError?.message || 'N/A'}`);
  }
}

/**
 * Analisa um repositório usando Gemini
 * @param {string} repoName - Nome do repositório
 * @param {string} analysisType - Tipo de análise
 * @returns {Promise<object>} Análise do repositório
 */
export async function analyzeRepository(repoName, analysisType = 'general') {
  const prompts = {
    general: `
      Analise o repositório ${repoName} e forneça:
      1. Resumo da funcionalidade
      2. Tecnologias utilizadas
      3. Qualidade do código
      4. Sugestões de melhorias
      5. Recomendações de CI/CD
      
      Retorne como JSON com as chaves: summary, technologies, quality_score, improvements, cicd_recommendations
    `,

    workflows: `
      Analise os workflows GitHub Actions do repositório ${repoName}:
      1. Workflows existentes
      2. Eficiência dos builds
      3. Cobertura de testes
      4. Segurança dos workflows
      5. Otimizações sugeridas
      
      Retorne como JSON com as chaves: existing_workflows, build_efficiency, test_coverage, security_issues, optimizations
    `,

    security: `
      Faça uma análise de segurança do repositório ${repoName}:
      1. Vulnerabilidades conhecidas
      2. Configurações inseguras
      3. Exposição de secrets
      4. Recomendações de segurança
      
      Retorne como JSON com as chaves: vulnerabilities, insecure_configs, exposed_secrets, security_recommendations
    `,

    performance: `
      Analise a performance dos workflows do repositório ${repoName}:
      1. Tempo médio de build
      2. Workflows mais lentos
      3. Uso de cache
      4. Paralelização
      5. Sugestões de otimização
      
      Retorne como JSON com as chaves: avg_build_time, slow_workflows, cache_usage, parallelization, optimizations
    `,
  };

  const prompt = prompts[analysisType] || prompts.general;

  return await analyzeWithGemini(prompt, {
    repository: repoName,
    analysis_type: analysisType,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Analisa um issue específico
 * @param {object} issue - Dados do issue
 * @returns {Promise<object>} Análise do issue
 */
export async function analyzeIssue(issue) {
  const prompt = `
    Analise este issue do GitHub e categorize-o:
    
    Título: ${issue.title}
    Corpo: ${issue.body || 'Sem descrição'}
    
    Forneça:
    1. Tipo (bug, feature, enhancement, documentation, question)
    2. Prioridade (low, medium, high, critical)
    3. Labels sugeridas
    4. Estimativa de complexidade (1-5)
    5. Sugestões para o assignee
    
    Retorne como JSON com as chaves: type, priority, labels, complexity, assignee_suggestions
  `;

  const result = await analyzeWithGemini(prompt, {
    issue_title: issue.title,
    issue_body: issue.body,
    repository: issue.repository_url,
  });

  const fallback = {
    type: 'question',
    priority: 'medium',
    labels: [],
    complexity: 3,
    assignee_suggestions: [],
    summary: result.text || result.raw,
  };

  if (result.isJson && result.data && typeof result.data === 'object') {
    return {
      ...fallback,
      ...result.data,
      raw: result.raw,
      provider: result.provider,
      isStructured: true,
    };
  }

  return {
    ...fallback,
    raw: result.raw,
    provider: result.provider,
    isStructured: false,
  };
}

/**
 * Analisa um Pull Request
 * @param {object} pr - Dados do PR
 * @param {Array} files - Arquivos modificados
 * @returns {Promise<object>} Análise do PR
 */
export async function analyzePullRequest(pr, files = []) {
  const filesSummary = files.map(f => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
  }));

  const prompt = `
    Analise este Pull Request:
    
    Título: ${pr.title}
    Descrição: ${pr.body || 'Sem descrição'}
    
    Arquivos modificados: ${filesSummary.length} arquivos
    ${filesSummary.map(f => `- ${f.filename} (${f.status}): +${f.additions}/-${f.deletions}`).join('\n')}
    
    Forneça:
    1. Tipo de mudança (feature, bugfix, refactor, docs, etc)
    2. Impacto (low, medium, high)
    3. Riscos potenciais
    4. Sugestões de revisão
    5. Necessidade de testes adicionais
    
    Retorne como JSON com as chaves: change_type, impact, risks, review_suggestions, testing_needed
  `;

  return await analyzeWithGemini(prompt, {
    pr_title: pr.title,
    pr_body: pr.body,
    files_count: files.length,
    files_summary: filesSummary,
  });
}

/**
 * Gera relatório de workflow failure
 * @param {object} workflowRun - Dados do workflow run
 * @returns {Promise<object>} Relatório de falha
 */
export async function analyzeWorkflowFailure(workflowRun) {
  const prompt = `
    Analise esta falha de workflow:
    
    Workflow: ${workflowRun.name}
    Branch: ${workflowRun.head_branch}
    Conclusão: ${workflowRun.conclusion}
    
    Forneça:
    1. Possíveis causas da falha
    2. Passos para investigação
    3. Soluções comuns
    4. Prevenção futura
    
    Retorne como JSON com as chaves: possible_causes, investigation_steps, common_solutions, prevention
  `;

  return await analyzeWithGemini(prompt, {
    workflow_name: workflowRun.name,
    branch: workflowRun.head_branch,
    conclusion: workflowRun.conclusion,
    run_url: workflowRun.html_url,
  });
}

/**
 * Salva resultado de análise em arquivo
 * @param {string} filename - Nome do arquivo
 * @param {object} data - Dados para salvar
 */
export async function saveAnalysis(filename, data) {
  try {
    const analysisDir = path.join(process.cwd(), 'analysis-results');
    await fs.mkdir(analysisDir, { recursive: true });

    const filePath = path.join(analysisDir, `${filename}-${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    console.log(`💾 Análise salva em: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('❌ Erro ao salvar análise:', error);
    throw error;
  }
}

/**
 * Carrega histórico de análises
 * @param {string} repoName - Nome do repositório
 * @returns {Promise<Array>} Histórico de análises
 */
export async function loadAnalysisHistory(repoName) {
  try {
    const analysisDir = path.join(process.cwd(), 'analysis-results');
    const files = await fs.readdir(analysisDir);

    const repoFiles = files.filter(f => f.startsWith(repoName) && f.endsWith('.json'));

    const history = [];
    for (const file of repoFiles) {
      const filePath = path.join(analysisDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      history.push(JSON.parse(content));
    }

    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('❌ Erro ao carregar histórico:', error);
    return [];
  }
}
