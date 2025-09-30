# 🔧 xCloud Bot - Troubleshooting Guide

Este guia ajuda a resolver problemas comuns durante a configuração do xCloud Bot.

## 📋 Índice

1. [Erro: "Bad credentials"](#erro-bad-credentials)
2. [Bot não responde a issues/PRs](#bot-não-responde)
3. [Erro de Private Key inválida](#private-key-inválida)
4. [Problemas de permissão](#problemas-de-permissão)
5. [Validação falhando](#validação-falhando)

---

## Erro: "Bad credentials"

### Sintomas

- Bot inicia mas mostra erro: `⚠️ Could not get bot info: Bad credentials`
- Webhooks não funcionam
- Bot não responde a eventos

### Causa Principal

**Você provavelmente usou o Client ID em vez do App ID.**

Na página da GitHub App existem **DOIS** identificadores diferentes:

- **App ID**: Número (ex: `123456`) ✅ **CORRETO**
- **Client ID**: Começa com "Iv" (ex: `Iv1.abc123def456`) ❌ **ERRADO**

### Solução

#### Passo 1: Verificar qual ID você está usando

Execute o validador:

```bash
npm run validate:github-app
```

Se você ver este erro:

```
❌ GITHUB_APP_ID - This appears to be a Client ID (starts with 'Iv'), not an App ID
```

Então você precisa corrigir!

#### Passo 2: Encontrar o App ID correto

1. Acesse: https://github.com/settings/apps
2. Clique na sua GitHub App (ex: "xCloud Bot")
3. No menu lateral, clique em **"General"**
4. Role até a seção **"About"**
5. Você verá duas informações:
   ```
   App ID: 123456          ← Use este (número)
   Client ID: Iv1.xxxxx    ← Não use este
   ```

#### Passo 3: Atualizar o valor

**Para uso local (.env file):**

```bash
# Abra o arquivo .env
nano .env  # ou seu editor preferido

# Atualize a linha GITHUB_APP_ID
GITHUB_APP_ID=123456  # Use o número, sem aspas
```

**Para GitHub Actions (Secrets):**

1. Vá para: **Settings > Secrets and variables > Actions**
2. Encontre o secret `GITHUB_APP_ID`
3. Clique em **Update**
4. Cole o App ID (número)
5. Clique em **Update secret**

#### Passo 4: Validar e testar

```bash
# Validar configuração
npm run validate:github-app

# Deve mostrar:
# ✅ GITHUB_APP_ID - GitHub App ID

# Testar bot
npm run bot:start

# Não deve mais mostrar erro "Bad credentials"
```

---

## Bot não responde

### Sintomas

- Bot está rodando mas não responde a issues
- Bot não comenta em PRs
- Sem mensagens de erro aparentes

### Possíveis Causas

#### 1. App não está instalada no repositório

**Verificar:**

1. Vá para: https://github.com/settings/installations
2. Clique na sua GitHub App
3. Verifique se o repositório está na lista

**Solução:**

1. Na mesma página, clique em **Configure**
2. Em "Repository access":
   - Selecione "All repositories" ou
   - Adicione o repositório específico
3. Clique em **Save**

#### 2. Permissões insuficientes

**Verificar:**

1. Acesse: https://github.com/settings/apps
2. Clique na sua app
3. Clique em **"Permissions & events"**

**Permissões necessárias (Repository permissions):**

- ✅ Actions: Read and write
- ✅ Checks: Read and write
- ✅ Contents: Read and write
- ✅ Issues: Read and write
- ✅ Pull requests: Read and write

**Eventos necessários (Subscribe to events):**

- ✅ Issues
- ✅ Issue comments
- ✅ Pull requests
- ✅ Pull request reviews
- ✅ Push

**Solução:**

1. Marque as permissões faltantes
2. Clique em **Save changes**
3. Reinstale a app nos repositórios se solicitado

#### 3. Webhook não configurado (para produção)

Se estiver usando em produção (servidor web):

**Verificar:**

1. Acesse a página da GitHub App
2. Clique em **"General"**
3. Verifique se "Webhook URL" está preenchida

**Solução:**
Configure a URL do webhook apontando para seu servidor:

```
https://seu-servidor.com/webhook
```

#### 4. GITHUB_OWNER incorreto

**Verificar .env:**

```bash
cat .env | grep GITHUB_OWNER
```

**Deve ser:**

- Seu username se for conta pessoal
- O nome da organização se for org

**Exemplo:**

```bash
GITHUB_OWNER=rootkit-original  # para usuário
# ou
GITHUB_OWNER=PageCloudv1       # para organização
```

---

## Private Key inválida

### Sintomas

- Erro ao iniciar: "Invalid private key"
- Erro: "PEM routines::no start line"

### Causa

- Private key não foi copiada corretamente
- Faltam as linhas BEGIN/END
- Quebras de linha foram removidas

### Solução

#### Passo 1: Copiar a private key corretamente

```bash
# No terminal, exiba o conteúdo do arquivo .pem
cat caminho/para/sua-chave.pem

# Copie TODO o conteúdo, incluindo:
# -----BEGIN RSA PRIVATE KEY-----
# ... linhas da chave ...
# -----END RSA PRIVATE KEY-----
```

#### Passo 2: Colar no .env com aspas duplas

```bash
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAs+EKLBylAXs7RLKbTdVjc2MfZ37KfJXb...
... (muitas linhas) ...
-----END RSA PRIVATE KEY-----"
```

**IMPORTANTE:**

- ✅ Use aspas duplas `"`
- ✅ Mantenha todas as quebras de linha
- ✅ Inclua as linhas BEGIN e END
- ❌ Não adicione espaços extras
- ❌ Não remova quebras de linha

#### Passo 3: Validar

```bash
npm run validate:github-app

# Deve mostrar:
# ✅ GITHUB_PRIVATE_KEY - GitHub App Private Key
```

---

## Problemas de permissão

### Erro: "Resource not accessible by integration"

**Causa:** A GitHub App não tem permissão para a ação solicitada.

**Solução:**

1. Acesse: https://github.com/settings/apps
2. Clique na sua app > **"Permissions & events"**
3. Encontre a permissão necessária e aumente para "Read and write"
4. Clique em **Save changes**
5. Aceite a solicitação de atualização nos repositórios instalados

### Erro: "Not installed"

**Causa:** A app não está instalada no repositório.

**Solução:**

1. Vá para a página da app
2. Clique em **"Install App"**
3. Selecione o repositório
4. Confirme a instalação

---

## Validação falhando

### Executar validação completa

```bash
npm run validate:github-app
```

### Problemas comuns identificados pelo validador

#### ❌ GITHUB_APP_ID - Client ID detectado

```
❌ GITHUB_APP_ID - This appears to be a Client ID (starts with 'Iv')
```

**Solução:** Veja [Erro: "Bad credentials"](#erro-bad-credentials)

#### ❌ GITHUB_PRIVATE_KEY - Formato inválido

```
⚠️ GITHUB_PRIVATE_KEY - Invalid format (should contain BEGIN PRIVATE KEY)
```

**Solução:** Veja [Private Key inválida](#private-key-inválida)

#### ⚠️ .env file not found

```
❌ .env file not found
```

**Solução:**

```bash
cp .env.example .env
# Depois edite o .env com suas credenciais
```

---

## 🆘 Ainda com problemas?

### Checklist rápida

- [ ] Executou `npm install`?
- [ ] Executou `npm run validate:github-app`?
- [ ] Usou o **App ID** (número), não o Client ID?
- [ ] Private key tem as linhas BEGIN e END?
- [ ] App está instalada no repositório correto?
- [ ] Permissões da app estão configuradas?

### Como obter ajuda

1. **Execute diagnóstico completo:**

   ```bash
   npm run validate:github-app > diagnostico.txt
   npm run bot:start > logs.txt 2>&1
   ```

2. **Abra uma issue:**
   - URL: https://github.com/PageCloudv1/xcloud-bot/issues
   - Anexe: `diagnostico.txt` e `logs.txt`
   - Descreva o problema e os passos que já tentou

3. **Informações úteis para incluir:**
   - Sistema operacional
   - Versão do Node.js (`node --version`)
   - Mensagens de erro completas
   - Resultado do `npm run validate:github-app`

---

## 📚 Recursos Adicionais

- [GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md) - Guia completo de setup
- [QUICK_START.md](./QUICK_START.md) - Guia rápido
- [REGISTRATION_CHECKLIST.md](./REGISTRATION_CHECKLIST.md) - Checklist passo a passo
- [GitHub Apps Documentation](https://docs.github.com/en/apps) - Documentação oficial

---

**Última atualização:** 2024
