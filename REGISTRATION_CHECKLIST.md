# ✅ GitHub App Registration Checklist

Use esta checklist para acompanhar o progresso do registro da GitHub App.

## 📋 Pré-requisitos

- [ ] Conta GitHub com permissões de administrador
- [ ] Node.js 18+ instalado
- [ ] Repositório clonado localmente
- [ ] Dependências instaladas (`npm install`)

## 🔧 Preparação

- [ ] Executar assistente de registro: `npm run register:github-app`
- [ ] Revisar arquivo `github-app-manifest.json`
- [ ] Revisar guia `GITHUB_APP_SETUP.md`
- [ ] Preparar nome para a app (ex: "xCloud Bot")

## 🤖 Criar GitHub App

### Acessar Página de Criação

- [ ] Acessar: https://github.com/settings/apps/new
- [ ] Fazer login com conta de administrador

### Informações Básicas

- [ ] **GitHub App name**: `xCloud Bot` (ou preferência)
- [ ] **Description**: `Intelligent automation bot for code review and repository management`
- [ ] **Homepage URL**: `https://github.com/PageCloudv1/xcloud-bot`
- [ ] **Webhook URL**: Deixar em branco (opcional)
- [ ] **Webhook secret**: Gerar ou deixar em branco

### Configurar Permissões (Repository permissions)

- [ ] **Actions**: Read and write
- [ ] **Checks**: Read and write
- [ ] **Contents**: Read and write
- [ ] **Deployments**: Read and write (opcional)
- [ ] **Issues**: Read and write
- [ ] **Metadata**: Read only (automático)
- [ ] **Pages**: Read and write (opcional)
- [ ] **Pull requests**: Read and write
- [ ] **Repository projects**: Read and write
- [ ] **Security events**: Read and write (opcional)
- [ ] **Statuses**: Read and write

### Inscrever-se em Eventos (Subscribe to events)

#### Eventos Essenciais

- [ ] **Issues**
- [ ] **Issue comments**
- [ ] **Pull requests**
- [ ] **Pull request reviews**
- [ ] **Pull request review comments**
- [ ] **Push**

#### Eventos Recomendados

- [ ] **Check runs**
- [ ] **Check suites**
- [ ] **Workflow runs**
- [ ] **Workflow dispatch**

### Finalizar Criação

- [ ] Rolar até o fim da página
- [ ] Clicar em **"Create GitHub App"**
- [ ] Aguardar confirmação

## 💾 Salvar Credenciais

### Anotar Informações

- [ ] **App ID**: **\*\*\*\***\_\_\_**\*\*\*\*** (numero, ex: 123456)
- [ ] **Client ID**: **\*\*\*\***\_\_\_**\*\*\*\*** (apenas para referencia - NAO usar no .env)

⚠️ **IMPORTANTE**: O **App ID** (numero) e o **Client ID** (Iv...) sao diferentes!
Use o **App ID** (numerico) na variavel `GH_APP_ID`.

### Gerar e Baixar Private Key

- [ ] Clicar em **"Generate a private key"**
- [ ] Arquivo `.pem` baixado
- [ ] Arquivo salvo em local seguro
- [ ] Copiar conteúdo do arquivo (para uso posterior)

### Webhook Secret (se configurado)

- [ ] **Webhook Secret**: **\*\*\*\***\_\_\_**\*\*\*\***

## 🔐 Configurar Secrets no Repositório

### Acessar Configurações

- [ ] Ir para o repositório alvo
- [ ] **Settings > Secrets and variables > Actions**

### Adicionar Secrets

#### GH_APP_ID

- [ ] Clicar em **"New repository secret"**
- [ ] Nome: `GH_APP_ID`
- [ ] Valor: (App ID anotado acima - deve ser NUMERICO, ex: 123456)
- [ ] ⚠️ **NAO** usar o Client ID (que comeca com "Iv")
- [ ] Clicar em **"Add secret"**

#### GH_PRIVATE_KEY

- [ ] Clicar em **"New repository secret"**
- [ ] Nome: `GH_PRIVATE_KEY`
- [ ] Valor: (conteúdo completo do arquivo .pem)
- [ ] Incluir linhas `BEGIN` e `END`
- [ ] Manter quebras de linha
- [ ] Clicar em **"Add secret"**

#### WEBHOOK_SECRET (Opcional)

- [ ] Clicar em **"New repository secret"**
- [ ] Nome: `WEBHOOK_SECRET`
- [ ] Valor: (webhook secret configurado)
- [ ] Clicar em **"Add secret"**

#### GH_OWNER (Para uso local)

- [ ] Clicar em **"New repository secret"**
- [ ] Nome: `GH_OWNER`
- [ ] Valor: `PageCloudv1` (ou seu organization)
- [ ] Clicar em **"Add secret"**

## 📱 Instalar a App

### Instalação

- [ ] Na página da GitHub App, menu lateral
- [ ] Clicar em **"Install App"**
- [ ] Selecionar organização/conta
- [ ] Escolher repositórios:
  - [ ] **All repositories** ou
  - [ ] **Only select repositories** (selecionar específicos)
- [ ] Clicar em **"Install"**
- [ ] Confirmar permissões

### Verificar Instalação

- [ ] App aparece em **Settings > Integrations > Applications**
- [ ] Repositórios corretos selecionados
- [ ] Permissões concedidas

## ⚙️ Configurar Ambiente Local (Opcional)

### Arquivo .env

- [ ] Copiar exemplo: `cp .env.example .env`
- [ ] Abrir `.env` em editor de texto

### Variáveis Obrigatórias

- [ ] `GH_APP_ID=<seu-app-id>` (NUMERICO, ex: 123456 - NAO o Client ID)
- [ ] `GH_PRIVATE_KEY="<conteúdo-do-pem>"`
- [ ] `GH_OWNER=PageCloudv1`

### Variáveis Opcionais

- [ ] `WEBHOOK_SECRET=<seu-secret>`
- [ ] `GEMINI_API_KEY=<chave-gemini>` (para IA)
- [ ] `PORT=3000`
- [ ] `NODE_ENV=development`

## ✅ Validação

### Executar Validador

- [ ] Executar: `npm run validate:github-app`
- [ ] Todos os checks passaram
- [ ] Mensagem de sucesso exibida

### Teste Local (Opcional)

- [ ] Executar: `npm run bot:start`
- [ ] Bot iniciou sem erros
- [ ] Logs mostram conexão com GitHub

## 🧪 Teste em Produção

### Criar Issue de Teste

- [ ] Ir para repositório com app instalada
- [ ] Criar nova issue
- [ ] Aguardar resposta do bot (1-2 minutos)

### Verificar Funcionamento

- [ ] Bot adicionou comentário
- [ ] Labels foram aplicadas
- [ ] Issue foi categorizada

### Criar PR de Teste

- [ ] Criar novo Pull Request
- [ ] Aguardar análise do bot
- [ ] Verificar comentário de análise
- [ ] Verificar labels de tamanho

## 📊 Verificações Finais

- [ ] GitHub App criada e configurada
- [ ] Todos os secrets configurados no repositório
- [ ] App instalada nos repositórios corretos
- [ ] Validação executada com sucesso
- [ ] Testes básicos funcionando
- [ ] Documentação revisada

## 🎉 Registro Completo!

Parabéns! Sua GitHub App está registrada e funcionando.

### Próximos Passos

- [ ] Personalizar configurações do bot
- [ ] Configurar funcionalidades adicionais (IA, etc)
- [ ] Testar todas as funcionalidades
- [ ] Configurar deploy em produção
- [ ] Monitorar logs e comportamento

## 📚 Recursos Úteis

- **Comandos NPM**:
  - `npm run register:github-app` - Assistente de registro
  - `npm run validate:github-app` - Validar configuração
  - `npm run bot:start` - Iniciar bot localmente
  - `npm run bot:dev` - Modo desenvolvimento

- **Documentação**:
  - [QUICK_START.md](./QUICK_START.md) - Guia rápido
  - [GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md) - Guia completo
  - [README.md](./README.md) - Documentação principal
  - [TROUBLESHOOTING_SETUP.md](./TROUBLESHOOTING_SETUP.md) - Solução de problemas

- **Suporte**:
  - Issues: https://github.com/PageCloudv1/xcloud-bot/issues
  - Documentação GitHub Apps: https://docs.github.com/en/apps

---

**Data de conclusão**: **\*\*\*\***\_\_\_**\*\*\*\***

**Pessoa responsável**: **\*\*\*\***\_\_\_**\*\*\*\***

**Notas adicionais**:

---

---

