require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { createNodeMiddleware } = require('@octokit/webhooks');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const { app: githubApp } = require('./config/github-app');
const logger = require('./utils/logger');

// Importa handlers de webhooks
const {
  handleIssueOpened,
  handleIssueEdited,
  handleIssueClosed,
  handleIssueComment,
} = require('./webhooks/issues');

const {
  handlePullRequestOpened,
  handlePullRequestEdited,
  handlePullRequestClosed,
  handlePullRequestReview,
} = require('./webhooks/pull-requests');

// Configuração do servidor Express
const server = express();

// Middlewares de segurança
server.use(helmet());
server.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: req => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
});

server.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Try again later.',
    });
  }
});

// Middleware para parsing JSON
server.use(express.json({ limit: '10mb' }));

// Trust proxy se configurado
if (process.env.TRUST_PROXY === 'true') {
  server.set('trust proxy', true);
}

// ==================== CONFIGURAÇÃO DOS WEBHOOKS ====================

// Issues
githubApp.webhooks.on('issues.opened', handleIssueOpened);
githubApp.webhooks.on('issues.edited', handleIssueEdited);
githubApp.webhooks.on('issues.closed', handleIssueClosed);
githubApp.webhooks.on('issue_comment.created', handleIssueComment);

// Pull Requests
githubApp.webhooks.on('pull_request.opened', handlePullRequestOpened);
githubApp.webhooks.on('pull_request.edited', handlePullRequestEdited);
githubApp.webhooks.on('pull_request.closed', handlePullRequestClosed);
githubApp.webhooks.on('pull_request_review.submitted', handlePullRequestReview);

// Instalação da App
githubApp.webhooks.on('installation.created', async ({ payload }) => {
  logger.info(`xcloud-bot instalado em: ${payload.installation.account.login}`);
});

githubApp.webhooks.on('installation.deleted', async ({ payload }) => {
  logger.info(`xcloud-bot removido de: ${payload.installation.account.login}`);
});

// Handler genérico para eventos não tratados
githubApp.webhooks.onAny(({ id, name, payload }) => {
  logger.debug(`Webhook recebido: ${name} (${id})`);
});
server.use('/webhook', createNodeMiddleware(githubApp.webhooks, {
// Middleware para webhooks do GitHub
server.use(
  '/webhooks/github',
  createNodeMiddleware(githubApp.webhooks, {
    path: '/',
  })
);

// ==================== ROTAS DA API ====================

// Rota de saúde
server.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'xcloud-bot',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rota de informações do bot
server.get('/info', (req, res) => {
  res.json({
    name: 'xcloud-bot',
    description: 'Bot inteligente para automação e assistência em repositórios GitHub',
    version: '1.0.0',
    features: [
      'Análise automática de issues',
      'Análise de Pull Requests',
      'Resposta a menções',
      'Sugestão de labels',
      'Análise de qualidade de código',
      'Integração com IA (Gemini)',
    ],
    endpoints: {
      health: '/health',
      info: '/info',
      webhooks: '/webhooks/github',
    },
  });
});

// Rota para estatísticas (se necessário)
server.get('/stats', async (req, res) => {
  try {
    // Aqui você pode adicionar estatísticas do banco de dados
    res.json({
      message: 'Estatísticas não implementadas ainda',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
server.use((error, req, res, next) => {
  logger.error('Erro não tratado:', error);

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
  });
});

// Middleware para rotas não encontradas
server.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    availableRoutes: ['/health', '/info', '/stats', '/webhooks/github'],
  });
});

// ==================== INICIALIZAÇÃO DO SERVIDOR ====================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`🤖 xcloud-bot iniciado na porta ${PORT}`);
  logger.info(`📡 Webhooks disponíveis em: /webhooks/github`);
  logger.info(`🏥 Health check em: /health`);
  logger.info(`ℹ️  Informações em: /info`);

  if (process.env.NODE_ENV === 'development') {
    logger.info(`🔧 Modo de desenvolvimento ativo`);
  }
});

// Tratamento de sinais de sistema
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', error => {
  logger.error('Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});

module.exports = server;
