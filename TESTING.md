# 🧪 Guia de Testes do xCloud Bot

## 📋 Pré-requisitos

1. Bot rodando: `npm run start:app`
2. Porta 3000 disponível
3. Variáveis de ambiente configuradas no `.env`

## 🚀 Testes Rápidos

### Método 1: Script Automatizado

Execute o script de testes:

```bash
npm run test:bot
```

Este script testa automaticamente:
- ✅ Health check endpoint
- ℹ️ Bot info endpoint
- 📊 Estatísticas e métricas

### Método 2: Testes Manuais com PowerShell/curl

#### 1. Health Check
```powershell
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "service": "xcloud-bot",
  "version": "1.0.0",
  "timestamp": "2025-09-30T...",
  "uptime": 123.456
}
```

#### 2. Informações do Bot
```powershell
curl http://localhost:3000/info
```

**Resposta esperada:**
```json
{
  "name": "xcloud-bot",
  "version": "1.0.0",
  "description": "...",
  "appId": "2034314",
  "features": [...]
}
```

#### 3. Testar Webhook (Issue Opened)
```powershell
$payload = @{
  action = "opened"
  issue = @{
    number = 123
    title = "Teste de Issue"
    body = "Testando o bot"
    state = "open"
    user = @{ login = "test-user"; type = "User" }
    html_url = "https://github.com/PageCloudv1/xcloud-bot/issues/123"
  }
  repository = @{
    name = "xcloud-bot"
    full_name = "PageCloudv1/xcloud-bot"
    owner = @{ login = "PageCloudv1" }
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/webhooks/github" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "X-GitHub-Event" = "issues"
    "X-GitHub-Delivery" = "test-123"
  } `
  -Body $payload
```

### Método 3: Testes com Postman/Insomnia

1. Importe a coleção de requests do arquivo `tests/postman-collection.json` (se disponível)
2. Configure a variável de ambiente `BASE_URL` como `http://localhost:3000`
3. Execute os testes sequencialmente

## 🔍 Verificar Logs

Enquanto o bot está rodando, você verá logs no terminal:

```bash
# Logs de inicialização
info: GitHub App inicializado com App ID: 2034314
info: 🤖 xcloud-bot iniciado na porta 3000
info: 📡 Webhooks disponíveis em: /webhooks/github

# Logs de requisições
info: Health check requisitado
debug: Webhook recebido: issues.opened (abc123)
```

## 🧩 Testes de Integração com GitHub

### Opção A: Usando ngrok (Recomendado para desenvolvimento)

1. **Instale o ngrok:**
   ```bash
   winget install ngrok
   ```

2. **Inicie o túnel:**
   ```bash
   ngrok http 3000
   ```

3. **Configure o webhook no GitHub App:**
   - Acesse: https://github.com/settings/apps/xcloud-bot
   - Webhook URL: `https://SEU-DOMINIO.ngrok.io/webhooks/github`
   - Webhook Secret: (valor do seu `.env`)
   - Eventos: `issues`, `issue_comment`, `pull_request`, etc.

4. **Teste criando uma issue real:**
   - Vá para https://github.com/PageCloudv1/xcloud-bot/issues
   - Crie uma nova issue
   - Observe os logs do bot reagindo ao evento

### Opção B: GitHub Actions com `act`

Já configurado! Execute:

```bash
# Testar workflow de issue management
act issues -W .github/workflows/issue-management.yml -s GEMINI_API_KEY=sua-chave

# Testar workflow de manual review
act pull_request -W .github/workflows/manual-review.yml -s GEMINI_API_KEY=sua-chave
```

## 📊 Métricas e Monitoramento

### Endpoints de Observabilidade

- `/health` - Status do serviço
- `/info` - Informações e configuração
- `/metrics` (se configurado) - Métricas Prometheus

### Logs Estruturados

Os logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

## 🐛 Troubleshooting

### Bot não responde aos webhooks

1. **Verifique se o bot está rodando:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verifique os logs do bot:**
   ```bash
   tail -f logs/combined.log
   ```

3. **Teste a assinatura do webhook:**
   - Desabilite temporariamente a verificação de assinatura para testes
   - Ou configure corretamente o `WEBHOOK_SECRET`

### Porta 3000 já em uso

```bash
# Descubra o processo
netstat -ano | findstr :3000

# Mate o processo (substitua PID)
taskkill /PID <PID> /F

# Ou use outra porta
$env:PORT=3001
npm run start:app
```

### Erro ao carregar variáveis de ambiente

1. Verifique se o `.env` existe
2. Confirme que todas as variáveis obrigatórias estão definidas:
   - `GH_APP_ID`
   - `GH_PRIVATE_KEY`
   - `WEBHOOK_SECRET`

## ✅ Checklist de Testes

- [ ] Health check responde com status 200
- [ ] Info endpoint retorna configuração correta
- [ ] Bot inicia sem erros
- [ ] Logs são gerados corretamente
- [ ] Webhook de issue opened funciona
- [ ] Webhook de issue comment funciona
- [ ] Bot responde a menções (@xcloud-bot)
- [ ] Labels são aplicados corretamente
- [ ] Assignments funcionam
- [ ] Integração com Gemini está ativa

## 🎯 Próximos Passos

1. Configure ngrok para testes com GitHub real
2. Execute suite completa de testes: `npm test`
3. Valide workflows: `npm run validate`
4. Prepare para deploy: Verifique `DEPLOYMENT.md`

---

**Dúvidas?** Consulte a documentação principal no [README.md](../README.md)
