/**
 * 🧪 Webhook Test Utility
 *
 * Tests webhook functionality by sending sample payloads
 */

console.log('🧪 Starting webhook tests...');

const samplePayload = {
  action: 'opened',
  repository: {
    name: 'xcloud-bot',
    full_name: 'PageCloudv1/xcloud-bot',
  },
  pull_request: {
    number: 1,
    title: 'Test PR',
  },
};

async function testWebhook() {
  try {
    const response = await fetch('http://localhost:3000/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'pull_request',
      },
      body: JSON.stringify(samplePayload),
    });

    if (response.ok) {
      console.log('✅ Webhook test passed');
    } else {
      console.log('❌ Webhook test failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Webhook test error:', error.message);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWebhook();
}
