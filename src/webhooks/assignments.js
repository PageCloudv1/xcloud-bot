const logger = require('../utils/logger');
const { AutonomousAgent } = require('../agents/AutonomousAgent');

/**
 * Handler para webhooks de assignments
 */
class AssignmentHandler {
  constructor() {
    this.autonomousAgent = new AutonomousAgent();
  }

  /**
   * Processa webhook de assignment
   * @param {Object} payload - Payload do webhook
   * @param {Object} context - Contexto do webhook
   */
  async handleAssignment(payload, context) {
    try {
      logger.info('📥 Webhook de assignment recebido', {
        action: payload.action,
        issue: payload.issue?.number,
        assignee: payload.assignee?.login,
        repository: payload.repository?.full_name
      });

      // Verificar se é um assignment (não unassignment)
      if (payload.action !== 'assigned') {
        logger.info('ℹ️ Não é um assignment, ignorando');
        return;
      }

      // Verificar se tem issue
      if (!payload.issue) {
        logger.info('ℹ️ Não é um issue, ignorando');
        return;
      }

      // Verificar se tem assignee
      if (!payload.assignee) {
        logger.info('ℹ️ Sem assignee, ignorando');
        return;
      }

      // Processar assignment com o agente autônomo
      const task = await this.autonomousAgent.handleAssignment(payload);
      
      if (task) {
        logger.info(`✅ Tarefa criada: ${task.id}`);
        return {
          success: true,
          taskId: task.id,
          message: 'xBot assignment processado com sucesso'
        };
      } else {
        logger.info('ℹ️ Assignment não é para o xBot');
        return {
          success: false,
          message: 'Assignment não é para o xBot'
        };
      }

    } catch (error) {
      logger.error('❌ Erro ao processar assignment:', error);
      throw error;
    }
  }

  /**
   * Processa webhook de unassignment
   * @param {Object} payload - Payload do webhook
   * @param {Object} context - Contexto do webhook
   */
  async handleUnassignment(payload, context) {
    try {
      logger.info('📤 Webhook de unassignment recebido', {
        action: payload.action,
        issue: payload.issue?.number,
        assignee: payload.assignee?.login,
        repository: payload.repository?.full_name
      });

      // Verificar se é unassignment do xBot
      if (payload.action === 'unassigned' && payload.assignee) {
        const isXbot = this.autonomousAgent.isXbotAssignment(payload.assignee);
        
        if (isXbot) {
          logger.info('🛑 xBot foi removido do assignment, cancelando tarefas relacionadas');
          
          // Aqui poderíamos implementar lógica para cancelar tarefas em andamento
          // Por enquanto, apenas logamos
          
          return {
            success: true,
            message: 'xBot unassignment processado'
          };
        }
      }

      return {
        success: false,
        message: 'Unassignment não é do xBot'
      };

    } catch (error) {
      logger.error('❌ Erro ao processar unassignment:', error);
      throw error;
    }
  }

  /**
   * Handler principal para todos os eventos de assignment
   * @param {Object} payload - Payload do webhook
   * @param {Object} context - Contexto do webhook
   */
  async handle(payload, context) {
    try {
      switch (payload.action) {
        case 'assigned':
          return await this.handleAssignment(payload, context);
          
        case 'unassigned':
          return await this.handleUnassignment(payload, context);
          
        default:
          logger.info(`ℹ️ Ação de assignment não suportada: ${payload.action}`);
          return {
            success: false,
            message: `Ação não suportada: ${payload.action}`
          };
      }
    } catch (error) {
      logger.error('❌ Erro no handler de assignment:', error);
      throw error;
    }
  }

  /**
   * Obtém status das tarefas ativas
   * @returns {Array} Lista de tarefas ativas
   */
  getActiveTasks() {
    return this.autonomousAgent.getActiveTasks();
  }

  /**
   * Para todas as tarefas ativas
   */
  async stopAllTasks() {
    return await this.autonomousAgent.stopAllTasks();
  }
}

module.exports = { AssignmentHandler };