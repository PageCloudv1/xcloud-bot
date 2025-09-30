# 🤖 Por que o bot não está respondendo?

## 📋 Diagnóstico Rápido

Se você menciona `@xcloud-bot` em issues ou comentários mas não recebe resposta, siga esta checklist:

### ✅ Checklist de Diagnóstico

Execute estes passos na ordem:

#### 1. Verifique a configuração

```bash
npm run validate:github-app
```

**O que esperar:**

- ✅ Todos os checks devem passar
- ❌ Se houver falhas, siga as instruções exibidas

#### 2. Verifique se a GitHub App está registrada

**Sintomas de app não registrada:**

- `GH_APP_ID` está vazio ou com valor de exemplo
- `GH_PRIVATE_KEY` está vazio ou com valor de exemplo
- Validação falha com "missing environment variables"

**Solução:**

```bash
npm run register:github-app
```

Siga o assistente interativo para registrar sua GitHub App.

#### 3. Verifique se a app está instalada

1. Acesse: `https://github.com/apps/SEU-APP-NAME`
2. Clique em "Configure"
3. Verifique se o repositório onde está testando está na lista
4. Se não estiver, clique em "Install" e selecione o repositório

#### 4. Verifique se o bot está rodando

```bash
npm run bot:start
```

**O que esperar:**

```
🤖 xcloud-bot iniciado na porta 3000
📡 Webhooks disponíveis em: /webhooks/github
🏥 Health check em: /health
```

**Se ver erros:**

- Verifique o `.env` file
- Verifique se as credenciais estão corretas
- Execute `npm install` para garantir dependências

#### 5. Configure webhooks (desenvolvimento local)

Durante desenvolvimento local, GitHub não consegue enviar webhooks para `localhost`. Use **ngrok**:

```bash
# Instale ngrok: https://ngrok.com/download
ngrok http 3000
```

Copie a URL HTTPS (ex: `https://abc123.ngrok.io`) e:

1. Acesse: `https://github.com/settings/apps/SEU-APP`
2. Edite "Webhook URL" para: `https://abc123.ngrok.io/webhooks/github`
3. Salve as alterações

#### 6. Verifique as permissões

A GitHub App precisa ter estas permissões:

**Repository permissions:**

- ✅ **Issues**: Read & Write ← OBRIGATÓRIO para responder
- ✅ **Pull requests**: Read & Write
- ✅ **Contents**: Read & Write
- ✅ **Metadata**: Read-only (automático)

**Subscribe to events:**

- ✅ **Issue comment** ← OBRIGATÓRIO para receber menções
- ✅ **Issues**
- ✅ **Pull request**
- ✅ **Pull request review**

**Como verificar:**

1. Acesse: `https://github.com/settings/apps/SEU-APP/permissions`
2. Confira cada permissão
3. Se precisar alterar, salve e reinstale a app

#### 7. Teste o webhook

**Verificar se webhooks estão sendo recebidos:**

1. Acesse: `https://github.com/settings/apps/SEU-APP/advanced`
2. Role até "Recent Deliveries"
3. Crie um comentário de teste mencionando `@xcloud-bot`
4. Atualize a página - um novo webhook deve aparecer
5. Clique nele para ver:
   - ✅ Response: 200 OK (sucesso)
   - ❌ Response: 404/500 (problema)

**Se não ver webhooks chegando:**

- Webhook URL está incorreta
- Bot não está rodando
- Firewall bloqueando (se auto-hospedado)

## 🔍 Cenários Comuns e Soluções

### Cenário 1: "Nunca configurei o bot"

**Sintomas:**

- Primeira vez usando o bot
- Não sei se a app está registrada
- `.env` com valores de exemplo

**Solução:**

1. Execute: `npm run register:github-app`
2. Siga o assistente completo
3. Configure o `.env` com as credenciais obtidas
4. Instale a app no repositório
5. Inicie o bot: `npm run bot:start`
6. Configure ngrok para desenvolvimento

**Guias úteis:**

- [GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md) - Guia completo
- [QUICK_START.md](./QUICK_START.md) - Início rápido

### Cenário 2: "Já configurei mas não funciona"

**Sintomas:**

- App está registrada
- Bot inicia sem erros
- Mas não responde a menções

**Causas possíveis:**

**A) Webhook URL incorreta**

```bash
# Verifique se ngrok está rodando
curl http://localhost:4040/api/tunnels

# Verifique se a URL do ngrok está nas configurações da app
```

**B) Permissões insuficientes**

- Acesse configurações da app
- Verifique "Issues: Read & Write"
- Salve e reinstale se necessário

**C) Evento não subscrito**

- Acesse configurações da app
- Verifique "Subscribe to events"
- Marque "Issue comment"
- Salve as alterações

**D) Bot não reconhece menções**

- Use `@xcloud-bot` (exatamente como configurado)
- Verifique nome da app nas configurações
- Nome deve corresponder ao usado nas menções

### Cenário 3: "Funcionava antes, parou agora"

**Causas possíveis:**

**A) Ngrok URL expirou** (free tier)

```bash
# Inicie novo ngrok
ngrok http 3000

# Atualize Webhook URL na app com nova URL
```

**B) Bot parou de rodar**

```bash
# Reinicie o bot
npm run bot:start
```

**C) Token/credenciais expiraram**

```bash
# Regenere private key se necessário
# Baixe novo .pem
# Atualize .env
```

**D) App foi desinstalada**

- Reinstale a app no repositório

### Cenário 4: "Funciona em um repo mas não em outro"

**Causa:** App não está instalada no segundo repositório

**Solução:**

1. Acesse: `https://github.com/apps/SEU-APP`
2. Clique em "Configure"
3. Adicione o novo repositório
4. Salve as alterações

## 📊 Logs e Debugging

### Ver logs do bot

Quando o bot está rodando, você verá logs como:

```
🔍 Novo issue criado: Teste em usuario/repo
✅ Labels adicionadas: bug, enhancement
Bot mencionado na issue #1 em usuario/repo
✅ Comentário criado com sucesso
```

**Se não vê logs quando menciona o bot:**

- Webhook não está chegando ao bot
- Verifique ngrok/webhook URL

### Logs de erro comuns

**Erro: `Error: Missing required environment variable`**

```bash
# Solução: Configure o .env
cp .env.example .env
# Edite .env com suas credenciais
npm run validate:github-app
```

**Erro: `HttpError: Bad credentials`**

```bash
# Solução: Credenciais inválidas
# Verifique GH_APP_ID e GH_PRIVATE_KEY no .env
# Regenere private key se necessário
```

**Erro: `Error: Installation not found`**

```bash
# Solução: App não instalada no repositório
# Instale a app: https://github.com/apps/SEU-APP
```

### Verificar webhooks recebidos

No terminal do bot, você deve ver:

```
Webhook recebido: issue_comment (xxxxx)
Bot mencionado na issue #N em repo/name
```

Se não vê isso, webhooks não estão chegando.

## 🧪 Teste Manual

### 1. Teste local de saúde

```bash
# Com o bot rodando
curl http://localhost:3000/health
```

**Resposta esperada:**

```json
{
  "status": "ok",
  "service": "xcloud-bot",
  "version": "1.0.0"
}
```

### 2. Teste de webhook manual

Você pode testar o endpoint de webhook localmente:

```bash
# Instale ferramenta de teste (opcional)
npm install -g @octokit/webhooks-examples

# Ou use curl para simular webhook
# (requer payload válido)
```

### 3. Teste de menção

1. Crie uma issue de teste
2. Adicione comentário: `@xcloud-bot help`
3. Aguarde 2-5 segundos
4. Verifique:
   - Logs do bot no terminal
   - Comentário de resposta na issue
   - Webhook em "Recent Deliveries"

## 📞 Ainda não funciona?

Se seguiu todos os passos e ainda não funciona:

### 1. Documente o problema

- Screenshot da configuração da app
- Conteúdo do `.env` (SEM a chave privada!)
- Logs do bot quando tenta mencionar
- Screenshot dos "Recent Deliveries"

### 2. Abra uma issue

1. Acesse: https://github.com/PageCloudv1/xcloud-bot/issues/new
2. Título: "Bot não responde a menções"
3. Inclua:
   - Resultado de `npm run validate:github-app`
   - Logs relevantes
   - Passos que já tentou

### 3. Verificações finais

- [ ] `.env` existe e tem credenciais válidas
- [ ] `npm run validate:github-app` passa
- [ ] Bot está rodando sem erros
- [ ] App está instalada no repositório
- [ ] Permissões corretas (Issues: Read & Write)
- [ ] Evento "Issue comment" subscrito
- [ ] Webhook URL configurada (com ngrok para dev)
- [ ] Webhooks aparecem em "Recent Deliveries"
- [ ] Nome da menção corresponde ao nome da app

## 🔗 Recursos Úteis

- 📖 [GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md) - Guia completo de setup
- 🚀 [QUICK_START.md](./QUICK_START.md) - Início rápido
- 📋 [REGISTRATION_CHECKLIST.md](./REGISTRATION_CHECKLIST.md) - Checklist
- 🤖 [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- 🔧 [Ngrok Documentation](https://ngrok.com/docs)

---

**💡 Dica:** Na maioria dos casos, o problema é:

1. App não está registrada → Execute `npm run register:github-app`
2. App não está instalada → Instale em https://github.com/apps/SEU-APP
3. Webhook URL incorreta → Configure ngrok e atualize a URL

