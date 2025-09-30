/**
 * 🌐 Express Server for xCloud Bot
 *
 * Creates and configures the Express server for handling webhooks
 * and API endpoints.
 */

import express from 'express';

export function createServer(_githubApp) {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'xcloud-bot',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'active',
      bot: 'xCloud Bot',
      version: '1.0.0',
    });
  });

  // GitHub webhook endpoint
  app.post('/api/webhooks', (req, res) => {
    // This would be handled by the GitHub App
    console.log('📥 Webhook received:', req.headers['x-github-event']);
    res.status(200).json({ received: true });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
