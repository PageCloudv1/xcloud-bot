/**
 * 🧪 CD Workflow Tests - Deploy Contínuo
 * 
 * Tests for the cd.yml workflow configuration
 * Validates continuous deployment process for different environments
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('CD Workflow - Deploy Contínuo', () => {
  let cdWorkflow;
  let deployWorkflow;

  beforeAll(() => {
    // Load cd.yml workflow
    const cdPath = path.join(__dirname, '../../../.github/workflows/cd.yml');
    const cdContent = fs.readFileSync(cdPath, 'utf8');
    cdWorkflow = yaml.load(cdContent);

    // Load deploy.yml workflow (actual deployment workflow)
    const deployPath = path.join(__dirname, '../../../.github/workflows/deploy.yml');
    const deployContent = fs.readFileSync(deployPath, 'utf8');
    deployWorkflow = yaml.load(deployContent);
  });

  describe('CD Workflow Configuration', () => {
    it('should have correct workflow name', () => {
      expect(cdWorkflow.name).toBe('🚀 CD');
    });

    it('should have release trigger for published releases', () => {
      expect(cdWorkflow.on.release).toBeDefined();
      expect(cdWorkflow.on.release.types).toContain('published');
    });

    it('should be reusable via workflow_call', () => {
      expect(cdWorkflow.on.workflow_call).toBeDefined();
    });

    it('should have publish job', () => {
      expect(cdWorkflow.jobs.publish).toBeDefined();
    });
  });

  describe('Deploy Workflow - Advanced Environment Management', () => {
    it('should have correct workflow name', () => {
      expect(deployWorkflow.name).toBe('🚀 Deploy - Advanced Environment Management');
    });

    it('should support manual workflow dispatch', () => {
      expect(deployWorkflow.on.workflow_dispatch).toBeDefined();
    });

    it('should be reusable via workflow_call', () => {
      expect(deployWorkflow.on.workflow_call).toBeDefined();
    });

    it('should have environment input with staging and production options', () => {
      const envInput = deployWorkflow.on.workflow_dispatch.inputs.environment;
      expect(envInput).toBeDefined();
      expect(envInput.type).toBe('choice');
      expect(envInput.options).toContain('development');
      expect(envInput.options).toContain('staging');
      expect(envInput.options).toContain('production');
      expect(envInput.default).toBe('staging');
    });

    it('should have deployment strategy input', () => {
      const strategyInput = deployWorkflow.on.workflow_dispatch.inputs.deployment_strategy;
      expect(strategyInput).toBeDefined();
      expect(strategyInput.type).toBe('choice');
      expect(strategyInput.options).toContain('rolling');
      expect(strategyInput.options).toContain('blue-green');
      expect(strategyInput.options).toContain('canary');
    });

    it('should have workflow outputs for deployment URL and version', () => {
      const outputs = deployWorkflow.on.workflow_call.outputs;
      expect(outputs['deployment-url']).toBeDefined();
      expect(outputs['deployment-version']).toBeDefined();
    });
  });

  describe('🚀 Deploy automático para staging', () => {
    it('should have validate-environment job for staging', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      expect(validateJob).toBeDefined();
      expect(validateJob.name).toBe('🔒 Validate Environment & Secrets');
    });

    it('should configure staging environment correctly', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      const configStep = validateJob.steps.find(step => step.name === '🔧 Configure environment settings');
      expect(configStep).toBeDefined();
      expect(configStep.run).toContain('staging');
      expect(configStep.run).toContain('https://staging.xcloud-bot.example.com');
    });

    it('should not require approval for staging', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      const configStep = validateJob.steps.find(step => step.name === '🔧 Configure environment settings');
      expect(configStep.run).toContain('requires-approval=false');
    });

    it('should have deploy job for staging', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      expect(deployJob).toBeDefined();
      expect(deployJob.name).toContain('Deploy to');
    });
  });

  describe('🚀 Deploy automático para production', () => {
    it('should configure production environment correctly', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      const configStep = validateJob.steps.find(step => step.name === '🔧 Configure environment settings');
      expect(configStep).toBeDefined();
      expect(configStep.run).toContain('production');
      expect(configStep.run).toContain('https://xcloud-bot.example.com');
    });

    it('should require approval for production', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      const configStep = validateJob.steps.find(step => step.name === '🔧 Configure environment settings');
      expect(configStep.run).toContain('requires-approval=true');
    });

    it('should have production approval gate', () => {
      const approvalJob = deployWorkflow.jobs['production-approval'];
      expect(approvalJob).toBeDefined();
      expect(approvalJob.name).toBe('🛡️ Production Approval Gate');
      expect(approvalJob.environment.name).toBe('production');
    });

    it('should have conditional deployment for production', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      expect(deployJob.if).toBeDefined();
      expect(deployJob.if).toContain('production-approval');
    });
  });

  describe('🔒 Validação de secrets e variáveis de ambiente', () => {
    it('should have secrets validation step', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      const secretStep = validateJob.steps.find(step => step.name === '🔐 Validate secrets');
      expect(secretStep).toBeDefined();
      expect(secretStep.run).toContain('Validating environment-specific secrets');
    });

    it('should define environment variables', () => {
      expect(deployWorkflow.env).toBeDefined();
      expect(deployWorkflow.env.NODE_VERSION).toBe('20');
      expect(deployWorkflow.env.DEPLOY_ENV).toBeDefined();
      expect(deployWorkflow.env.DEPLOYMENT_STRATEGY).toBeDefined();
    });

    it('should have environment-specific configuration', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      expect(validateJob.outputs).toBeDefined();
      expect(validateJob.outputs['deploy-url']).toBeDefined();
      expect(validateJob.outputs['health-endpoint']).toBeDefined();
      expect(validateJob.outputs['requires-approval']).toBeDefined();
    });
  });

  describe('📦 Build e empacotamento da aplicação', () => {
    it('should have pre-deployment checks job', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      expect(preDeployJob).toBeDefined();
      expect(preDeployJob.name).toBe('🧪 Pre-deployment Checks');
    });

    it('should build application before deployment', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      const buildStep = preDeployJob.steps.find(step => step.name === '🏗️ Build application');
      expect(buildStep).toBeDefined();
      expect(buildStep.run).toBe('npm run build');
    });

    it('should install dependencies', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      const installStep = preDeployJob.steps.find(step => step.name === '📦 Install dependencies');
      expect(installStep).toBeDefined();
      expect(installStep.run).toBe('npm ci');
    });

    it('should upload deployment artifacts', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      const uploadStep = preDeployJob.steps.find(step => step.name === '📤 Upload deployment artifacts');
      expect(uploadStep).toBeDefined();
      expect(uploadStep.uses).toBe('actions/upload-artifact@v4');
      expect(uploadStep.with.path).toContain('dist/');
    });

    it('should generate deployment report', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      const reportStep = preDeployJob.steps.find(step => step.name === '📊 Generate deployment report');
      expect(reportStep).toBeDefined();
    });
  });

  describe('🔍 Verificação de saúde pós-deploy', () => {
    it('should have health checks job', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      expect(healthJob).toBeDefined();
      expect(healthJob.name).toBe('🏥 Health Checks');
    });

    it('should depend on deploy job', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      expect(healthJob.needs).toContain('deploy');
    });

    it('should check application startup', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      const startupCheck = healthJob.steps.find(step => step.name === '🔍 Application startup check');
      expect(startupCheck).toBeDefined();
    });

    it('should check database connections', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      const dbCheck = healthJob.steps.find(step => step.name === '🗄️ Database connection check');
      expect(dbCheck).toBeDefined();
    });

    it('should check external APIs', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      const apiCheck = healthJob.steps.find(step => step.name === '🌐 External API checks');
      expect(apiCheck).toBeDefined();
    });

    it('should check performance metrics', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      const perfCheck = healthJob.steps.find(step => step.name === '📊 Performance metrics check');
      expect(perfCheck).toBeDefined();
    });

    it('should monitor error rates', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      const errorCheck = healthJob.steps.find(step => step.name === '🚨 Error rate monitoring');
      expect(errorCheck).toBeDefined();
    });

    it('should perform comprehensive health check', () => {
      const healthJob = deployWorkflow.jobs['health-checks'];
      const comprehensiveCheck = healthJob.steps.find(step => step.name === '🏥 Comprehensive health check');
      expect(comprehensiveCheck).toBeDefined();
      expect(comprehensiveCheck.run).toContain('health-endpoint');
    });
  });

  describe('📝 Notificação de status de deploy', () => {
    it('should have post-deployment monitoring job', () => {
      const monitoringJob = deployWorkflow.jobs['post-deployment-monitoring'];
      expect(monitoringJob).toBeDefined();
      expect(monitoringJob.name).toBe('📊 Post-deployment Monitoring');
    });

    it('should send deployment notifications', () => {
      const monitoringJob = deployWorkflow.jobs['post-deployment-monitoring'];
      const notificationStep = monitoringJob.steps.find(step => step.name === '🔔 Send notifications');
      expect(notificationStep).toBeDefined();
      expect(notificationStep.run).toContain('Sending deployment notifications');
      expect(notificationStep.run).toContain('completed successfully');
    });

    it('should collect deployment metrics', () => {
      const monitoringJob = deployWorkflow.jobs['post-deployment-monitoring'];
      const metricsStep = monitoringJob.steps.find(step => step.name === '📈 Collect deployment metrics');
      expect(metricsStep).toBeDefined();
      expect(metricsStep.run).toContain('Collecting deployment metrics');
    });

    it('should only run after successful deployment and health checks', () => {
      const monitoringJob = deployWorkflow.jobs['post-deployment-monitoring'];
      expect(monitoringJob.if).toContain('deploy.result == \'success\'');
      expect(monitoringJob.if).toContain('health-checks.result == \'success\'');
    });
  });

  describe('🔄 Rollback em caso de falha', () => {
    it('should have rollback job', () => {
      const rollbackJob = deployWorkflow.jobs.rollback;
      expect(rollbackJob).toBeDefined();
      expect(rollbackJob.name).toBe('🔄 Rollback on Failure');
    });

    it('should trigger on deployment failure', () => {
      const rollbackJob = deployWorkflow.jobs.rollback;
      expect(rollbackJob.if).toContain('deploy.result == \'failure\'');
    });

    it('should trigger on health check failure', () => {
      const rollbackJob = deployWorkflow.jobs.rollback;
      expect(rollbackJob.if).toContain('health-checks.result == \'failure\'');
    });

    it('should detect deployment failures', () => {
      const rollbackJob = deployWorkflow.jobs.rollback;
      const failureStep = rollbackJob.steps.find(step => step.name === '🚨 Deployment failure detected');
      expect(failureStep).toBeDefined();
      expect(failureStep.run).toContain('Deployment failure detected');
    });

    it('should execute rollback procedure', () => {
      const rollbackJob = deployWorkflow.jobs.rollback;
      const rollbackStep = rollbackJob.steps.find(step => step.name === '🔄 Execute rollback');
      expect(rollbackStep).toBeDefined();
      expect(rollbackStep.run).toContain('Initiating rollback');
    });

    it('should send rollback notifications', () => {
      const rollbackJob = deployWorkflow.jobs.rollback;
      const notificationStep = rollbackJob.steps.find(step => step.name === '🔔 Rollback notification');
      expect(notificationStep).toBeDefined();
      expect(notificationStep.run).toContain('Sending rollback notifications');
    });
  });

  describe('Deployment Strategies', () => {
    it('should support rolling deployment strategy', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      const deployStep = deployJob.steps.find(step => step.name === '🚀 Execute deployment strategy');
      expect(deployStep).toBeDefined();
      expect(deployStep.run).toContain('rolling');
      expect(deployStep.run).toContain('Executing rolling deployment');
    });

    it('should support blue-green deployment strategy', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      const deployStep = deployJob.steps.find(step => step.name === '🚀 Execute deployment strategy');
      expect(deployStep.run).toContain('blue-green');
      expect(deployStep.run).toContain('Executing blue-green deployment');
    });

    it('should support canary deployment strategy', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      const deployStep = deployJob.steps.find(step => step.name === '🚀 Execute deployment strategy');
      expect(deployStep.run).toContain('canary');
      expect(deployStep.run).toContain('Executing canary deployment');
    });
  });

  describe('Deployment Job Configuration', () => {
    it('should use GitHub environments', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      expect(deployJob.environment).toBeDefined();
      expect(deployJob.environment.name).toBeDefined();
      expect(deployJob.environment.url).toBeDefined();
    });

    it('should have deployment outputs', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      expect(deployJob.outputs).toBeDefined();
      expect(deployJob.outputs.url).toBeDefined();
      expect(deployJob.outputs.version).toBeDefined();
      expect(deployJob.outputs.strategy).toBeDefined();
    });

    it('should download deployment artifacts', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      const downloadStep = deployJob.steps.find(step => step.name === '📥 Download deployment artifacts');
      expect(downloadStep).toBeDefined();
      expect(downloadStep.uses).toBe('actions/download-artifact@v4');
    });

    it('should generate deployment info', () => {
      const deployJob = deployWorkflow.jobs.deploy;
      const infoStep = deployJob.steps.find(step => step.name === '📊 Deployment info');
      expect(infoStep).toBeDefined();
      expect(infoStep.run).toContain('version');
      expect(infoStep.run).toContain('GITHUB_OUTPUT');
    });
  });

  describe('Pre-deployment Validation', () => {
    it('should run tests before deployment', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      const testStep = preDeployJob.steps.find(step => step.name === '🧪 Run tests');
      expect(testStep).toBeDefined();
      expect(testStep.run).toBe('npm test');
    });

    it('should perform security checks', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      const securityStep = preDeployJob.steps.find(step => step.name === '🔍 Security checks');
      expect(securityStep).toBeDefined();
      expect(securityStep.run).toContain('npm audit');
    });

    it('should allow force deploy to skip checks', () => {
      const preDeployJob = deployWorkflow.jobs['pre-deployment-checks'];
      expect(preDeployJob.if).toContain('!inputs.force_deploy');
    });
  });

  describe('CD Workflow - Package Publishing', () => {
    it('should checkout code', () => {
      const publishJob = cdWorkflow.jobs.publish;
      const checkoutStep = publishJob.steps.find(step => step.uses === 'actions/checkout@v4');
      expect(checkoutStep).toBeDefined();
    });

    it('should setup Node.js', () => {
      const publishJob = cdWorkflow.jobs.publish;
      const nodeStep = publishJob.steps.find(step => step.uses === 'actions/setup-node@v4');
      expect(nodeStep).toBeDefined();
      expect(nodeStep.with['node-version']).toBe('20');
    });

    it('should install dependencies', () => {
      const publishJob = cdWorkflow.jobs.publish;
      const installStep = publishJob.steps.find(step => step.run === 'npm ci');
      expect(installStep).toBeDefined();
    });

    it('should build before publishing', () => {
      const publishJob = cdWorkflow.jobs.publish;
      const buildStep = publishJob.steps.find(step => step.run === 'npm run build');
      expect(buildStep).toBeDefined();
    });

    it('should publish package', () => {
      const publishJob = cdWorkflow.jobs.publish;
      const publishStep = publishJob.steps.find(step => step.run === 'npm publish');
      expect(publishStep).toBeDefined();
      expect(publishStep.env.NODE_AUTH_TOKEN).toBeDefined();
    });
  });

  describe('Environment-specific Configuration', () => {
    it('should support development environment', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      const configStep = validateJob.steps.find(step => step.name === '🔧 Configure environment settings');
      expect(configStep.run).toContain('development');
      expect(configStep.run).toContain('https://dev.xcloud-bot.local');
    });

    it('should validate invalid environments', () => {
      const validateJob = deployWorkflow.jobs['validate-environment'];
      const configStep = validateJob.steps.find(step => step.name === '🔧 Configure environment settings');
      expect(configStep.run).toContain('Invalid environment');
      expect(configStep.run).toContain('exit 1');
    });
  });
});
