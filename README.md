# 🤖 xCloud Bot

Assistant inteligente para orquestração e gerenciamento da plataforma xCloud - Simplifique DevOps, acesse documentação e monitore serviços através de conversação natural.

## 🚀 Features

- 📊 **Repository Analysis**: Analisa workflows GitHub Actions e sugere melhorias
- 🔍 **CI Monitoring**: Monitora status de CI/CD e cria issues automaticamente para falhas
- 🤖 **Automated Issue Creation**: Cria issues com análises detalhadas e recomendações
- 🏷️ **Auto-labeling**: Adiciona labels automaticamente baseado no conteúdo
- 📈 **Performance Tracking**: Analisa performance de workflows e identifica gargalos

## 🔧 Bot Integration Workflow

O workflow `.github/workflows/bot_integration.yml` executa automaticamente:

### Execução Agendada
- **Schedule**: A cada 6 horas
- **Manual**: Via workflow_dispatch

### Steps do Workflow

1. **📦 Install Dependencies**: Instala dependências com `npm ci`
2. **🏗️ Build**: Compila o projeto TypeScript
3. **📊 Analyze Repository**: Analisa o repositório atual
4. **🔍 Monitor CI Status**: Monitora workflows e identifica falhas
5. **🤖 Create Issues if Needed**: Cria issues automaticamente quando necessário

### Permissões Necessárias

```yaml
permissions:
  contents: read    # Ler código do repositório
  issues: write     # Criar e gerenciar issues
```

### Environment Variables

- `GITHUB_TOKEN`: Fornecido automaticamente pelo GitHub Actions
- `CI`: Define modo de execução (true em Actions)
- `GITHUB_ACTIONS`: Identifica ambiente GitHub Actions

## 📚 Comandos Disponíveis

### Análise de Repositórios

```bash
# Analisar repositório específico
npm run analyze:repo PageCloudv1/xcloud-bot

# Analisar todos os repositórios xCloud
npm run analyze:all
```

### Monitoramento CI

```bash
# Executar scheduler (monitora workflows)
npm run scheduler:run
```

### Criação de Issues

```bash
# Criar issue com análise automatizada
npm run create:issue PageCloudv1/xcloud-bot "Automated Analysis Report"
```

## 🧪 Testing

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🔨 Development

```bash
# Instalar dependências
npm install

# Build
npm run build

# Development mode
npm run dev

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## 📝 Configuração

Copie `.env.example` para `.env` e configure as variáveis:

```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
WEBHOOK_SECRET=your_webhook_secret

# GitHub Token (for API operations)
GITHUB_TOKEN=your_github_token

# Gemini CLI Configuration (opcional)
GEMINI_API_KEY=your_gemini_api_key
```

## 🌐 Webhooks

O bot responde aos seguintes eventos:

- `issues.opened`: Auto-labeling e análise de issues
- `pull_request.opened`: Análise de mudanças em workflows
- `workflow_run.completed`: Monitora falhas e cria issues de investigação

## 📖 Documentação

Para mais informações sobre workflows e padrões:
- [GitHub Actions Workflows Guide](../xcloud-docs/docs/guides/github-actions-workflows.md)
- [CI/CD Best Practices](../xcloud-docs/docs/guides/ci-cd-best-practices.md)

## 🤝 Contributing

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre como contribuir.

## 📄 License

MIT License - veja [LICENSE](./LICENSE) para detalhes.
