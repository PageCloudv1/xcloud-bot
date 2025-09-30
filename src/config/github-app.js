import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import logger from '../utils/logger.js';

// Lazy initialization para garantir que env vars sejam carregadas primeiro
let app = null;

/**
 * Obtém ou inicializa a instância da GitHub App
 * @returns {App} Instância da GitHub App
 */
function getApp() {
  if (!app) {
    if (!process.env.GH_APP_ID) {
      throw new Error('GH_APP_ID não configurado. Verifique seu arquivo .env');
    }
    if (!process.env.GH_PRIVATE_KEY) {
      throw new Error('GH_PRIVATE_KEY não configurado. Verifique seu arquivo .env');
    }
    
    app = new App({
      appId: process.env.GH_APP_ID,
      privateKey: process.env.GH_PRIVATE_KEY,
      webhooks: {
        secret: process.env.WEBHOOK_SECRET || 'development-webhook-secret',
      },
    });
    
    logger.info(`GitHub App inicializado com App ID: ${process.env.GH_APP_ID}`);
  }
  return app;
}

/**
 * Obtém uma instância do Octokit autenticada para uma instalação específica
 * @param {number} installationId - ID da instalação da GitHub App
 * @returns {Promise<Octokit>} Instância autenticada do Octokit
 */
async function getInstallationOctokit(installationId) {
  try {
    const appInstance = getApp();
    const installationAccessToken = await appInstance.getInstallationAccessToken({
      installationId,
    });

    return new Octokit({
      auth: installationAccessToken,
      userAgent: 'xcloud-bot/1.0.0',
    });
  } catch (error) {
    logger.error('Erro ao obter token de instalação:', error);
    throw error;
  }
}

/**
 * Obtém informações sobre a instalação
 * @param {number} installationId - ID da instalação
 * @returns {Promise<Object>} Informações da instalação
 */
async function getInstallationInfo(installationId) {
  try {
    const octokit = await getInstallationOctokit(installationId);
    const { data: installation } = await octokit.rest.apps.getInstallation({
      installation_id: installationId,
    });

    return installation;
  } catch (error) {
    logger.error('Erro ao obter informações da instalação:', error);
    throw error;
  }
}

/**
 * Verifica se o bot tem permissão para executar uma ação
 * @param {number} installationId - ID da instalação
 * @param {string} permission - Permissão a verificar
 * @returns {Promise<boolean>} True se tem permissão
 */
async function hasPermission(installationId, permission) {
  try {
    const installation = await getInstallationInfo(installationId);
    return installation.permissions && installation.permissions[permission];
  } catch (error) {
    logger.error('Erro ao verificar permissões:', error);
    return false;
  }
}

export { getApp as app, getInstallationOctokit, getInstallationInfo, hasPermission };
