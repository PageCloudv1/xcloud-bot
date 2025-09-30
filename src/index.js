/**
 * 🤖 xCloud Bot - Main Entry Point
 *
 * Entry point for the xCloud Bot application.
 * Handles GitHub App initialization and webhook processing.
 */

// Carrega variáveis de ambiente primeiro
import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './api/server.js';
import { initializeGitHubApp } from './bot/github-app.js';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    console.log('🤖 Starting xCloud Bot...');

    // Initialize GitHub App
    const app = await initializeGitHubApp();

    // Create and start server
    const server = createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 xCloud Bot server running on port ${PORT}`);
      console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhooks`);
    });
  } catch (error) {
    console.error('❌ Failed to start xCloud Bot:', error);
    throw error;
  }
}

// Handle graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down xCloud Bot...');
  // Allow pending operations to complete naturally
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch(error => {
  console.error('Fatal error:', error);
  process.exitCode = 1;
});
