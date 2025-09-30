const { AutonomousAgent } = require('../agents/AutonomousAgent');
import { AutonomousAgent } from '../agents/AutonomousAgent.js';
import { Octokit } from '@octokit/rest';
class GithubAgentHandler {
  constructor(githubToken, geminiApiKey, xbotUsername) {
    this.agent = new AutonomousAgent();
    this.agent = new AutonomousAgent(geminiApiKey);
    this.octokit = new Octokit({ auth: githubToken });
    this.xbotUsername = xbotUsername;

  async handleAssignmentEvent(eventPayload) {
    console.log('🤖 Processando evento de assignment...');
    const payload = JSON.parse(eventPayload); // Assume eventPayload is a JSON string of the github.event

    const { action, issue, assignee, repository } = payload;

    console.log(`Event: ${action}`);
    console.log(`Issue: #${issue.number}`);
    console.log(`Assignee: ${assignee.login}`);
    console.log(`Repository: ${repository.full_name}`);

    const assignedLogin = assignee.login;
    if (
      assignedLogin === 'xcloud-bot' ||
      assignedLogin === 'xbot' ||
      assignedLogin === this.xbotUsername
    ) {
      console.log('✅ xBot foi assignado, iniciando processamento...');
      const task = await this.agent.handleAssignment(payload);
      if (task) {
        console.log('✅ Tarefa criada:', task.id);
      } else {
        console.log('ℹ️ Não é assignment para xBot');
      }
      console.log(`XBOT_ASSIGNED=true`); // Log for GITHUB_OUTPUT
      return { xbotAssigned: true };
    } else {
      console.log(`ℹ️ Assignment não é para o xBot (${assignedLogin})`);
      console.log(`XBOT_ASSIGNED=false`); // Log for GITHUB_OUTPUT
      return { xbotAssigned: false };
    }
  }

  async handleManualAction(action, issueNumber, repositoryName) {
    console.log(`🔧 Executando ação manual: ${action}`);

    switch (action) {
      case 'simulate_assignment':
        console.log(`🎭 Simulando assignment para issue #${issueNumber}`);
        const [owner, repo] = repositoryName.split('/');
        const { data: issue } = await this.octokit.rest.issues.get({
          owner,
          repo,
          issue_number: issueNumber,
        });

        const simulatedPayload = {
          action: 'assigned',
          issue: {
            number: issue.number,
            title: issue.title,
            body: issue.body,
            login: this.xbotUsername // Simulate assignment to xbotUsername
          },
          assignee: {
            login: 'xcloud-bot', // Simulate assignment to xcloud-bot
          },
          repository: {
            full_name: repositoryName,
          },
        };

        const task = await this.agent.handleAssignment(simulatedPayload);
        if (task) {
          console.log('✅ Simulação concluída, tarefa criada:', task.id);
        } else {
          console.log('ℹ️ Simulação executada');
        }
        break;

      case 'check_status':
        console.log('📊 Verificando status das tarefas ativas...');
        const tasks = this.agent.getActiveTasks();
        console.log('Tarefas ativas:', JSON.stringify(tasks, null, 2));
        break;

      case 'stop_tasks':
        console.log('🛑 Parando todas as tarefas ativas...');
        await this.agent.stopAllTasks();
        console.log('✅ Todas as tarefas foram paradas');
        break;

      default:
        console.error(`❌ Ação não reconhecida: ${action}`);
        process.exit(1);
    }
  }
}

// Main execution logic for the script
(async () => {
  const args = process.argv.slice(2);
  const actionType = args[0]; // e.g., 'handleAssignmentEvent' or 'handleManualAction'
  const githubToken = args[1];
  const geminiApiKey = args[2];
  const xbotUsername = args[3];

  const handler = new GithubAgentHandler(githubToken, geminiApiKey, xbotUsername);

  try {
    if (actionType === 'handleAssignmentEvent') {
      const eventPayload = args[4];
      await handler.handleAssignmentEvent(eventPayload);
    } else if (actionType === 'handleManualAction') {
      const manualAction = args[4];
      const issueNumber = parseInt(args[5], 10);
      const repositoryName = args[6];
      await handler.handleManualAction(manualAction, issueNumber, repositoryName);
    } else {
      console.error(`❌ Tipo de a\u00e7\u00e3o desconhecido: ${actionType}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro durante a execução do agente:', error.message);
    console.error('❌ Erro durante a execução do agente:', error);
  }
})();
