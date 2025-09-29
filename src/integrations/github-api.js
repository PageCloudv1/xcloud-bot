/**
 * 🐙 GitHub API Integration
 * 
 * Wrapper para GitHub API com funcionalidades específicas do xCloud
 */

import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * Lista todos os repositórios xCloud
 * @returns {Promise<Array>} Lista de repositórios
 */
export async function getXCloudRepositories() {
    try {
        const { data: repos } = await octokit.rest.repos.listForOrg({
            org: 'PageCloudv1',
            per_page: 100
        });

        // Filtra apenas repositórios xCloud
        return repos.filter(repo => repo.name.startsWith('xcloud-'));
    } catch (error) {
        console.error('❌ Erro ao buscar repositórios:', error);
        throw error;
    }
}

/**
 * Busca workflows de um repositório
 * @param {string} repo - Nome do repositório
 * @returns {Promise<Array>} Lista de workflows
 */
export async function getRepositoryWorkflows(repo) {
    try {
        const { data } = await octokit.rest.actions.listRepoWorkflows({
            owner: 'PageCloudv1',
            repo
        });

        return data.workflows;
    } catch (error) {
        console.error(`❌ Erro ao buscar workflows de ${repo}:`, error);
        return [];
    }
}

/**
 * Busca runs recentes de workflows de um repositório
 * @param {string} repo - Nome do repositório (sem owner)
 * @param {number} limit - Limite de runs
 * @returns {Promise<Array>} Lista de workflow runs
 */
export async function getWorkflowRuns(repo, limit = 20) {
    try {
        // Busca runs de todos os workflows do repositório
        const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
            owner: 'PageCloudv1',
            repo,
            per_page: limit
        });

        return data.workflow_runs || [];
    } catch (error) {
        console.error(`❌ Erro ao buscar runs de ${repo}:`, error);
        return [];
    }
}

/**
 * Cria um issue automático
 * @param {string} repo - Nome do repositório
 * @param {object} issueData - Dados do issue
 * @returns {Promise<object>} Issue criado
 */
export async function createIssue(repo, issueData) {
    try {
        const { data } = await octokit.rest.issues.create({
            owner: 'PageCloudv1',
            repo,
            ...issueData
        });

        console.log(`✅ Issue criado: ${data.html_url}`);
        return data;
    } catch (error) {
        console.error('❌ Erro ao criar issue:', error);
        throw error;
    }
}

/**
 * Adiciona comentário em issue/PR
 * @param {string} repo - Nome do repositório
 * @param {number} issueNumber - Número do issue/PR
 * @param {string} body - Corpo do comentário
 * @returns {Promise<object>} Comentário criado
 */
export async function addComment(repo, issueNumber, body) {
    try {
        const { data } = await octokit.rest.issues.createComment({
            owner: 'PageCloudv1',
            repo,
            issue_number: issueNumber,
            body
        });

        return data;
    } catch (error) {
        console.error('❌ Erro ao adicionar comentário:', error);
        throw error;
    }
}

/**
 * Adiciona labels a um issue/PR
 * @param {string} repo - Nome do repositório
 * @param {number} issueNumber - Número do issue/PR
 * @param {Array<string>} labels - Labels para adicionar
 * @returns {Promise<Array>} Labels adicionadas
 */
export async function addLabels(repo, issueNumber, labels) {
    try {
        const { data } = await octokit.rest.issues.addLabels({
            owner: 'PageCloudv1',
            repo,
            issue_number: issueNumber,
            labels
        });

        return data;
    } catch (error) {
        console.error('❌ Erro ao adicionar labels:', error);
        throw error;
    }
}

/**
 * Busca arquivos modificados em um PR
 * @param {string} repo - Nome do repositório
 * @param {number} pullNumber - Número do PR
 * @returns {Promise<Array>} Arquivos modificados
 */
export async function getPullRequestFiles(repo, pullNumber) {
    try {
        const { data } = await octokit.rest.pulls.listFiles({
            owner: 'PageCloudv1',
            repo,
            pull_number: pullNumber
        });

        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar arquivos do PR:', error);
        return [];
    }
}

/**
 * Busca artefatos de um repositório
 * @param {string} repo - Nome do repositório
 * @returns {Promise<Array>} Lista de artefatos
 */
export async function getRepositoryArtifacts(repo) {
    try {
        const { data } = await octokit.rest.actions.listArtifactsForRepo({
            owner: 'PageCloudv1',
            repo
        });

        return data.artifacts;
    } catch (error) {
        console.error(`❌ Erro ao buscar artefatos de ${repo}:`, error);
        return [];
    }
}

/**
 * Remove artefato antigo
 * @param {string} repo - Nome do repositório
 * @param {number} artifactId - ID do artefato
 * @returns {Promise<boolean>} Sucesso da operação
 */
export async function deleteArtifact(repo, artifactId) {
    try {
        await octokit.rest.actions.deleteArtifact({
            owner: 'PageCloudv1',
            repo,
            artifact_id: artifactId
        });

        return true;
    } catch (error) {
        console.error(`❌ Erro ao remover artefato ${artifactId}:`, error);
        return false;
    }
}

/**
 * Dispara execução manual de workflow
 * @param {string} repo - Nome do repositório
 * @param {string} workflowId - ID do workflow
 * @param {string} ref - Branch/tag para executar
 * @param {object} inputs - Inputs do workflow
 * @returns {Promise<boolean>} Sucesso da operação
 */
export async function triggerWorkflow(repo, workflowId, ref = 'main', inputs = {}) {
    try {
        await octokit.rest.actions.createWorkflowDispatch({
            owner: 'PageCloudv1',
            repo,
            workflow_id: workflowId,
            ref,
            inputs
        });

        console.log(`✅ Workflow ${workflowId} disparado em ${repo}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao disparar workflow:', error);
        return false;
    }
}

/**
 * Re-executa workflow run falhado
 * @param {string} repo - Nome do repositório
 * @param {number} runId - ID do run
 * @returns {Promise<boolean>} Sucesso da operação
 */
export async function rerunFailedJobs(repo, runId) {
    try {
        await octokit.rest.actions.reRunWorkflowFailedJobs({
            owner: 'PageCloudv1',
            repo,
            run_id: runId
        });

        console.log(`✅ Jobs falhados re-executados para run ${runId}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao re-executar jobs:', error);
        return false;
    }
}

/**
 * Busca logs de um workflow run
 * @param {string} repo - Nome do repositório
 * @param {number} runId - ID do run
 * @returns {Promise<string>} URL dos logs
 */
export async function getWorkflowLogs(repo, runId) {
    try {
        const { data } = await octokit.rest.actions.downloadWorkflowRunLogs({
            owner: 'PageCloudv1',
            repo,
            run_id: runId
        });

        return data.url;
    } catch (error) {
        console.error('❌ Erro ao buscar logs:', error);
        return null;
    }
}

/**
 * Verifica rate limit da API
 * @returns {Promise<object>} Informações de rate limit
 */
export async function checkRateLimit() {
    try {
        const { data } = await octokit.rest.rateLimit.get();
        return data.rate;
    } catch (error) {
        console.error('❌ Erro ao verificar rate limit:', error);
        return null;
    }
}

/**
 * Busca estatísticas de um repositório
 * @param {string} repo - Nome do repositório
 * @returns {Promise<object>} Estatísticas
 */
export async function getRepositoryStats(repo) {
    try {
        const [repoData, contributorsData, languagesData] = await Promise.all([
            octokit.rest.repos.get({ owner: 'PageCloudv1', repo }),
            octokit.rest.repos.listContributors({ owner: 'PageCloudv1', repo }),
            octokit.rest.repos.listLanguages({ owner: 'PageCloudv1', repo })
        ]);

        return {
            repository: repoData.data,
            contributors: contributorsData.data,
            languages: languagesData.data,
            stats: {
                stars: repoData.data.stargazers_count,
                forks: repoData.data.forks_count,
                issues: repoData.data.open_issues_count,
                contributors_count: contributorsData.data.length,
                main_language: repoData.data.language
            }
        };
    } catch (error) {
        console.error(`❌ Erro ao buscar stats de ${repo}:`, error);
        return null;
    }
}

export { octokit };

