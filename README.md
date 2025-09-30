# 🤖 xCloud Bot

Bot inteligente para automação da plataforma xCloud - Simplifique DevOps, acesse documentação e monitore serviços através de conversação natural.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Integração com GitHub Actions](#-integração-com-github-actions)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Contribuindo](#-contribuindo)

## 🎯 Sobre o Projeto

O xCloud Bot é um assistente inteligente desenvolvido para automatizar processos DevOps, monitorar CI/CD, analisar repositórios e criar issues automaticamente baseado em métricas e eventos do GitHub.

### Principais Capacidades

- 🔍 **Análise de Repositórios**: Analisa workflows, métricas de CI/CD e saúde do repositório
- 🤖 **Automação de Issues**: Cria issues automaticamente quando detecta problemas
- 📊 **Monitoramento de CI**: Monitora status de workflows e identifica falhas
- 🏷️ **Auto-labeling**: Adiciona labels automaticamente a issues e PRs
- 🔄 **Integração GitHub**: Totalmente integrado via GitHub App e webhooks

## ✨ Funcionalidades

### GitHub App
- ✅ Reage a eventos de issues, PRs e workflows
- ✅ Adiciona labels automaticamente baseado em conteúdo
- ✅ Comenta em PRs com análises de mudanças em workflows
- ✅ Cria issues de investigação para falhas de CI

### Análise de Workflows
- ✅ Analisa performance de workflows
- ✅ Identifica workflows lentos ou não confiáveis
- ✅ Gera recomendações de otimização
- ✅ Monitora saúde geral dos repositórios

### Scheduler/Monitoramento
- ✅ Monitora workflows periodicamente
- ✅ Cria alertas para múltiplas falhas
- ✅ Health check de repositórios
- ✅ Limpeza automática de artefatos antigos

## 📦 Pré-requisitos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **GitHub Token**: Token pessoal ou GitHub App configurada
- **Acesso**: Permissões adequadas nos repositórios

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/PageCloudv1/xcloud-bot.git
cd xcloud-bot

# Instale as dependências
npm install

# Compile o projeto TypeScript
npm run build
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

### 2. Configuração Básica (GitHub Token)

Para uso básico com token pessoal:

```env
# GitHub Token (obrigatório)
GITHUB_TOKEN=ghp_your_personal_access_token_here

# Configuração do servidor (opcional)
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

**Permissões necessárias para o token:**
- `repo` - Acesso completo a repositórios
- `workflow` - Gerenciar GitHub Actions workflows
- `write:packages` - Publicar pacotes (opcional)

### 3. Configuração Avançada (GitHub App)

Para uso completo com webhooks e GitHub App:

```env
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
Your private key here
-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=your_webhook_secret_here

# GitHub Token (para operações de API)
GITHUB_TOKEN=ghp_your_token_here

# Gemini API (opcional, para análise IA)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
```

### 4. Configuração da GitHub App

Para criar uma GitHub App:

1. Acesse: `https://github.com/settings/apps/new`
2. Configure:
   - **Homepage URL**: URL do seu bot
   - **Webhook URL**: `https://your-domain.com/webhook`
   - **Webhook Secret**: Gere um secret seguro
   
3. Permissões necessárias:
   - **Repository permissions:**
     - Contents: Read
     - Issues: Read & Write
     - Pull requests: Read & Write
     - Actions: Read
   - **Organization permissions:**
     - Members: Read (opcional)

4. Subscribe to events:
   - Issues
   - Issue comments
   - Pull requests
   - Workflow runs
   - Push

5. Após criar, baixe a private key e adicione ao `.env`

## 💻 Uso

### Iniciar o Bot

```bash
# Modo desenvolvimento
npm run bot:dev

# Modo produção
npm run bot:start
```

### Executar Análise de Repositório

```bash
# Analisar um repositório específico
npm run analyze:repo PageCloudv1/xcloud-bot

# Analisar todos os repositórios xCloud
npm run analyze:all
```

### Monitoramento e Scheduler

```bash
# Executar monitoramento completo (modo CI)
npm run scheduler:run

# Executar apenas monitoramento de workflows
node src/bot/scheduler.js --monitor

# Executar apenas health check
node src/bot/scheduler.js --health

# Executar apenas limpeza de artefatos
node src/bot/scheduler.js --cleanup
```

### Criar Issues Manualmente

```bash
npm run create:issue PageCloudv1/xcloud-bot "Issue Title"
```

## 🔄 Integração com GitHub Actions

O bot está totalmente integrado ao GitHub Actions através do workflow `.github/workflows/bot_integration.yml`.

### Configuração do Workflow

O workflow é executado automaticamente:
- ✅ A cada 6 horas (schedule)
- ✅ Manualmente via `workflow_dispatch`
- ✅ Em push para `main` que afeta arquivos do bot

### Secrets Necessários no GitHub

Configure os seguintes secrets no repositório:

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Obrigatório | Descrição |
|--------|-------------|-----------|
| `GITHUB_TOKEN` | ✅ Sim | Fornecido automaticamente pelo GitHub Actions |
| `GITHUB_APP_ID` | ⚠️ Opcional | ID da GitHub App (para webhooks) |
| `GITHUB_PRIVATE_KEY` | ⚠️ Opcional | Chave privada da App (para webhooks) |
| `GEMINI_API_KEY` | ⚠️ Opcional | Para análise com IA (Gemini) |

### Permissões do Workflow

O workflow já está configurado com as permissões necessárias:

```yaml
permissions:
  contents: read       # Ler código do repositório
  issues: write        # Criar e editar issues
  actions: read        # Ler status de workflows
  pull-requests: write # Comentar em PRs
```

### Executar Manualmente

1. Vá para: `Actions` → `🤖 xCloud Bot Integration`
2. Clique em `Run workflow`
3. (Opcional) Marque `analyze_all` para analisar todos os repositórios

### Visualizar Resultados

Após cada execução do workflow:
- ✅ Summary com relatório detalhado
- ✅ Logs de cada etapa
- ✅ Issues criadas automaticamente (se necessário)

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
xcloud-bot/
├── .github/
│   └── workflows/
│       └── bot_integration.yml    # Workflow de integração
├── src/
│   ├── bot/
│   │   ├── github-app.js          # GitHub App handler
│   │   └── scheduler.js           # Tarefas agendadas
│   ├── core/
│   │   └── XCloudBot.ts           # Core do bot
│   ├── integrations/
│   │   ├── gemini-cli.js          # Integração Gemini
│   │   └── github-api.js          # Wrapper GitHub API
│   ├── workflows/
│   │   ├── analyzer.js            # Análise de workflows
│   │   └── creator.js             # Criação de workflows
│   └── index.ts                   # Entry point
├── tests/
│   ├── integration/               # Testes de integração
│   └── bot-validation.js          # Validação do bot
└── package.json
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Modo desenvolvimento com hot-reload
npm run bot:dev          # Bot em modo desenvolvimento

# Build e Produção
npm run build            # Compilar TypeScript
npm start                # Iniciar bot em produção

# Testes
npm test                 # Executar todos os testes
npm run test:unit        # Testes unitários
npm run test:integration # Testes de integração
npm run test:coverage    # Cobertura de testes

# Qualidade de Código
npm run lint             # Verificar código
npm run lint:fix         # Corrigir problemas automaticamente
npm run format           # Formatar código
npm run validate         # Lint + Format + Build

# Bot Operations
npm run bot:start        # Iniciar bot
npm run scheduler:run    # Executar scheduler
npm run analyze:repo     # Analisar repositório
npm run analyze:all      # Analisar todos os repos
npm run create:issue     # Criar issue
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Com cobertura
npm run test:coverage
```

### Validação Manual

Execute o script de validação:

```bash
node tests/bot-validation.js
```

Isso testará:
- ✅ Inicialização do GitHub App
- ✅ Processamento de webhooks
- ✅ Auto-labeling de issues
- ✅ Criação de workflow issues
- ✅ Análise de repositórios
- ✅ Integração de componentes

## 📊 Monitoramento

### Logs

O bot gera logs estruturados:

```
🤖 xCloud Bot rodando na porta 3000
📊 Analisando performance dos workflows...
✅ Análise concluída
🔍 Monitorando workflows...
```

### Health Check

Endpoint de health check (quando rodando como servidor):

```bash
curl http://localhost:3000/health
```

### Métricas

O scheduler coleta e reporta métricas:
- Taxa de sucesso de workflows
- Tempo médio de execução
- Workflows lentos ou não confiáveis
- Artefatos antigos

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre como contribuir.

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 🔗 Links Úteis

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Octokit.js](https://github.com/octokit/octokit.js)

## 📞 Suporte

Para problemas ou dúvidas:
- Abra uma [issue](https://github.com/PageCloudv1/xcloud-bot/issues)
- Consulte a [documentação](https://github.com/PageCloudv1/xcloud-bot/wiki)

---

Desenvolvido com ❤️ pelo time xCloud
