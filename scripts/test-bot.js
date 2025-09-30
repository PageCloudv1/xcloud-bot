#!/usr/bin/env node
/**
 * 🧪 Script de Teste do xCloud Bot
 * 
 * Testa os endpoints do bot e simula webhooks do GitHub
 */

const BASE_URL = process.env.BOT_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60));
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`\n🔍 Testando: ${name}`, 'blue');
    log(`   URL: ${url}`, 'yellow');
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      log(`   ✅ Status: ${response.status}`, 'green');
      log(`   📦 Resposta:`, 'green');
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      log(`   ❌ Status: ${response.status}`, 'red');
      log(`   📦 Erro:`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testHealthCheck() {
  logSection('1️⃣  HEALTH CHECK');
  return await testEndpoint('Health Check', `${BASE_URL}/health`);
}

async function testInfo() {
  logSection('2️⃣  BOT INFO');
  return await testEndpoint('Bot Info', `${BASE_URL}/info`);
}

async function testWebhookIssueOpened() {
  logSection('3️⃣  WEBHOOK - ISSUE OPENED');
  
  const payload = {
    action: 'opened',
    issue: {
      number: 123,
      title: '🧪 Teste de Issue via Script',
      body: 'Esta é uma issue de teste criada pelo script de testes do xCloud Bot.\n\n## Detalhes\n- Teste automatizado\n- Simulação de webhook\n- Verificação de funcionalidade',
      state: 'open',
      user: {
        login: 'test-user',
        type: 'User'
      },
      labels: [],
      assignees: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      html_url: 'https://github.com/PageCloudv1/xcloud-bot/issues/123'
    },
    repository: {
      name: 'xcloud-bot',
      full_name: 'PageCloudv1/xcloud-bot',
      owner: {
        login: 'PageCloudv1',
        type: 'Organization'
      },
      html_url: 'https://github.com/PageCloudv1/xcloud-bot'
    },
    sender: {
      login: 'test-user',
      type: 'User'
    },
    installation: {
      id: 12345678
    }
  };

  return await testEndpoint(
    'Webhook - Issue Opened',
    `${BASE_URL}/webhooks/github`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'issues',
        'X-GitHub-Delivery': `test-${Date.now()}`,
        'X-Hub-Signature-256': 'sha256=fake-signature-for-testing',
      },
      body: JSON.stringify(payload)
    }
  );
}

async function testWebhookIssueComment() {
  logSection('4️⃣  WEBHOOK - ISSUE COMMENT');
  
  const payload = {
    action: 'created',
    issue: {
      number: 123,
      title: '🧪 Teste de Issue via Script',
      state: 'open',
      user: {
        login: 'test-user',
        type: 'User'
      },
      html_url: 'https://github.com/PageCloudv1/xcloud-bot/issues/123'
    },
    comment: {
      id: 987654321,
      body: '@xcloud-bot help\n\nPreciso de ajuda com esta issue!',
      user: {
        login: 'test-user',
        type: 'User'
      },
      created_at: new Date().toISOString(),
      html_url: 'https://github.com/PageCloudv1/xcloud-bot/issues/123#issuecomment-987654321'
    },
    repository: {
      name: 'xcloud-bot',
      full_name: 'PageCloudv1/xcloud-bot',
      owner: {
        login: 'PageCloudv1',
        type: 'Organization'
      }
    },
    sender: {
      login: 'test-user',
      type: 'User'
    },
    installation: {
      id: 12345678
    }
  };

  return await testEndpoint(
    'Webhook - Issue Comment',
    `${BASE_URL}/webhooks/github`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'issue_comment',
        'X-GitHub-Delivery': `test-${Date.now()}`,
        'X-Hub-Signature-256': 'sha256=fake-signature-for-testing',
      },
      body: JSON.stringify(payload)
    }
  );
}

async function runAllTests() {
  log('\n🤖 xCloud Bot - Suite de Testes\n', 'cyan');
  log(`   Testando: ${BASE_URL}`, 'yellow');
  
  const results = [];
  
  // Testa endpoints básicos
  results.push(await testHealthCheck());
  results.push(await testInfo());
  
  // Testa webhooks (comentados por padrão - descomente se quiser testar)
  // Nota: Webhooks requerem assinatura válida em produção
  log('\n⚠️  Testes de webhook requerem desabilitar verificação de assinatura', 'yellow');
  log('   ou configurar WEBHOOK_SECRET corretamente\n', 'yellow');
  
  // results.push(await testWebhookIssueOpened());
  // results.push(await testWebhookIssueComment());
  
  // Resumo
  logSection('📊 RESUMO DOS TESTES');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`\n   ✅ Passou: ${passed}`, 'green');
  log(`   ❌ Falhou: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`   📈 Total: ${results.length}\n`, 'blue');
  
  if (failed === 0) {
    log('🎉 Todos os testes passaram!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Alguns testes falharam. Verifique os logs acima.', 'yellow');
    process.exit(1);
  }
}

// Menu interativo
async function showMenu() {
  log('\n🤖 xCloud Bot - Menu de Testes\n', 'cyan');
  log('1. ✅ Test Health Check', 'blue');
  log('2. ℹ️  Test Bot Info', 'blue');
  log('3. 📝 Test Webhook - Issue Opened', 'blue');
  log('4. 💬 Test Webhook - Issue Comment', 'blue');
  log('5. 🚀 Run All Tests', 'blue');
  log('0. ❌ Exit\n', 'red');
  
  // Para uso interativo, pode adicionar readline aqui
  // Por agora, executamos todos os testes
  await runAllTests();
}

// Execução
if (import.meta.url === `file://${process.argv[1]}`) {
  showMenu().catch(console.error);
}

export { testHealthCheck, testInfo, testWebhookIssueOpened, testWebhookIssueComment };
