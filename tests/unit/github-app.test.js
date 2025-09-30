/**
 * 🧪 GitHub App Tests
 */

import { initializeGitHubApp, processWebhook } from '../../src/bot/github-app.js';

describe('GitHub App', () => {
  it('should initialize GitHub App', async () => {
    const app = await initializeGitHubApp();
    expect(app).toBeDefined();
  });

  it('should process webhooks', async () => {
    const payload = { action: 'opened' };
    const result = await processWebhook(payload, {});
    expect(result.processed).toBe(true);
  });
});