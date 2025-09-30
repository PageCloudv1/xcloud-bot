#!/usr/bin/env node

const { AutonomousAgent } = require('../src/agents/AutonomousAgent');
const logger = require('../src/utils/logger');

/**
 * Script para testar o agente autônomo
 */
async function testAutonomousAgent() {
  console.log('🧪 Testando Agente Autônomo xCloud Bot');
  console.log('=====================================');

  const agent = new AutonomousAgent();

  // Payload de teste
  const testPayload = {
    action: 'assigned',
    issue: {
      number: 999,
      title: 'Test: Implement new feature for autonomous agent',
      body: 'This is a test issue to verify the autonomous agent functionality. Please implement a simple feature that demonstrates the bot capabilities.',
      html_url: 'https://github.com/PageCloudv1/xcloud-bot/issues/999'
    },
    assignee: {
      login: 'xcloud-bot'
    },
    repository: {
      full_name: 'PageCloudv1/xcloud-bot'
    }
  };

  try {
    console.log('📋 Payload de teste:');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('');

    // Verificar se é assignment do xBot
    const isXbot = agent.isXbotAssignment(testPayload.assignee);
    console.log(`🤖 É assignment do xBot: ${isXbot}`);

    if (!isXbot) {
      console.log('❌ Teste falhou: não reconheceu como assignment do xBot');
      return;
    }

    // Testar análise de tarefa
    console.log('🔍 Testando análise de tarefa...');
    const analysis = await agent.analyzeTask({
      issue: testPayload.issue,
      repository: testPayload.repository.full_name
    });

    console.log('📊 Resultado da análise:');
    console.log(JSON.stringify(analysis, null, 2));
    console.log('');

    // Verificar se Podman está disponível
    console.log('🐳 Verificando disponibilidade do Podman...');
    const { exec } = require('child_process');
    
    const podmanAvailable = await new Promise((resolve) => {
      exec('podman --version', (error, stdout) => {
        if (error) {
          console.log('❌ Podman não está disponível:', error.message);
          resolve(false);
        } else {
          console.log('✅ Podman disponível:', stdout.trim());
          resolve(true);
        }
      });
    });

    if (!podmanAvailable) {
      console.log('⚠️ Pulando teste de container (Podman não disponível)');
      console.log('💡 Para testar completamente, instale o Podman');
    } else {
      console.log('🚀 Podman disponível, teste completo possível');
    }

    // Testar geração de resumo
    console.log('📝 Testando geração de resumo...');
    const mockResult = {
      type: 'feature',
      actions: [
        { action: 'analyze_code', status: 'completed' },
        { action: 'implement_feature', status: 'completed' },
        { action: 'add_tests', status: 'completed' }
      ],
      files_changed: ['feature-999.js'],
      tests_added: ['tests/feature-999.test.js']
    };

    const summary = agent.generateTaskSummary(
      { issue: testPayload.issue },
      analysis,
      mockResult
    );

    console.log('📄 Resumo gerado:');
    console.log(summary);
    console.log('');

    // Testar lista de tarefas ativas
    console.log('📋 Testando lista de tarefas ativas...');
    const activeTasks = agent.getActiveTasks();
    console.log(`Tarefas ativas: ${activeTasks.length}`);
    console.log(JSON.stringify(activeTasks, null, 2));

    console.log('');
    console.log('✅ Todos os testes básicos passaram!');
    console.log('');
    console.log('🎯 Próximos passos para teste completo:');
    console.log('1. Configure as variáveis de ambiente (GITHUB_TOKEN, etc.)');
    console.log('2. Instale o Podman se não estiver disponível');
    console.log('3. Execute o bot e faça um assignment real');
    console.log('4. Monitore os logs para ver o agente em ação');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAutonomousAgent();
}

module.exports = { testAutonomousAgent };