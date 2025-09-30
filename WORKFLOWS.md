# 🤖 xCloud Bot - Documentação dos Workflows

## 📋 Workflows Ativos

| Workflow | Arquivo | Função | Trigger | Status |
|----------|---------|--------|---------|---------|
| **🔧 Register xCloud Bot** | `register-github-app.yml` | Setup inicial do bot | `workflow_dispatch` | ✅ Ativo |
| **▶️ Gemini Invoke** | `gemini-invoke.yml` | Invoca Gemini AI | `workflow_call` | ✅ Ativo |
| **🔀 Gemini Triage** | `gemini-triage.yml` | Triagem automática | `workflow_call` | ✅ Ativo |
| **🔎 Gemini Review** | `gemini-review.yml` | Review de PRs | `workflow_call` | ✅ Ativo |
| **🤖 Autonomous Agent** | `autonomous-agent.yml` | Bot assignment handler | `issues`, `workflow_dispatch` | ✅ Ativo |
| **🤖 Smart Issue Management** | `issue-management.yml` | **Gestão inteligente com MCP** | `issues`, `workflow_dispatch` | ✅ **NOVO** |
| **👤 Manual Review** | `manual-review.yml` | **Revisão manual rootkit-original** | `issue_comment`, `workflow_dispatch` | ✅ **NOVO** |
| **🔍 CI** | `ci.yml` | Testes e validação | `push`, `pull_request` | ✅ Ativo |

## 🧪 Como Testar com `act`

### Comandos Básicos

```bash
# Listar todos os workflows
act -l

# Testar workflow específico (dry-run)
act workflow_dispatch -W .github/workflows/register-github-app.yml -n

# Testar com evento específico
act issues -W .github/workflows/issue-management.yml -n

# Testar com secrets (quando necessário)
act workflow_dispatch -W .github/workflows/gemini-invoke.yml -s GEMINI_API_KEY=sua-chave -n
```

### Workflows Principais para Teste

1. **Setup Inicial**:
   ```bash
   act workflow_dispatch -W .github/workflows/register-github-app.yml -n
   ```

2. **Gemini AI**:
   ```bash
   act workflow_call -W .github/workflows/gemini-invoke.yml -n
   ```

3. **Issue Management**:
   ```bash
   act issues -W .github/workflows/issue-management.yml -n
   ```

## 🗑️ Workflows Removidos

Os seguintes workflows foram removidos por duplicação ou complexidade excessiva:

- ❌ `gemini-scheduled-triage.yml` (duplicava gemini-triage.yml)
- ❌ `gemini-dispatch.yml` (função integrada ao gemini-invoke.yml)  
- ❌ `setup-bot.yml` (substituído por register-github-app.yml)
- ❌ `bot_integration.yml` (função coberta por outros workflows)
- ❌ `enhanced-gemini-cli.yml` (sintaxe incorreta, muito complexo)

## 🔑 Secrets Necessários

### Para Gemini AI:
- `GEMINI_API_KEY`: Chave da API do Gemini
- `GOOGLE_API_KEY`: Chave da API do Google (opcional)

### Para GitHub App:
- `GH_PRIVATE_KEY`: Chave privada da GitHub App
- `GH_APP_ID`: ID da GitHub App (como variable)

### Para Autenticação:
- `GITHUB_TOKEN`: Token padrão (automático)

## 📊 Estrutura Simplificada

```
.github/workflows/
├── autonomous-agent.yml      # Bot assignment
├── ci.yml                   # Testes e CI/CD  
├── gemini-invoke.yml        # Core Gemini AI
├── gemini-review.yml        # PR reviews
├── gemini-triage.yml        # Issue triage
├── issue-management.yml     # Issue automation
└── register-github-app.yml  # Initial setup
```

## 🤖 Sistema Inteligente de Issues - NOVO!

### Smart Issue Management (issue-management.yml)

**Funcionalidades Automáticas:**
- 🔍 **Detecção de Duplicatas**: Pesquisa issues similares antes de processar
- 🏷️ **Labels Inteligentes**: Aplica labels baseados no conteúdo (bug, feature, priority, category)
- 👥 **Assignment Automático**: Sempre assina para `xcloud-team`
- 🔒 **Escalação Automática**: Issues críticas/segurança → também assina para `rootkit-original`
- 💬 **Respostas Contextuais**: Comentários informativos e úteis
- 🧠 **Análise Técnica**: Powered by Gemini + GitHub MCP

**Labels Aplicados Automaticamente:**
- **Técnicos**: `bug`, `feature`, `enhancement`, `documentation`, `question`, `security`, `performance`
- **Prioridade**: `priority:high`, `priority:medium`, `priority:low`  
- **Categoria**: `category:api`, `category:ui`, `category:infrastructure`, `category:workflow`, `category:bot`

### Manual Review (manual-review.yml)

**Para rootkit-original:**
- 👤 **Comentários especiais**: Responde quando `@rootkit-original` comenta
- 🔧 **Ações manuais**: review, escalate, close, reassign
- 📊 **Resumos executivos**: Análise detalhada de issues
- ⚡ **Controle total**: Override automações quando necessário

## ✅ Validação

Todos os workflows foram testados com `act` e estão funcionando corretamente:

- ✅ Sintaxe YAML válida
- ✅ Estrutura consistente  
- ✅ Sem duplicações
- ✅ Funcionalidade preservada
- ✅ Testáveis com `act`
- ✅ **GitHub MCP integrado**
- ✅ **Sistema inteligente ativo**

## 🧪 Comandos de Teste com `act`

```bash
# Listar todos os workflows
act -l

# Testar issue management inteligente
act issues -W .github/workflows/issue-management.yml -n

# Testar revisão manual (workflow dispatch)
act workflow_dispatch -W .github/workflows/manual-review.yml -n

# Testar setup inicial
act workflow_dispatch -W .github/workflows/register-github-app.yml -n

# Testar CI completo
act push -W .github/workflows/ci.yml -n

# Testar com secrets (quando necessário)
act workflow_dispatch -W .github/workflows/issue-management.yml -s GEMINI_API_KEY=test -n
```

## 🚀 Próximos Passos

1. Configure os secrets necessários no GitHub
2. Execute o `register-github-app.yml` para setup inicial
3. Teste os workflows gradualmente com comandos acima
4. Monitore logs e ajuste conforme necessário
5. Crie uma issue de teste para ver o sistema em ação!