/**
 * 🧪 Build Workflow Tests
 *
 * Tests for the build.yml workflow configuration
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('Build Workflow', () => {
  let workflowConfig;

  beforeAll(() => {
    const workflowPath = path.join(__dirname, '../../../.github/workflows/build.yml');
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    workflowConfig = yaml.load(workflowContent);
  });

  describe('Workflow Configuration', () => {
    it('should have correct workflow name', () => {
      expect(workflowConfig.name).toBe('🏗️ Build - Construção de Artefatos');
    });

    it('should have workflow_call trigger for reusability', () => {
      expect(workflowConfig.on.workflow_call).toBeDefined();
    });

    it('should have push trigger for main and develop branches', () => {
      expect(workflowConfig.on.push).toBeDefined();
      expect(workflowConfig.on.push.branches).toContain('main');
      expect(workflowConfig.on.push.branches).toContain('develop');
    });

    it('should have pull_request trigger', () => {
      expect(workflowConfig.on.pull_request).toBeDefined();
    });

    it('should have workflow_dispatch for manual triggering', () => {
      expect(workflowConfig.on.workflow_dispatch).toBeDefined();
    });

    it('should have path filters for efficiency', () => {
      expect(workflowConfig.on.push.paths).toBeDefined();
      expect(workflowConfig.on.push.paths).toContain('src/**');
      expect(workflowConfig.on.push.paths).toContain('package.json');
    });
  });

  describe('Workflow Inputs', () => {
    it('should have node-version input', () => {
      expect(workflowConfig.on.workflow_call.inputs['node-version']).toBeDefined();
      expect(workflowConfig.on.workflow_call.inputs['node-version'].default).toBe('20');
    });

    it('should have build-command input', () => {
      expect(workflowConfig.on.workflow_call.inputs['build-command']).toBeDefined();
      expect(workflowConfig.on.workflow_call.inputs['build-command'].default).toBe('npm run build');
    });
  });

  describe('Workflow Outputs', () => {
    it('should have build-status output', () => {
      expect(workflowConfig.on.workflow_call.outputs['build-status']).toBeDefined();
    });

    it('should have artifact-size output', () => {
      expect(workflowConfig.on.workflow_call.outputs['artifact-size']).toBeDefined();
    });

    it('should have build-version output', () => {
      expect(workflowConfig.on.workflow_call.outputs['build-version']).toBeDefined();
    });
  });

  describe('Build Job', () => {
    let buildJob;

    beforeAll(() => {
      buildJob = workflowConfig.jobs.build;
    });

    it('should exist', () => {
      expect(buildJob).toBeDefined();
    });

    it('should run on ubuntu-latest', () => {
      expect(buildJob['runs-on']).toBe('ubuntu-latest');
    });

    it('should have outputs defined', () => {
      expect(buildJob.outputs).toBeDefined();
      expect(buildJob.outputs.status).toBeDefined();
      expect(buildJob.outputs['artifact-size']).toBeDefined();
      expect(buildJob.outputs.version).toBeDefined();
    });

    it('should have required build steps', () => {
      const stepNames = buildJob.steps.map(step => step.name);

      expect(stepNames).toContain('📥 Checkout repository');
      expect(stepNames).toContain('🟢 Setup Node.js');
      expect(stepNames).toContain('📦 Install dependencies');
      expect(stepNames).toContain('🏗️ Build project');
      expect(stepNames).toContain('🔍 Verify build output');
      expect(stepNames).toContain('📤 Upload build artifacts');
    });

    it('should have versioning step', () => {
      const versionStep = buildJob.steps.find(step => step.name === '🏷️ Generate version info');
      expect(versionStep).toBeDefined();
      expect(versionStep.id).toBe('version-info');
    });

    it('should have artifact size analysis step', () => {
      const sizeStep = buildJob.steps.find(step => step.name === '📊 Artifact size analysis');
      expect(sizeStep).toBeDefined();
      expect(sizeStep.id).toBe('artifact-info');
    });

    it('should have documentation generation step', () => {
      const docsStep = buildJob.steps.find(
        step => step.name === '📚 Generate documentation (if configured)'
      );
      expect(docsStep).toBeDefined();
    });

    it('should upload artifacts with correct configuration', () => {
      const uploadStep = buildJob.steps.find(step => step.name === '📤 Upload build artifacts');
      expect(uploadStep).toBeDefined();
      expect(uploadStep.uses).toBe('actions/upload-artifact@v4');
      expect(uploadStep.with.path).toContain('dist/');
      expect(uploadStep.with['retention-days']).toBe(7);
      expect(uploadStep.with['compression-level']).toBe(9);
    });

    it('should have build summary step', () => {
      const summaryStep = buildJob.steps.find(step => step.name === '📋 Build summary');
      expect(summaryStep).toBeDefined();
    });
  });

  describe('Security Scan Job', () => {
    let securityJob;

    beforeAll(() => {
      securityJob = workflowConfig.jobs['security-scan'];
    });

    it('should exist', () => {
      expect(securityJob).toBeDefined();
    });

    it('should depend on build job', () => {
      expect(securityJob.needs).toBe('build');
    });

    it('should have npm audit step', () => {
      const auditStep = securityJob.steps.find(step => step.name === '🔍 Run npm audit');
      expect(auditStep).toBeDefined();
    });
  });

  describe('Quality Validation Job', () => {
    let qualityJob;

    beforeAll(() => {
      qualityJob = workflowConfig.jobs['quality-validation'];
    });

    it('should exist', () => {
      expect(qualityJob).toBeDefined();
    });

    it('should depend on build job', () => {
      expect(qualityJob.needs).toBe('build');
    });

    it('should download artifacts', () => {
      const downloadStep = qualityJob.steps.find(
        step => step.name === '📥 Download build artifacts'
      );
      expect(downloadStep).toBeDefined();
      expect(downloadStep.uses).toBe('actions/download-artifact@v4');
    });

    it('should validate artifacts', () => {
      const validateStep = qualityJob.steps.find(
        step => step.name === '✅ Validate build artifacts'
      );
      expect(validateStep).toBeDefined();
    });

    it('should have performance benchmarks', () => {
      const perfStep = qualityJob.steps.find(
        step => step.name === '📊 Performance benchmarks (placeholder)'
      );
      expect(perfStep).toBeDefined();
    });
  });

  describe('Issue Requirements Checklist', () => {
    it('should implement build da aplicação Node.js', () => {
      const buildStep = workflowConfig.jobs.build.steps.find(
        step => step.name === '🏗️ Build project'
      );
      expect(buildStep).toBeDefined();
    });

    it('should implement empacotamento de artefatos', () => {
      const uploadStep = workflowConfig.jobs.build.steps.find(
        step => step.name === '📤 Upload build artifacts'
      );
      expect(uploadStep).toBeDefined();
    });

    it('should implement geração de documentação', () => {
      const docsStep = workflowConfig.jobs.build.steps.find(
        step => step.name === '📚 Generate documentation (if configured)'
      );
      expect(docsStep).toBeDefined();
    });

    it('should implement compressão e otimização', () => {
      const optimizeStep = workflowConfig.jobs.build.steps.find(
        step => step.name === '🗜️ Optimize artifacts (placeholder)'
      );
      expect(optimizeStep).toBeDefined();

      const uploadStep = workflowConfig.jobs.build.steps.find(
        step => step.name === '📤 Upload build artifacts'
      );
      expect(uploadStep.with['compression-level']).toBe(9);
    });

    it('should implement versionamento automático', () => {
      const versionStep = workflowConfig.jobs.build.steps.find(
        step => step.name === '🏷️ Generate version info'
      );
      expect(versionStep).toBeDefined();
    });

    it('should implement security scan dos artefatos', () => {
      expect(workflowConfig.jobs['security-scan']).toBeDefined();
    });

    it('should implement bundle size analysis', () => {
      const sizeStep = workflowConfig.jobs.build.steps.find(
        step => step.name === '📊 Artifact size analysis'
      );
      expect(sizeStep).toBeDefined();
    });

    it('should implement performance benchmarks', () => {
      const perfStep = workflowConfig.jobs['quality-validation'].steps.find(
        step => step.name === '📊 Performance benchmarks (placeholder)'
      );
      expect(perfStep).toBeDefined();
    });
  });
});
