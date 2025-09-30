
/**
 * Script para debugar problemas de assignment do xCloud Bot
 */

require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const { App } = require('@octokit/app');

async function debugBotAssignment() {
  console.log('🔍 Debugging xCloud Bot Assignment Issues...\n');

  // 1. Verificar configuração básica
  console.log('1. 📋 Verificando configuração...');
  const requiredEnvVars = ['GITHUB_TOKEN', 'GITHUB_APP_ID', 'GITHUB_PRIVATE_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log(`❌ Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
    return;
  }
  console.log('✅ Variáveis de ambiente configuradas');

  // 2. Verificar informações do bot
  console.log('\n2. 🤖 Verificando informações do bot...');
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`✅ Bot Username: ${user.login}`);
    console.log(`✅ Bot Type: ${user.type}`);
    console.log(`✅ Bot ID: ${user.id}`);

    // Verificar se o username está na lista de usernames reconhecidos
    const recognizedUsernames = [
      'xcloud-bot',
      'xbot',
      'xcloud-assistant',
      `${user.login}`,
      `${user.login.toLowerCase()}`,
    ];

    console.log(`✅ Usernames reconhecidos: ${recognizedUsernames.join(', ')}`);
  } catch (error) {
    console.log(`❌ Erro ao obter informações do bot: ${error.message}`);
  }

  // 3. Verificar GitHub App
  console.log('\n3. 🏢 Verificando GitHub App...');
  try {
    const app = new App({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY,
    });

    const { data: appInfo } = await app.octokit.rest.apps.getAuthenticated();
    console.log(`✅ App Name: ${appInfo.name}`);
    console.log(`✅ App Slug: ${appInfo.slug}`);
    console.log(`✅ App Owner: ${appInfo.owner.login}`);

    // Verificar instalações
    const { data: installations } = await app.octokit.rest.apps.listInstallations();
    console.log(`✅ Instalações: ${installations.length}`);

    for (const installation of installations) {
      console.log(`  - ${installation.account.login} (${installation.account.type})`);
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar GitHub App: ${error.message}`);
  }

  // 4. Verificar permissões
  console.log('\n4. 🔐 Verificando permissões...');
  try {
    const app = new App({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY,
    });

    const { data: installations } = await app.octokit.rest.apps.listInstallations();

    if (installations.length > 0) {
      const installation = installations[0];
      const installationOctokit = await app.getInstallationOctokit(installation.id);

      const { data: installationInfo } = await installationOctokit.rest.apps.getInstallation({
        installation_id: installation.id,
      });

      console.log('✅ Permissões da instalação:');
      Object.entries(installationInfo.permissions).forEach(([permission, level]) => {
        console.log(`  - ${permission}: ${level}`);
      });

      console.log('✅ Eventos subscritos:');
      installationInfo.events.forEach(event => {
        console.log(`  - ${event}`);
      });
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar permissões: ${error.message}`);
  }

  // 5. Testar função de reconhecimento
  console.log('\n5. 🧪 Testando função de reconhecimento...');

  const { AutonomousAgent } = require('../src/agents/AutonomousAgent');
  const agent = new AutonomousAgent();

  const testAssignees = [
    { login: 'xcloud-bot' },
    { login: 'xcloud-bot[bot]' },
    { login: 'xbot' },
    { login: 'xbot[bot]' },
    { login: 'random-user' },
  ];

  testAssignees.forEach(assignee => {
    const isRecognized = agent.isXbotAssignment(assignee);
    console.log(`  - ${assignee.login}: ${isRecognized ? '✅' : '❌'}`);
  });

  console.log('\n🎯 Resumo e Recomendações:');
  console.log('1. Verifique se o GitHub App está instalado no repositório');
  console.log('2. Verifique se as permissões "Issues: Read & Write" estão habilitadas');
  console.log('3. Verifique se o evento "issues" está subscrito');
  console.log('4. Verifique se o CODEOWNERS inclui o bot');
  console.log('5. Tente usar o username exato mostrado acima para assignments');
}

if (require.main === module) {
  debugBotAssignment().catch(console.error);
}

module.exports = { debugBotAssignment };
