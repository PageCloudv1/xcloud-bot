# 🤖 xCloud Bot - GitHub App Setup

Este guia fornece instruções detalhadas para registrar o xCloud Bot como uma GitHub App.

## 📋 Pré-requisitos

Antes de começar, certifique-se de que você tem:

- ✅ Conta GitHub com permissões de administrador (para criar apps)
- ✅ Acesso ao repositório onde o bot será instalado
- ✅ Permissões para adicionar secrets ao repositório

## 🚀 Método Rápido - Script Interativo

A maneira mais fácil de começar é usar nosso script de registro interativo:

```bash
npm run register:github-app
```

Este script irá guiá-lo através de todo o processo de registro.

## 📝 Método Manual - Passo a Passo

### Passo 1: Acessar a Página de Criação de Apps

1. Faça login no GitHub
2. Acesse: **https://github.com/settings/apps/new**
3. Você verá o formulário de criação de GitHub App

### Passo 2: Preencher Informações Básicas

Configure os seguintes campos:

| Campo | Valor |
|-------|-------|
| **GitHub App name** | `xCloud Bot` (ou nome de sua preferência) |
| **Description** | `Intelligent automation bot for code review, AI assistance, and repository management` |
| **Homepage URL** | `https://github.com/PageCloudv1/xcloud-bot` |
| **Webhook URL** | Deixe em branco por enquanto (opcional para uso local) |
| **Webhook secret** | Gere um secret seguro ou deixe em branco |

### Passo 3: Configurar Permissões do Repositório

Marque as seguintes permissões (Repository permissions):

- ✅ **Actions**: Read and write
- ✅ **Checks**: Read and write
- ✅ **Contents**: Read and write
- ✅ **Deployments**: Read and write (opcional)
- ✅ **Issues**: Read and write
- ✅ **Metadata**: Read only (automático)
- ✅ **Pages**: Read and write (opcional)
- ✅ **Pull requests**: Read and write
- ✅ **Repository projects**: Read and write
- ✅ **Security events**: Read and write (opcional)
- ✅ **Statuses**: Read and write

### Passo 4: Inscrever-se em Eventos (Subscribe to events)

Selecione os seguintes eventos para que o bot seja notificado:

**Eventos Essenciais:**
- ✅ **Issues**
- ✅ **Issue comments**
- ✅ **Pull requests**
- ✅ **Pull request reviews**
- ✅ **Pull request review comments**
- ✅ **Push**

**Eventos Recomendados:**
- ✅ **Check runs**
- ✅ **Check suites**
- ✅ **Workflow runs**
- ✅ **Workflow dispatch**

### Passo 5: Criar a App

1. Role até o final da página
2. Clique no botão **"Create GitHub App"**
3. Aguarde a confirmação de criação

### Passo 6: Salvar Credenciais

⚠️ **IMPORTANTE:** Após criar a app, você precisará salvar algumas informações:

1. **App ID**: Anote o número do App ID (visível na página da app)
2. **Client ID**: Anote o Client ID (visível na página da app)
3. **Private Key**: 
   - Clique em **"Generate a private key"**
   - Um arquivo `.pem` será baixado automaticamente
   - Guarde este arquivo com segurança!

### Passo 7: Configurar Secrets no Repositório

1. Vá para o repositório onde o bot será usado
2. Acesse **Settings > Secrets and variables > Actions**
3. Clique em **"New repository secret"**
4. Adicione os seguintes secrets:

#### Secret: GITHUB_APP_ID
```
Nome: GITHUB_APP_ID
Valor: <seu-app-id>
```

#### Secret: GITHUB_PRIVATE_KEY
```
Nome: GITHUB_PRIVATE_KEY
Valor: <conteúdo-completo-do-arquivo-pem>
```

**Dica:** Para obter o conteúdo do arquivo .pem:
```bash
cat caminho/para/seu-arquivo.pem
```

#### Secret: WEBHOOK_SECRET (Opcional)
```
Nome: WEBHOOK_SECRET
Valor: <seu-webhook-secret>
```

### Passo 8: Instalar a App

1. Na página da sua GitHub App, clique em **"Install App"** (menu lateral)
2. Selecione a organização ou conta onde deseja instalar
3. Escolha entre:
   - **All repositories**: Instalar em todos os repositórios
   - **Only select repositories**: Escolher repositórios específicos
4. Clique em **"Install"**
5. Confirme as permissões

### Passo 9: Configurar Variáveis de Ambiente Locais

Se você planeja executar o bot localmente:

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas credenciais:
```env
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=seu_webhook_secret
GITHUB_OWNER=PageCloudv1

# Gemini API (opcional, para funcionalidades de IA)
GEMINI_API_KEY=sua_chave_gemini
```

### Passo 10: Testar a Instalação

1. Execute o bot localmente:
```bash
npm run bot:start
```

2. Ou crie uma issue de teste em um repositório onde a app está instalada:
   - O bot deve responder automaticamente
   - Você verá labels sendo aplicadas
   - Um comentário de análise será adicionado

## 🔍 Verificação da Configuração

Para verificar se tudo está configurado corretamente:

```bash
# Verificar variáveis de ambiente
npm run register:github-app
# Siga as instruções e escolha "Validate Setup"
```

## 🔧 Solução de Problemas

### Bot não responde a eventos

- ✅ Verifique se a app está instalada no repositório
- ✅ Confirme que os secrets estão configurados corretamente
- ✅ Verifique se os eventos estão selecionados nas configurações da app

### Erro de permissões

- ✅ Revise as permissões da app
- ✅ Certifique-se de que a app tem acesso ao repositório
- ✅ Reinstale a app se necessário

### Private Key inválida

- ✅ Copie todo o conteúdo do arquivo .pem, incluindo as linhas BEGIN e END
- ✅ Mantenha as quebras de linha originais
- ✅ Use aspas duplas no arquivo .env

### Webhook não funciona

- ✅ Configure a URL do webhook nas configurações da app
- ✅ Certifique-se de que o servidor está acessível publicamente
- ✅ Verifique o webhook secret

## 📚 Recursos Adicionais

- 📖 [Documentação Oficial GitHub Apps](https://docs.github.com/en/apps)
- 📖 [GITHUB_BOT_SETUP_GUIDE.md](./GITHUB_BOT_SETUP_GUIDE.md) - Guia detalhado
- 📖 [README.md](./README.md) - Documentação completa do bot
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Instruções de deploy

## 🎉 Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Configure variáveis adicionais no `.env` conforme necessário
2. ✅ Personalize as configurações do bot
3. ✅ Teste as funcionalidades criando issues e PRs
4. ✅ Configure o deploy em produção (opcional)

---

**Desenvolvido com ❤️ para PageCloudv1**

Para suporte, abra uma issue em: https://github.com/PageCloudv1/xcloud-bot/issues
