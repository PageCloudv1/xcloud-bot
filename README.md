# 🤖 xcloud-bot

Bot inteligente para automação e assistência em repositórios GitHub, desenvolvido para a organização PageCloudv1.

## ✨ Funcionalidades

### 🔍 Análise Automática de Issues
- **Análise inteligente** com IA (Gemini) do conteúdo das issues
- **Labels automáticas** baseadas no contexto e conteúdo
- **Priorização automática** (low, medium, high, critical)
- **Comentários contextuais** com sugestões e próximos passos
- **Categorização** por tipo de problema ou funcionalidade

### 📊 Análise de Pull Requests
- **Análise de tamanho** (XS, S, M, L, XL, XXL)
- **Detecção de tipo** (feature, bugfix, refactor, docs, etc.)
- **Avaliação de risco** baseada nas mudanças
- **Estimativa de tempo** de review
- **Sugestões de melhoria** automáticas
- **Checks de qualidade** integrados

### 🤝 Interação Inteligente
- **Resposta a menções** (@xcloud-bot)
- **Assistência contextual** baseada no tipo de issue/PR
- **Sugestões de reviewers** baseadas nos arquivos modificados
- **Celebração de merges** e fechamento de issues

### 🏷️ Sistema de Labels Inteligente
- **Detecção automática** de tipo de issue/PR
- **Priorização** baseada em palavras-chave
- **Categorização técnica** (frontend, backend, database, etc.)
- **Labels de tamanho** para PRs

## 🚀 Como Usar

### Para Issues
1. **Crie uma issue** - O bot analisará automaticamente
2. **Receba análise** - Comentário com análise e sugestões
3. **Labels automáticas** - Aplicadas baseadas no conteúdo
4. **Mencione o bot** - Use `@xcloud-bot` para interagir

### Para Pull Requests
1. **Abra um PR** - Análise automática de tamanho e qualidade
2. **Receba feedback** - Comentários com estatísticas e sugestões
3. **Quality checks** - Verificações automáticas de qualidade
4. **Celebração** - Parabéns automáticos quando merged

### Comandos de Interação
- `@xcloud-bot` - Mencione para interagir
- `@xcloud-bot help` - Ajuda sobre comandos
- `@xcloud-bot analyze` - Re-análise do item atual

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Conta GitHub com permissões de administrador
- GitHub App configurada
- Chave da API Gemini (Google AI)

### 1. Configuração da GitHub App

A GitHub App já está configurada com ID: `Iv23ligqBuX1sUnHLfGY`

**Permissões necessárias:**
- Issues: Read & Write
- Pull requests: Read & Write
- Contents: Read
- Metadata: Read
- Checks: Write

### 2. Instalação Local

```bash
# Clone o repositório
git clone https://github.com/PageCloudv1/xcloud-bot.git
cd xcloud-bot

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Inicie em modo desenvolvimento
npm run dev

# Ou em produção
npm start
```

### 3. Deploy

#### Heroku
```bash
# Login no Heroku
heroku login

# Crie a aplicação
heroku create xcloud-bot-pagecloud

# Configure as variáveis de ambiente
heroku config:set GITHUB_APP_ID=Iv23ligqBuX1sUnHLfGY
heroku config:set GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
heroku config:set WEBHOOK_SECRET=your_webhook_secret
heroku config:set GEMINI_API_KEY=your_gemini_key

# Deploy
git push heroku main
```

#### Railway
```bash
# Instale o Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

### 4. Configuração de Webhooks

1. Vá para as configurações da GitHub App
2. Configure a **Webhook URL**: `https://seu-dominio.com/webhooks/github`
3. Configure o **Webhook Secret** (mesmo do .env)
4. Selecione os eventos:
   - Issues
   - Issue comments
   - Pull requests
   - Pull request reviews

### 5. Instalação nos Repositórios

1. Acesse `https://github.com/apps/xcloud-bot`
2. Clique em "Install"
3. Selecione os repositórios da PageCloudv1
4. Confirme as permissões

## 📁 Estrutura do Projeto

```
xcloud-bot/
├── src/
│   ├── app.js                 # Servidor principal
│   ├── config/
│   │   └── github-app.js      # Configuração da GitHub App
│   ├── services/
│   │   └── ai-service.js      # Serviço de IA (Gemini)
│   ├── webhooks/
│   │   ├── issues.js          # Handlers de issues
│   │   └── pull-requests.js   # Handlers de PRs
│   └── utils/
│       └── logger.js          # Sistema de logs
├── tests/                     # Testes automatizados
├── logs/                      # Arquivos de log
├── .env                       # Variáveis de ambiente
├── package.json
└── README.md
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```env
# GitHub App
GITHUB_APP_ID=Iv23ligqBuX1sUnHLfGY
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_TOKEN=ghp_your_token_here

# Servidor
PORT=3000
NODE_ENV=production

# IA
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp

# Database (opcional)
MONGODB_URI=mongodb://localhost:27017/xcloud-bot

# Logs
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Personalização

#### Modificar Respostas do Bot
Edite `src/services/ai-service.js` para personalizar:
- Prompts da IA
- Respostas padrão
- Análise de fallback

#### Adicionar Novos Eventos
1. Crie handler em `src/webhooks/`
2. Registre em `src/app.js`
3. Configure webhook na GitHub App

#### Customizar Labels
Modifique a lógica em:
- `src/services/ai-service.js` - Análise com IA
- `src/webhooks/issues.js` - Labels de issues
- `src/webhooks/pull-requests.js` - Labels de PRs

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📊 Monitoramento

### Logs
- **Arquivo**: `logs/combined.log`
- **Erros**: `logs/error.log`
- **Console**: Modo desenvolvimento

### Health Check
- **Endpoint**: `GET /health`
- **Resposta**: Status do serviço

### Métricas
- **Endpoint**: `GET /stats`
- **Dados**: Uptime, memória, estatísticas

## 🔒 Segurança

- **Rate Limiting**: 100 requests por 15 minutos
- **Helmet**: Headers de segurança
- **CORS**: Configurável
- **Validação**: Webhooks assinados
- **Logs**: Sem dados sensíveis

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0 (2024-12-30)
- ✨ Análise automática de issues com IA
- ✨ Análise de Pull Requests
- ✨ Sistema de labels inteligente
- ✨ Resposta a menções
- ✨ Integração com Gemini AI
- ✨ Quality checks para PRs
- 🔒 Rate limiting e segurança
- 📊 Sistema de logs estruturado

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/PageCloudv1/xcloud-bot/issues)
- **Documentação**: Este README
- **Contato**: Mencione `@xcloud-bot` em qualquer issue

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para PageCloudv1**

*Bot inteligente que torna o desenvolvimento mais eficiente e organizado!* 🚀