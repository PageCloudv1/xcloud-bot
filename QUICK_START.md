# 🚀 xCloud Bot - Quick Start Guide

Este guia rápido ajudará você a configurar o xCloud Bot em minutos.

## 📦 Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/PageCloudv1/xcloud-bot.git
cd xcloud-bot

# 2. Instale as dependências
npm install

# 3. Execute o assistente de registro
npm run register:github-app
```

## 🤖 Registro da GitHub App

O assistente interativo irá guiá-lo através dos seguintes passos:

### Passo 1: Criar a GitHub App

1. Acesse: **https://github.com/settings/apps/new**
2. Preencha as informações básicas:
   - **Nome**: `xCloud Bot`
   - **Descrição**: `Intelligent automation bot`
   - **Homepage**: `https://github.com/PageCloudv1/xcloud-bot`

### Passo 2: Configurar Permissões

Marque estas permissões (Repository permissions):

- ✅ Actions: Read and write
- ✅ Checks: Read and write
- ✅ Contents: Read and write
- ✅ Issues: Read and write
- ✅ Pull requests: Read and write
- ✅ Repository projects: Read and write

### Passo 3: Selecionar Eventos

Marque estes eventos:

- ✅ Issues
- ✅ Issue comments
- ✅ Pull requests
- ✅ Pull request reviews
- ✅ Push
- ✅ Check runs

### Passo 4: Criar e Salvar Credenciais

1. Clique em **"Create GitHub App"**
2. Anote o **App ID**
3. Clique em **"Generate a private key"** e baixe o arquivo `.pem`

### Passo 5: Configurar Secrets

No seu repositório, vá em **Settings > Secrets > Actions** e adicione:

```
GITHUB_APP_ID=<seu-app-id>
GITHUB_PRIVATE_KEY=<conteúdo-completo-do-arquivo-pem>
```

Para obter o conteúdo do .pem:

```bash
cat caminho/para/arquivo.pem
```

### Passo 6: Instalar a App

1. Na página da GitHub App, clique em **"Install App"**
2. Selecione os repositórios
3. Confirme a instalação

## ✅ Validação

Verifique se tudo está configurado corretamente:

```bash
npm run validate:github-app
```

## 🎯 Testar o Bot

### Teste Local

```bash
# Configurar .env
cp .env.example .env
# Edite .env com suas credenciais

# Iniciar o bot
npm run bot:start
```

### Teste em Produção

1. Crie uma issue em um repositório onde a app está instalada
2. O bot deve responder automaticamente
3. Verifique as labels aplicadas

## 🔧 Comandos Úteis

```bash
# Registro e configuração
npm run register:github-app    # Assistente de registro
npm run validate:github-app    # Validar configuração

# Desenvolvimento
npm run bot:dev                # Modo desenvolvimento
npm run bot:start              # Iniciar bot

# Testes
npm run test                   # Executar testes
npm run lint                   # Verificar código

# Deploy
npm run deploy:staging         # Deploy para staging
npm run deploy:production      # Deploy para produção
```

## 📚 Documentação Completa

- [GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md) - Guia completo de registro
- [GITHUB_BOT_SETUP_GUIDE.md](./GITHUB_BOT_SETUP_GUIDE.md) - Guia detalhado
- [README.md](./README.md) - Documentação completa
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia de deploy

## ⚠️ Solução de Problemas

### Bot não responde

```bash
# Verificar configuração
npm run validate:github-app

# Verificar logs
npm run bot:start
```

### Erro de permissões

- Verifique se a app está instalada no repositório
- Confirme que as permissões estão corretas
- Reinstale a app se necessário

### Private key inválida

- Copie TODO o conteúdo do arquivo .pem
- Mantenha as quebras de linha
- Use aspas duplas no .env

## 🎉 Pronto!

Seu xCloud Bot está configurado! Próximos passos:

1. ✅ Teste criando issues e PRs
2. ✅ Configure funcionalidades adicionais
3. ✅ Personalize o comportamento do bot
4. ✅ Configure o deploy em produção

---

**Need help?** Abra uma issue: https://github.com/PageCloudv1/xcloud-bot/issues
