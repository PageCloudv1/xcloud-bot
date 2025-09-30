# 🤖 Guia de Organização de Workflow - xCloud Bot

Este guia explica como organizar e automatizar seu workflow usando o xCloud Bot com integração do @Copilot e Gemini CLI.

## 📋 Visão Geral

O xCloud Bot foi configurado para:

1. **Automatizar reviews com @Copilot** - Reviews automáticos para novas tarefas
2. **Integrar Gemini CLI** - Análise avançada de código com IA
3. **Expandir para múltiplos repositórios** - Sistema multi-repo centralizado
4. **Templates reutilizáveis** - Workflows padronizados

## 🚀 Features Implementadas

### 1. Auto Review com @Copilot

**Arquivo**: `.github/workflows/auto-copilot-review.yml`

**Funcionalidades**:
- ✅ Review automático em novos issues
- ✅ Review automático em novos PRs
- ✅ Solicitação automática de review do @Copilot
- ✅ Integração com Gemini Review

**Triggers**:
- `issues: [opened, edited]`
- `pull_request: [opened, synchronize, edited]`
- `workflow_dispatch` (manual)

### 2. Enhanced Gemini CLI

**Arquivo**: `.github/workflows/enhanced-gemini-cli.yml`

**Comandos Disponíveis**:
- `analyze-code` - Análise de código
- `review-pr` - Review de PR
- `generate-docs` - Geração de documentação
- `suggest-improvements` - Sugestões de melhorias
- `security-scan` - Scan de segurança
- `performance-analysis` - Análise de performance

**Como usar**:
```bash
# Via workflow_dispatch no GitHub Actions
# Ou via API/webhook
```

### 3. Sistema Multi-Repositório

**Arquivo**: `src/config/multi-repo.js`

**Funcionalidades**:
- ✅ Gerenciamento centralizado de múltiplos repos
- ✅ Configuração por repositório
- ✅ Controle de features por repo
- ✅ Sistema de permissões

**Script de Expansão**: `scripts/expand-to-repo.js`

```bash
# Expandir para um repositório
node scripts/expand-to-repo.js PageCloudv1/meu-repo

# Expansão em lote
node scripts/expand-to-repo.js --batch scripts/repos.json
```

### 4. Template de Setup

**Arquivo**: `.github/workflow-templates/xcloud-bot-setup.yml`

**Como usar**:
1. Vá para Actions no repositório de destino
2. Procure por "xCloud Bot Setup"
3. Configure as features desejadas
4. Execute o workflow

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

```env
# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
WEBHOOK_SECRET=your_webhook_secret

# Gemini/Google AI
GEMINI_API_KEY=AIzaSyxxxxxxxxxx
GOOGLE_API_KEY=AIzaSyxxxxxxxxxx
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
SERVICE_ACCOUNT_EMAIL=bot@your-project.iam.gserviceaccount.com

# Configurações opcionais
DEBUG=false
GOOGLE_GENAI_USE_VERTEXAI=false
GOOGLE_GENAI_USE_GCA=false
```

### Secrets do GitHub

Configure os seguintes secrets no repositório:

- `GITHUB_TOKEN` - Token com permissões adequadas
- `GEMINI_API_KEY` - Chave da API do Gemini
- `GOOGLE_API_KEY` - Chave da API do Google
- `APP_PRIVATE_KEY` - Chave privada da GitHub App

### Variables do GitHub

Configure as seguintes variables:

- `APP_ID` - ID da GitHub App
- `GEMINI_CLI_VERSION` - Versão do Gemini CLI
- `GOOGLE_CLOUD_PROJECT` - ID do projeto GCP
- `GOOGLE_CLOUD_LOCATION` - Região do GCP

## 📖 Como Usar

### 1. Review Automático

Quando você criar um novo issue ou PR, o bot automaticamente:

1. Adiciona um comentário solicitando review do @Copilot
2. Executa análise com Gemini (se habilitado)
3. Fornece feedback estruturado

### 2. Comandos Manuais

Nos comentários de issues/PRs, use:

```
@Copilot review this
@Copilot analyze code
@Copilot suggest improvements
@Copilot security scan
```

### 3. Workflows Manuais

No GitHub Actions, execute:

- **Enhanced Gemini CLI** - Para análises específicas
- **xCloud Bot Setup** - Para configurar em novos repos

### 4. Expansão para Novos Repositórios

#### Método 1: Script (Recomendado)

```bash
# Instalar dependências
npm install

# Expandir para um repo
GITHUB_TOKEN=your_token node scripts/expand-to-repo.js owner/repo

# Expansão em lote
GITHUB_TOKEN=your_token node scripts/expand-to-repo.js --batch repos.json
```

#### Método 2: Template Workflow

1. Vá para o repositório de destino
2. Actions → New workflow
3. Procure "xCloud Bot Setup"
4. Configure e execute

#### Método 3: Manual

1. Copie os workflows necessários
2. Configure secrets/variables
3. Crie arquivo `.xcloud-bot/config.json`
4. Atualize README

## 🎯 Personalização

### Configuração por Repositório

Edite `.xcloud-bot/config.json`:

```json
{
  "repository": "owner/repo",
  "features": {
    "autoReview": true,
    "geminiIntegration": true,
    "issueManagement": true,
    "prAutomation": true,
    "securityScanning": false,
    "performanceMonitoring": false
  },
  "workflows": {
    "auto-copilot-review": true,
    "enhanced-gemini-cli": true,
    "gemini-review": true,
    "gemini-triage": true
  }
}
```

### Features Disponíveis

- **autoReview**: Reviews automáticos com @Copilot
- **geminiIntegration**: Integração com Gemini AI
- **issueManagement**: Gerenciamento inteligente de issues
- **prAutomation**: Automação de pull requests
- **securityScanning**: Verificações de segurança
- **performanceMonitoring**: Monitoramento de performance

## 🔍 Monitoramento

### Logs

- GitHub Actions logs para cada workflow
- Issues criados automaticamente com resultados
- Artifacts com análises detalhadas

### Métricas

- Número de reviews automáticos
- Taxa de sucesso dos workflows
- Tempo de resposta do bot

## 🚨 Troubleshooting

### Problemas Comuns

1. **Bot não responde**
   - Verificar secrets/variables
   - Verificar permissões da GitHub App
   - Verificar logs do workflow

2. **Gemini API falha**
   - Verificar GEMINI_API_KEY
   - Verificar quotas da API
   - Verificar configuração do projeto GCP

3. **Workflows não executam**
   - Verificar triggers
   - Verificar permissões
   - Verificar sintaxe YAML

### Debug

Habilite debug mode:

```env
DEBUG=true
ACTIONS_STEP_DEBUG=true
```

## 📚 Recursos Adicionais

- [Documentação do Gemini CLI](https://github.com/google-github-actions/run-gemini-cli)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contribuição

Para contribuir com melhorias:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste em um repositório de teste
5. Abra um PR com descrição detalhada

---

*Este guia foi gerado automaticamente pelo xCloud Bot v1.0.0*