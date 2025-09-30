# 🤖 Como Registrar o xCloud Bot no GitHub

## Passo 1: Acessar GitHub Apps

1. Acesse: https://github.com/settings/apps/new
2. Você verá a página de criação de GitHub App

## Passo 2: Configurar a GitHub App

### Informações Básicas
- **GitHub App name**: `xCloud Bot`
- **Description**: `Intelligent automation bot for code review, AI assistance, and repository management`
- **Homepage URL**: `https://github.com/PageCloudv1/xcloud-bot`

### Permissions (Repository permissions)
Marque as seguintes permissões:

- ✅ **Actions**: Read and write
- ✅ **Checks**: Read and write  
- ✅ **Contents**: Read and write
- ✅ **Issues**: Read and write
- ✅ **Metadata**: Read
- ✅ **Pull requests**: Read and write
- ✅ **Repository projects**: Read and write

### Events (Subscribe to events)
Marque os seguintes eventos:

- ✅ **Issues**
- ✅ **Issue comments** 
- ✅ **Pull requests**
- ✅ **Pull request reviews**
- ✅ **Pull request review comments**
- ✅ **Push**
- ✅ **Check runs**
- ✅ **Check suites**

## Passo 3: Criar a App

1. Clique em **"Create GitHub App"**
2. **IMPORTANTE**: Anote as informações geradas:
   - App ID
   - Client ID
   - Private Key (baixe o arquivo)
   - Webhook Secret (se configurado)

## Passo 4: Configurar no Repositório

1. Acesse as configurações do seu repositório
2. Vá em **Settings > Secrets and variables > Actions**
3. Adicione os seguintes secrets:

```
GH_APP_ID=123456
GH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=seu_webhook_secret
```

## Passo 5: Instalar a App

1. Na página da sua GitHub App, clique em **"Install App"**
2. Selecione os repositórios onde deseja instalar
3. Confirme a instalação

## Passo 6: Testar

1. Execute o workflow **"xCloud Bot Setup"** em um repositório
2. Crie um issue ou PR para testar o bot
3. O bot deve responder automaticamente

## 🚀 Pronto!

Seu xCloud Bot está agora registrado e funcionando! 

### Comandos Disponíveis

- `@xcloud-bot review this` - Review automático
- `@xcloud-bot analyze code` - Análise de código
- `@xcloud-bot help` - Mostrar ajuda

### Resolução de Problemas

- **Bot não responde**: Verifique se os secrets estão corretos
- **Sem permissões**: Verifique se a app está instalada no repositório
- **Webhook não funciona**: Configure a URL do webhook nas configurações da app

---

*Documentação completa: [README.md](./README.md)*
