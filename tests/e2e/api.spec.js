/**
 * 🎭 E2E API Tests
 */

import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('health endpoint should respond', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('xcloud-bot');
  });

  test('status endpoint should respond', async ({ request }) => {
    const response = await request.get('/api/status');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('active');
    expect(data.bot).toBe('xCloud Bot');
  });
});
