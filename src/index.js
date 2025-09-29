#!/usr/bin/env node

/**
 * 🤖 xCloud Bot - Main Entry Point
 *
 * Entry point for the xCloud Bot application.
 * Handles GitHub App initialization and webhook processing.
 */

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
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down xCloud Bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down xCloud Bot...');
  process.exit(0);
});

main();
