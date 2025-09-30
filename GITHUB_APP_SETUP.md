# xCloud Bot - GitHub App Setup

## Como Registrar o Bot

1. Acesse: https://github.com/settings/apps/new
2. Cole o conteudo do arquivo github-app-manifest.json
3. Configure as permissoes necessarias
4. Anote as credenciais geradas
5. Configure os secrets no repositorio

## Permissoes Necessarias

- Actions: write
- Checks: write
- Contents: write
- Issues: write
- Pull Requests: write

- [ ] Você tem permissões de administrador no repositório ou organização
- [ ] Node.js está instalado (versão 20+)
- [ ] Você clonou este repositório localmente

## 📋 Passo a Passo para Registro

### 1️⃣ Execute o assistente de registro

O jeito mais fácil é usar o assistente interativo:

```bash
npm install
npm run register:github-app
```

O assistente irá guiá-lo através de todo o processo.

### 2️⃣ Criar a GitHub App manualmente

Se preferir fazer manualmente:

1. **Acesse a página de criação**: https://github.com/settings/apps/new

2. **Preencha as informações básicas:**
   - **GitHub App name**: `xCloud Bot` (ou o nome que preferir)
   - **Description**: `🤖 Bot inteligente para automação de repositórios`
   - **Homepage URL**: `https://github.com/PageCloudv1/xcloud-bot`
   - **Webhook URL**: `https://seu-dominio.com/webhooks/github` (ou use ngrok para desenvolvimento)
   - **Webhook secret**: Gere um segredo aleatório (guarde para depois)

3. **Configure as permissões necessárias:**

   **Repository permissions:**
   - Actions: **Read & Write**
   - Checks: **Read & Write**
   - Contents: **Read & Write**
   - Issues: **Read & Write**
   - Pull requests: **Read & Write**
   - Metadata: **Read-only** (automático)
   - Repository projects: **Read & Write**

4. **Assine os eventos (webhooks):**
   - [x] Issue comment
   - [x] Issues
   - [x] Pull request
   - [x] Pull request review
   - [x] Pull request review comment
   - [x] Push
   - [x] Workflow run

5. **Onde a app pode ser instalada:**
   - Selecione "Only on this account" se for para uso pessoal
   - Ou "Any account" se quiser que outros instalem

6. **Clique em "Create GitHub App"**

### 3️⃣ Salvar as credenciais

Após criar a app, você verá uma página com informações importantes:

1. **App ID**: Copie o número (ex: `123456`)
2. **Private Key**: Clique em "Generate a private key" e faça o download do arquivo `.pem`
3. **Webhook Secret**: O segredo que você definiu anteriormente

### 4️⃣ Configurar o arquivo .env

Crie ou edite o arquivo `.env` na raiz do projeto:

```bash
# Copie o .env.example se ainda não tiver um .env
cp .env.example .env
```

Edite o `.env` e adicione as credenciais:

```env
# GitHub App Configuration
GH_APP_ID=123456  # Cole o App ID aqui
GH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...conteúdo da chave privada aqui...
-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=seu_webhook_secret_aqui

# Configurações do servidor
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE**: A chave privada deve incluir as linhas `-----BEGIN RSA PRIVATE KEY-----` e `-----END RSA PRIVATE KEY-----`

### 5️⃣ Instalar a app no repositório

1. Acesse: https://github.com/apps/seu-app-name (substitua pelo nome da sua app)
2. Clique em "Install"
3. Selecione os repositórios onde quer instalar (ou selecione "All repositories")
4. Clique em "Install"

### 6️⃣ Iniciar o bot localmente

```bash
# Instalar dependências
npm install

# Iniciar o bot
npm run bot:start

# Ou para desenvolvimento com auto-reload
npm run bot:dev
```

Se tudo estiver configurado corretamente, você verá:

```
🤖 xcloud-bot iniciado na porta 3000
📡 Webhooks disponíveis em: /webhooks/github
🏥 Health check em: /health
```

### 7️⃣ Configurar webhook URL (para desenvolvimento)

Durante o desenvolvimento, use **ngrok** ou **smee.io** para receber webhooks:

**Opção 1: ngrok (recomendado)**

```bash
# Instale ngrok: https://ngrok.com/download
ngrok http 3000

# Copie a URL HTTPS (ex: https://abc123.ngrok.io)
# Vá em: https://github.com/settings/apps/seu-app
# Edite a "Webhook URL" para: https://abc123.ngrok.io/webhooks/github
```

**Opção 2: smee.io**

```bash
npm install -g smee-client
smee --url https://smee.io/seu-canal --target http://localhost:3000/webhooks/github
```

## 🧪 Testar o bot

1. **Crie uma issue de teste** no repositório onde instalou o bot

2. **Adicione um comentário mencionando o bot:**

   ```
   @xcloud-bot help
   ```

3. **Aguarde alguns segundos** - o bot deve responder automaticamente!

## 🔍 Validar a configuração

Execute o validador para verificar se está tudo correto:

```bash
npm run validate:github-app
```

Este comando verifica:

- ✅ Arquivo `.env` existe
- ✅ Variáveis obrigatórias estão configuradas
- ✅ Arquivos de manifesto existem
- ✅ Documentação está presente

## ❓ Troubleshooting

### O bot não responde às menções

**Possíveis causas:**

1. **App não está instalada no repositório**
   - Solução: Vá em https://github.com/apps/seu-app-name e instale

2. **Webhook URL incorreta ou não acessível**
   - Solução: Verifique a URL nas configurações da app
   - Use ngrok para desenvolvimento local

3. **Credenciais incorretas no .env**
   - Solução: Execute `npm run validate:github-app`
   - Verifique se o App ID está correto
   - Verifique se a chave privada está completa

4. **Bot não está rodando**
   - Solução: Execute `npm run bot:start`
   - Verifique os logs para erros

5. **Permissões insuficientes**
   - Solução: Verifique se a app tem permissão "Issues: Read & Write"
   - Vá em https://github.com/settings/apps/seu-app/permissions

6. **Evento não subscrito**
   - Solução: Verifique se "Issue comment" está marcado nos eventos

### Como ver os logs de webhook

No terminal onde o bot está rodando, você verá logs como:

```
Bot mencionado na issue #1 em usuario/repositorio
✅ Comentário criado com sucesso
```

Se não vê logs quando menciona o bot, o webhook não está chegando.

### Verificar se webhooks estão sendo recebidos

1. Acesse: https://github.com/settings/apps/seu-app/advanced
2. Role até "Recent Deliveries"
3. Você verá uma lista de webhooks enviados
4. Clique em um para ver detalhes e resposta

## 📚 Recursos adicionais

- 🚀 [Guia de início rápido](./QUICK_START.md)
- 📋 [Checklist de registro](./REGISTRATION_CHECKLIST.md)
- 🤖 [Guia detalhado do bot](./GITHUB_BOT_SETUP_GUIDE.md)
- 📖 [README principal](./README.md)

## 🆘 Precisa de ajuda?

- Abra uma issue: https://github.com/PageCloudv1/xcloud-bot/issues
- Mencione `@xcloud-bot` em qualquer issue (após configurar!)
- Consulte a documentação oficial do GitHub Apps: https://docs.github.com/en/developers/apps
## Proximos Passos

1. Registrar GitHub App
2. Configurar secrets
3. Instalar nos repositorios
4. Testar funcionalidade
