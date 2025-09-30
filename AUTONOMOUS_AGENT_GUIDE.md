# 🤖 xCloud Bot - Agente Autônomo

## 📋 Visão Geral

O xCloud Bot agora funciona como um agente autônomo similar ao @Copilot. Quando você faz um assignment do xbot para uma issue, ele:

1. **🐳 Cria uma instância isolada** usando Podman
2. **📂 Clona o projeto** no container
3. **🔍 Analisa a tarefa** automaticamente
4. **⚙️ Executa as ações necessárias**
5. **📤 Cria um pull request** com as mudanças
6. **💬 Envia feedback** detalhado

## 🚀 Como Usar

### Método 1: Assignment Direto (Recomendado)

1. **Crie ou abra uma issue** no seu repositório
2. **Assigne o xcloud-bot** à issue
3. **Aguarde a execução** automática
4. **Revise o PR** criado pelo bot

```
# Exemplo de assignment via GitHub CLI
gh issue create --title "Fix: Corrigir bug no login" --body "Descrição do bug..."
gh issue edit 123 --add-assignee xcloud-bot
```

### Método 2: Via Workflow Manual

1. Vá para **Actions** no repositório
2. Execute o workflow **"Autonomous Agent"**
3. Configure os parâmetros:
   - `issue_number`: Número da issue
   - `action`: `simulate_assignment`
   - `repository`: `owner/repo` (opcional)

### Método 3: Via API REST

```bash
# Simular assignment
curl -X POST http://localhost:3000/api/agent/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "PageCloudv1/meu-repo",
    "issue_number": 123,
    "assignee": "xcloud-bot"
  }'

# Verificar tarefas ativas
curl http://localhost:3000/api/agent/tasks

# Parar todas as tarefas
curl -X POST http://localhost:3000/api/agent/stop
```

## 🔧 Configuração

### Pré-requisitos

1. **Podman instalado** no servidor
2. **Variáveis de ambiente** configuradas
3. **GitHub App** com permissões adequadas

### Variáveis de Ambiente

```env
# GitHub
GH_TOKEN=ghp_xxxxxxxxxxxx
GH_APP_ID=123456
GH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
WEBHOOK_SECRET=your_webhook_secret

# xBot Configuration
XBOT_USERNAME=xcloud-bot

# Gemini (opcional)
GEMINI_API_KEY=AIzaSyxxxxxxxxxx
GOOGLE_API_KEY=AIzaSyxxxxxxxxxx

# Container Configuration (opcional)
CONTAINER_MEMORY=2g
CONTAINER_CPU=2
CONTAINER_TIMEOUT=1800
```

### Instalação do Podman

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install -y podman
```

#### CentOS/RHEL

```bash
sudo dnf install -y podman
```

#### macOS

```bash
brew install podman
```

### Configuração do Podman

```bash
# Configurar registries
echo "unqualified-search-registries = ['docker.io']" | sudo tee -a /etc/containers/registries.conf

# Testar instalação
podman --version
podman info
```

## 🎯 Tipos de Tarefas Suportadas

### 🐛 Bug Fix

**Detectado quando a issue contém**: `bug`, `fix`, `erro`

**Ações executadas**:

- Análise do código
- Implementação do fix
- Testes do fix

**Exemplo de issue**:

```
Título: "Bug: Login não funciona com emails longos"
Descrição: "Quando o usuário tenta fazer login com um email muito longo..."
```

### ✨ Feature Implementation

**Detectado quando a issue contém**: `feature`, `implement`, `add`

**Ações executadas**:

- Análise dos requisitos
- Implementação da feature
- Adição de testes

**Exemplo de issue**:

```
Título: "Feature: Adicionar autenticação 2FA"
Descrição: "Implementar sistema de autenticação de dois fatores..."
```

### 🔄 Refactoring

**Detectado quando a issue contém**: `refactor`, `improve`, `optimize`

**Ações executadas**:

- Análise do código
- Refatoração
- Testes das mudanças

### 🧪 Testing

**Detectado quando a issue contém**: `test`, `coverage`

**Ações executadas**:

- Análise de cobertura
- Adição de testes
- Execução dos testes

### 📚 Documentation

**Detectado quando a issue contém**: `doc`, `readme`

**Ações executadas**:

- Análise da documentação
- Atualização dos docs
- Validação

## 🔍 Monitoramento

### Logs em Tempo Real

```bash
# Logs do bot principal
npm run server:logs

# Logs do Podman
podman logs -f xbot-TASK_ID

# Logs do GitHub Actions
# Vá para Actions > Autonomous Agent > View logs
```

### API de Status

```bash
# Verificar tarefas ativas
curl http://localhost:3000/api/agent/tasks

# Resposta exemplo:
{
  "tasks": [
    {
      "containerId": "xbot-PageCloudv1/repo-123-1234567890",
      "created": "2024-01-01T12:00:00.000Z",
      "status": "running"
    }
  ],
  "count": 1,
  "timestamp": "2024-01-01T12:05:00.000Z"
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Bot não responde ao assignment

**Possíveis causas**:

- Username não está na lista de xbot usernames
- Webhook não está configurado
- Variáveis de ambiente faltando

**Solução**:

```bash
# Verificar logs
npm run server:logs

# Verificar variáveis
echo $XBOT_USERNAME
echo $GH_TOKEN

# Testar webhook
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"action": "assigned", "issue": {...}}'
```

#### 2. Erro ao criar container

**Possíveis causas**:

- Podman não instalado
- Permissões insuficientes
- Recursos insuficientes

**Solução**:

```bash
# Verificar Podman
podman --version
podman info

# Testar criação de container
podman run --rm node:18-alpine echo "Test"

# Verificar recursos
free -h
df -h
```

#### 3. Falha ao clonar repositório

**Possíveis causas**:

- Token GitHub inválido
- Repositório privado sem acesso
- Rate limiting

**Solução**:

```bash
# Testar token
curl -H "Authorization: token $GH_TOKEN" \
  https://api.github.com/user

# Verificar rate limit
curl -H "Authorization: token $GH_TOKEN" \
  https://api.github.com/rate_limit
```

#### 4. Erro ao criar PR

**Possíveis causas**:

- Permissões insuficientes
- Branch já existe
- Conflitos de merge

**Solução**:

```bash
# Verificar permissões da GitHub App
# Ir para Settings > Developer settings > GitHub Apps

# Verificar branches
gh api repos/OWNER/REPO/branches

# Limpar branches órfãos
git branch -D xbot/issue-*
```

### Debug Mode

```bash
# Habilitar debug
export DEBUG=true
export ACTIONS_STEP_DEBUG=true

# Executar com logs detalhados
npm run bot:dev
```

### Limpeza Manual

```bash
# Parar todas as tarefas
curl -X POST http://localhost:3000/api/agent/stop

# Limpar containers órfãos
podman stop $(podman ps -q --filter "name=xbot-")
podman rm $(podman ps -aq --filter "name=xbot-")

# Limpar imagens não utilizadas
podman image prune -f
```

## 📊 Métricas e Analytics

### Métricas Coletadas

- **Tempo de execução** por tarefa
- **Taxa de sucesso** por tipo de tarefa
- **Recursos utilizados** (CPU, memória)
- **Número de PRs** criados
- **Feedback dos usuários**

### Dashboard (Futuro)

Planejamos implementar um dashboard web para:

- Visualizar métricas em tempo real
- Gerenciar tarefas ativas
- Configurar o agente
- Ver histórico de execuções

## 🔮 Roadmap

### Próximas Features

- [ ] **IA Avançada**: Integração com GPT-4 para análises mais sofisticadas
- [ ] **Multi-linguagem**: Suporte para Python, Java, Go, etc.
- [ ] **Testes Automáticos**: Execução de testes antes de criar PR
- [ ] **Code Review**: Review automático de PRs
- [ ] **Deployment**: Deploy automático após merge
- [ ] **Rollback**: Rollback automático em caso de problemas

### Melhorias Planejadas

- [ ] **Performance**: Otimização do uso de recursos
- [ ] **Segurança**: Sandboxing mais rigoroso
- [ ] **Escalabilidade**: Suporte a múltiplos workers
- [ ] **Observabilidade**: Métricas e alertas avançados
- [ ] **UI/UX**: Interface web para gerenciamento

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o repositório
2. **Crie uma branch** para sua feature
3. **Implemente** as mudanças
4. **Teste** com o agente autônomo
5. **Abra um PR** com descrição detalhada

### Áreas que Precisam de Ajuda

- **Análise de código** mais sofisticada
- **Suporte a mais linguagens** de programação
- **Testes automatizados** mais robustos
- **Interface web** para gerenciamento
- **Documentação** e exemplos

## 📚 Recursos Adicionais

- [Documentação do Podman](https://podman.io/docs)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [Webhook Events](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads)
- [Octokit.js](https://octokit.github.io/rest.js/)

---

**🤖 xCloud Bot Autonomous Agent v1.0.0**

_Transformando issues em soluções automaticamente!_
