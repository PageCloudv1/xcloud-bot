/**
 * 🏗️ Workflow Creator
 * 
 * Cria workflows GitHub Actions automaticamente
 */

import fs from 'fs/promises';
import path from 'path';
import { createIssue } from '../integrations/github-api.js';

// Templates de workflows
const WORKFLOW_TEMPLATES = {
    ci: `name: 🔄 CI - Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  
jobs:
  quality-checks:
    name: 🧪 Quality Checks
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🔍 Lint code
      run: npm run lint
      
    - name: 🎨 Check code formatting
      run: npm run format:check
      
    - name: 🛡️ Security audit
      run: npm audit --audit-level=moderate
      
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: quality-checks
    
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🏗️ Build project
      run: npm run build
      
    - name: 📤 Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files
        path: dist/
        retention-days: 7
        
  test:
    name: 🧪 Test
    runs-on: ubuntu-latest
    needs: quality-checks
    
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🧪 Run tests
      run: npm test
      
    - name: 📊 Upload coverage reports
      uses: codecov/codecov-action@v3
      if: success()
      with:
        files: ./coverage/lcov.info
        flags: unittests
        name: coverage-report`,

    build: `name: 🏗️ Build

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use'
        required: false
        default: '20'
        type: string
      build-command:
        description: 'Build command to run'
        required: false
        default: 'npm run build'
        type: string
    outputs:
      build-status:
        description: "Build status"
        value: \${{ jobs.build.outputs.status }}
        
  push:
    branches: [ main, develop ]
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
  workflow_dispatch:

env:
  NODE_VERSION: \${{ inputs.node-version || '20' }}
  
jobs:
  build:
    name: 🏗️ Build Project
    runs-on: ubuntu-latest
    
    outputs:
      status: \${{ steps.build-status.outputs.status }}
      
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🏗️ Build project
      run: \${{ inputs.build-command || 'npm run build' }}
      env:
        CI: true
        
    - name: 🔍 Verify build output
      id: build-status
      run: |
        if [ -d "dist" ] || [ -d "build" ]; then
          echo "✅ Build completed successfully"
          echo "status=success" >> $GITHUB_OUTPUT
        else
          echo "❌ Build output not found"
          echo "status=failed" >> $GITHUB_OUTPUT
          exit 1
        fi
        
    - name: 📤 Upload build artifacts
      uses: actions/upload-artifact@v4
      if: success()
      with:
        name: build-artifacts
        path: |
          dist/
          build/
        retention-days: 7`,

    test: `name: 🧪 Test

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use'
        required: false
        default: '20'
        type: string
    outputs:
      test-status:
        description: "Test status"
        value: \${{ jobs.test.outputs.status }}
        
  push:
    branches: [ main, develop ]
    paths:
      - 'src/**'
      - 'test/**'
      - 'tests/**'
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

env:
  NODE_VERSION: \${{ inputs.node-version || '20' }}
  
jobs:
  unit-tests:
    name: 🔬 Unit Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🔬 Run unit tests
      run: npm run test:unit || npm test
      
  integration-tests:
    name: 🔗 Integration Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🔗 Run integration tests
      run: npm run test:integration || echo "No integration tests"
      
  test:
    name: 🧪 Test Summary
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    if: always()
    
    outputs:
      status: \${{ steps.test-status.outputs.status }}
      
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 📊 Generate coverage report
      run: npm run test:coverage || npm test
      
    - name: 📊 Upload coverage
      uses: codecov/codecov-action@v3
      if: success()
      with:
        files: ./coverage/lcov.info
        
    - name: 📊 Test status
      id: test-status
      run: |
        if [ "\${{ needs.unit-tests.result }}" == "success" ]; then
          echo "status=success" >> $GITHUB_OUTPUT
        else
          echo "status=failed" >> $GITHUB_OUTPUT
        fi`,

    deploy: `name: 🚀 Deploy

on:
  workflow_call:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: string
    outputs:
      deployment-url:
        description: "Deployment URL"
        value: \${{ jobs.deploy.outputs.url }}
        
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
        - staging
        - production

env:
  NODE_VERSION: '20'
  DEPLOY_ENV: \${{ inputs.environment }}
  
jobs:
  deploy:
    name: 🚀 Deploy to \${{ inputs.environment }}
    runs-on: ubuntu-latest
    
    outputs:
      url: \${{ steps.deploy-info.outputs.url }}
      
    steps:
    - name: 📥 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🏗️ Build for deployment
      run: npm run build
      
    - name: 🚀 Deploy application
      run: |
        echo "🚀 Deploying to \${{ env.DEPLOY_ENV }}..."
        # Add your deployment commands here
        
    - name: 📊 Deployment info
      id: deploy-info
      run: |
        case "\${{ env.DEPLOY_ENV }}" in
          "staging")
            echo "url=https://staging.example.com" >> $GITHUB_OUTPUT
            ;;
          "production")
            echo "url=https://production.example.com" >> $GITHUB_OUTPUT
            ;;
        esac`
};

/**
 * Cria arquivo de workflow
 * @param {string} workflowType - Tipo do workflow
 * @param {string} outputPath - Caminho de saída
 * @param {object} options - Opções de customização
 * @returns {Promise<string>} Caminho do arquivo criado
 */
export async function createWorkflowFile(workflowType, outputPath, options = {}) {
    if (!WORKFLOW_TEMPLATES[workflowType]) {
        throw new Error(`Template não encontrado para workflow: ${workflowType}`);
    }

    let content = WORKFLOW_TEMPLATES[workflowType];

    // Aplicar customizações
    if (options.nodeVersion) {
        content = content.replace(/NODE_VERSION: '20'/g, `NODE_VERSION: '${options.nodeVersion}'`);
    }

    if (options.projectName) {
        content = content.replace(/coverage-report/g, `${options.projectName}-coverage`);
        content = content.replace(/build-artifacts/g, `${options.projectName}-build`);
    }

    // Garantir que o diretório existe
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Escrever arquivo
    await fs.writeFile(outputPath, content, 'utf-8');

    console.log(`✅ Workflow ${workflowType} criado em: ${outputPath}`);
    return outputPath;
}

/**
 * Cria todos os workflows padrão para um projeto
 * @param {string} projectPath - Caminho do projeto
 * @param {object} options - Opções de configuração
 * @returns {Promise<Array>} Lista de arquivos criados
 */
export async function createStandardWorkflows(projectPath, options = {}) {
    const workflowsDir = path.join(projectPath, '.github', 'workflows');
    const createdFiles = [];

    const standardWorkflows = ['ci', 'build', 'test', 'deploy'];

    for (const workflowType of standardWorkflows) {
        const filePath = path.join(workflowsDir, `${workflowType}.yml`);

        try {
            await createWorkflowFile(workflowType, filePath, options);
            createdFiles.push(filePath);
        } catch (error) {
            console.error(`❌ Erro ao criar workflow ${workflowType}:`, error);
        }
    }

    return createdFiles;
}

/**
 * Cria issue com checklist para implementar workflow
 * @param {string} repoName - Nome do repositório
 * @param {string} workflowType - Tipo do workflow
 * @param {object} options - Opções adicionais
 * @returns {Promise<object>} Issue criado
 */
export async function createWorkflowImplementationIssue(repoName, workflowType, options = {}) {
    const issueTemplates = {
        ci: {
            title: '🔄 Implementar Workflow CI (Integração Contínua)',
            labels: ['enhancement', 'ci-cd', 'workflow', 'priority-high'],
            body: `## 🔄 Implementar Workflow CI

### 📋 Objetivo
Implementar workflow de Integração Contínua seguindo o padrão xCloud.

### ✅ Checklist de Implementação
- [ ] Criar arquivo \`.github/workflows/ci.yml\`
- [ ] Configurar triggers (push/PR para main/develop)
- [ ] Implementar quality checks (lint, format, audit)
- [ ] Configurar build do projeto
- [ ] Adicionar execução de testes
- [ ] Upload de artefatos de build
- [ ] Configurar coverage reports

### 🛠️ Scripts necessários no package.json
\`\`\`json
{
  "scripts": {
    "lint": "eslint src/",
    "format:check": "prettier --check .",
    "build": "...",
    "test": "..."
  }
}
\`\`\`

### 📊 Critérios de Aceite
- [ ] Workflow executado em push/PR
- [ ] Quality checks passando
- [ ] Build gerado com sucesso
- [ ] Testes executados
- [ ] Cobertura reportada

_Issue criada automaticamente pelo xCloud Bot_`
        },

        build: {
            title: '🏗️ Implementar Workflow Build Especializado',
            labels: ['enhancement', 'build', 'workflow'],
            body: `## 🏗️ Implementar Workflow Build

### 📋 Objetivo
Implementar workflow especializado para builds reutilizáveis.

### ✅ Checklist de Implementação
- [ ] Criar arquivo \`.github/workflows/build.yml\`
- [ ] Configurar \`workflow_call\`
- [ ] Implementar build otimizado
- [ ] Análise de artefatos
- [ ] Cache inteligente

### 🛠️ Configurações
- Node.js version configurável
- Build command customizável
- Upload de artefatos automático

### 📊 Critérios de Aceite
- [ ] Reutilizável por outros workflows
- [ ] Build otimizado e rápido
- [ ] Artefatos bem organizados

_Issue criada automaticamente pelo xCloud Bot_`
        },

        test: {
            title: '🧪 Implementar Workflow de Testes',
            labels: ['enhancement', 'testing', 'workflow'],
            body: `## 🧪 Implementar Workflow de Testes

### 📋 Objetivo
Implementar workflow completo de testes.

### ✅ Checklist de Implementação
- [ ] Criar arquivo \`.github/workflows/test.yml\`
- [ ] Configurar testes unitários
- [ ] Configurar testes de integração
- [ ] Relatórios de cobertura
- [ ] Paralelização de testes

### 🛠️ Scripts necessários
\`\`\`json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --config vitest.unit.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:coverage": "vitest run --coverage"
  }
}
\`\`\`

### 📊 Critérios de Aceite
- [ ] Todos os tipos de teste executando
- [ ] Cobertura adequada (>80%)
- [ ] Relatórios detalhados

_Issue criada automaticamente pelo xCloud Bot_`
        },

        deploy: {
            title: '🚀 Implementar Workflow de Deploy',
            labels: ['enhancement', 'deployment', 'workflow'],
            body: `## 🚀 Implementar Workflow de Deploy

### 📋 Objetivo
Implementar workflow de deploy para staging e production.

### ✅ Checklist de Implementação
- [ ] Criar arquivo \`.github/workflows/deploy.yml\`
- [ ] Configurar deploy para staging
- [ ] Configurar deploy para production
- [ ] Verificações pré-deploy
- [ ] Smoke tests pós-deploy

### 🌍 Ambientes
- **Staging**: Deploy automático
- **Production**: Deploy manual com aprovação

### 📊 Critérios de Aceite
- [ ] Deploy staging funcionando
- [ ] Deploy production com aprovação
- [ ] Rollback em caso de falha

_Issue criada automaticamente pelo xCloud Bot_`
        }
    };

    const template = issueTemplates[workflowType];
    if (!template) {
        throw new Error(`Template de issue não encontrado para: ${workflowType}`);
    }

    const issueData = {
        title: options.title || template.title,
        body: options.body || template.body,
        labels: options.labels || template.labels
    };

    return await createIssue(repoName, issueData);
}

/**
 * Valida estrutura de workflow YAML
 * @param {string} workflowContent - Conteúdo do workflow
 * @returns {object} Resultado da validação
 */
export function validateWorkflow(workflowContent) {
    const validation = {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: []
    };

    try {
        // Validações básicas
        if (!workflowContent.includes('name:')) {
            validation.errors.push('Workflow deve ter um nome definido');
        }

        if (!workflowContent.includes('on:')) {
            validation.errors.push('Workflow deve ter triggers definidos');
        }

        if (!workflowContent.includes('jobs:')) {
            validation.errors.push('Workflow deve ter pelo menos um job');
        }

        // Verificações de boas práticas
        if (!workflowContent.includes('actions/checkout@v4')) {
            validation.warnings.push('Use actions/checkout@v4 para melhor performance');
        }

        if (workflowContent.includes('actions/checkout@v2')) {
            validation.warnings.push('actions/checkout@v2 está desatualizado, use @v4');
        }

        if (!workflowContent.includes('cache:')) {
            validation.suggestions.push('Considere usar cache para dependências');
        }

        validation.valid = validation.errors.length === 0;

    } catch (error) {
        validation.valid = false;
        validation.errors.push(`Erro de parsing: ${error.message}`);
    }

    return validation;
}

export { WORKFLOW_TEMPLATES };
