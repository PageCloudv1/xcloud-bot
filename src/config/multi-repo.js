const logger = require('../utils/logger');
const { getInstallationOctokit, getInstallationInfo } = require('./github-app');

/**
 * Configuração para múltiplos repositórios
 */
class MultiRepoManager {
  constructor() {
    this.repositories = new Map();
    this.installations = new Map();
    this.defaultConfig = {
      features: {
        autoReview: true,
        geminiIntegration: true,
        issueManagement: true,
        prAutomation: true,
        securityScanning: false,
        performanceMonitoring: false
      },
      workflows: {
        'auto-copilot-review': true,
        'enhanced-gemini-cli': true,
        'gemini-review': true,
        'gemini-triage': true
      },
      permissions: {
        issues: 'write',
        pullRequests: 'write',
        contents: 'read',
        actions: 'write'
      }
    };
  }

  /**
   * Registra um novo repositório
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   * @param {number} installationId - ID da instalação da GitHub App
   * @param {Object} config - Configuração específica do repositório
   */
  async registerRepository(owner, repo, installationId, config = {}) {
    const repoKey = `${owner}/${repo}`;
    
    try {
      // Verificar se a instalação existe
      const installation = await getInstallationInfo(installationId);
      
      // Mesclar configuração padrão com específica
      const repoConfig = {
        ...this.defaultConfig,
        ...config,
        features: { ...this.defaultConfig.features, ...config.features },
        workflows: { ...this.defaultConfig.workflows, ...config.workflows },
        permissions: { ...this.defaultConfig.permissions, ...config.permissions }
      };

      // Registrar repositório
      this.repositories.set(repoKey, {
        owner,
        repo,
        installationId,
        config: repoConfig,
        registeredAt: new Date(),
        lastActivity: new Date()
      });

      // Registrar instalação se não existir
      if (!this.installations.has(installationId)) {
        this.installations.set(installationId, {
          id: installationId,
          account: installation.account,
          repositories: [repoKey],
          permissions: installation.permissions
        });
      } else {
        const inst = this.installations.get(installationId);
        if (!inst.repositories.includes(repoKey)) {
          inst.repositories.push(repoKey);
        }
      }

      logger.info(`Repositório ${repoKey} registrado com sucesso`, {
        installationId,
        features: Object.keys(repoConfig.features).filter(f => repoConfig.features[f])
      });

      return true;
    } catch (error) {
      logger.error(`Erro ao registrar repositório ${repoKey}:`, error);
      throw error;
    }
  }

  /**
   * Remove um repositório do gerenciamento
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   */
  unregisterRepository(owner, repo) {
    const repoKey = `${owner}/${repo}`;
    
    if (this.repositories.has(repoKey)) {
      const repoData = this.repositories.get(repoKey);
      this.repositories.delete(repoKey);

      // Remover da instalação
      const installation = this.installations.get(repoData.installationId);
      if (installation) {
        installation.repositories = installation.repositories.filter(r => r !== repoKey);
        if (installation.repositories.length === 0) {
          this.installations.delete(repoData.installationId);
        }
      }

      logger.info(`Repositório ${repoKey} removido do gerenciamento`);
      return true;
    }

    return false;
  }

  /**
   * Obtém configuração de um repositório
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   * @returns {Object|null} Configuração do repositório
   */
  getRepositoryConfig(owner, repo) {
    const repoKey = `${owner}/${repo}`;
    const repoData = this.repositories.get(repoKey);
    return repoData ? repoData.config : null;
  }

  /**
   * Verifica se um repositório está registrado
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   * @returns {boolean} True se registrado
   */
  isRepositoryRegistered(owner, repo) {
    const repoKey = `${owner}/${repo}`;
    return this.repositories.has(repoKey);
  }

  /**
   * Verifica se uma feature está habilitada para um repositório
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   * @param {string} feature - Nome da feature
   * @returns {boolean} True se habilitada
   */
  isFeatureEnabled(owner, repo, feature) {
    const config = this.getRepositoryConfig(owner, repo);
    return config ? config.features[feature] || false : false;
  }

  /**
   * Verifica se um workflow está habilitado para um repositório
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   * @param {string} workflow - Nome do workflow
   * @returns {boolean} True se habilitado
   */
  isWorkflowEnabled(owner, repo, workflow) {
    const config = this.getRepositoryConfig(owner, repo);
    return config ? config.workflows[workflow] || false : false;
  }

  /**
   * Obtém Octokit para um repositório específico
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   * @returns {Promise<Octokit>} Instância do Octokit
   */
  async getRepositoryOctokit(owner, repo) {
    const repoKey = `${owner}/${repo}`;
    const repoData = this.repositories.get(repoKey);
    
    if (!repoData) {
      throw new Error(`Repositório ${repoKey} não está registrado`);
    }

    return await getInstallationOctokit(repoData.installationId);
  }

  /**
   * Lista todos os repositórios registrados
   * @returns {Array} Lista de repositórios
   */
  listRepositories() {
    return Array.from(this.repositories.entries()).map(([key, data]) => ({
      repository: key,
      ...data
    }));
  }

  /**
   * Lista repositórios por instalação
   * @param {number} installationId - ID da instalação
   * @returns {Array} Lista de repositórios da instalação
   */
  getRepositoriesByInstallation(installationId) {
    const installation = this.installations.get(installationId);
    return installation ? installation.repositories : [];
  }

  /**
   * Atualiza a última atividade de um repositório
   * @param {string} owner - Proprietário do repositório
   * @param {string} repo - Nome do repositório
   */
  updateLastActivity(owner, repo) {
    const repoKey = `${owner}/${repo}`;
    const repoData = this.repositories.get(repoKey);
    
    if (repoData) {
      repoData.lastActivity = new Date();
    }
  }

  /**
   * Exporta configuração para backup
   * @returns {Object} Configuração completa
   */
  exportConfig() {
    return {
      repositories: Object.fromEntries(this.repositories),
      installations: Object.fromEntries(this.installations),
      exportedAt: new Date()
    };
  }

  /**
   * Importa configuração de backup
   * @param {Object} config - Configuração para importar
   */
  importConfig(config) {
    if (config.repositories) {
      this.repositories = new Map(Object.entries(config.repositories));
    }
    
    if (config.installations) {
      this.installations = new Map(Object.entries(config.installations));
    }

    logger.info('Configuração multi-repo importada com sucesso');
  }
}

// Instância singleton
const multiRepoManager = new MultiRepoManager();

module.exports = {
  MultiRepoManager,
  multiRepoManager
};