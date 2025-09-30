# 🚀 Guia de Deploy do xcloud-bot

## 📋 Pré-requisitos

✅ **Você já tem:**

- GitHub App criada (ID: `Iv23ligqBuX1sUnHLfGY`)
- Chave privada da GitHub App
- Token do GitHub
- API Key do Gemini
- Webhook Secret configurado

## 🎯 Opções de Deploy

### 1. 🟣 Railway (Recomendado - Mais Fácil)

```bash
# 1. Instale o Railway CLI
npm install -g @railway/cli

# 2. Faça login
railway login

# 3. No diretório do projeto
cd xcloud-bot
railway init

# 4. Configure as variáveis de ambiente
railway variables set GH_APP_ID=Iv23ligqBuX1sUnHLfGY
railway variables set GH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAs+EKLBylAXs7RLKbTdVjc2MfZ37KfJXb3o0fhOTIfEvzzbyc
m36sdfL6M6b6vxIKtftMpeGg7JOYknAET1xMQRLQtUs1sp8D4JeCqw2kqsD70qwC
L03E63fng1Nt5QEGrI7cgswKRbjV10nYnY4MENI2a32dOEXLhc2N6wkaxhZa12fD
mbD1w6eXWdcwwnimXfQ4J7iyhK4hFZb3Jm1mSjcrDzqVbfg+rrW2c6mvupS00ICN
GDpCqSITKWLO0wPIL+cNafZLLjZhSQMCNSR/mXpqllGPerw978VcmKhZ6WTI+13v
3BM1eoGyqOMcWF/jbeTuv80sYVkaZc4fK5nGGQIDAQABAoIBAEpOn4YjeyKGhrBV
XASmLwQeoX1+iiU3PvHLuIaMgCmgsqF91fACPzomWqd1xkWiLVyJ6FrqPzEbs75i
mdUy2qlTHXaXECKuv8pKrIb/BtQnDqAzwF9MMBnZmYDNuSsN5nToOz2pDmFI/sWF
0v8bC+7y99oltQnnAzFN/d9nDnFfX25B5QD4Ua35mzynzTAy00IV5hfXjFiDZqS9
38Szp12+SZmAGudRfgzwqpR9AQXQIp5/qL9taMKjzXARph5cxMq1Fs1f2rVrxxIo
EU5cyiVUf+KW2KIuWUYrK0oBQAzVndPnlD8TvP+MfV88UindD90Ue9aC2f123DpG
lP+yMyUCgYEA2VUwdespNB030DzJ3sd9siWDZgFGEZjPrffgQPPsaQngM5d0Km0h
J5ZzLl0jo1bJb6tmegicEWA6PNC3jhPG5QkcH9na7tYb3BAnptyamPMCf19bfuds
gIObwOtY72fGkeaS1dGlGTK4vyYHiIOhJ6/HYC9sB93+QdzsI9LOV/sCgYEA0+H0
P8OREHs4a70OIopBldntZqEh2E3YFZiA2v6HuKKs0E2wiH4F+BqIMDtKyvTkv+yL
G68ZlLtwloeUNQMaoIe1Hil06rqN0jjktE//w5/aRvbwDuHwBdmVCrnCMQEMkaK2
nmhsDGHehVozP7p3BbSZejlvbP/JY25tSKV2GfsCgYEArbz7c5jdpIqi/rZJzu19
X3e7tkTYZeLaS0G4JVSaLlI1yCiQNgZtlb8hLvRINCCCAeJslqvhT8a0Z7+WrV7E
Bn6k3BWFfp7tQJwthqgecpz55ycs9qM8yvPrBGtf+mrkg+hmg8YHjMBOjohxR0Gr
CBXudccTPqrJwo9Au1afnBcCgYBDCjs98aL0lAhGDotqYlReFZYH4vPSfM7iBl6+
68oFoXMMdYhlp3o8BikRGbGQhevazf01xTFS3fvBpSQ/obvLDyU/Zd6YZm55FYdH
hghm3S0zRu6txs8rCq0dt6i52JsheVpOxLtrL4w4pVGR2G3QYFQvV/zpgAU4cLgj
RDcaAQKBgFy6NtTiHU+10MhFAR09+YlsLV/aL4Olq6NH+4DRa7Vujg4uWJWGxQJZ
rONL8LMQi4vc48DutzFI5FfDZgmUwLG6ylSBe5IOhsJfHBZ9KFfJmGVxPCD/Ohic
d6w6uxF05Djal9XOXtTc4AIQoPeofaOqUJ1j9yPaEZuhUfEw2s8g
-----END RSA PRIVATE KEY-----"

railway variables set WEBHOOK_SECRET=your_webhook_secret_here
railway variables set GH_TOKEN=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
railway variables set GEMINI_API_KEY=AIzaSyAad7j529fLDYA9IiTabQIOQ5jVv-cdLuo
railway variables set NODE_ENV=production
railway variables set LOG_LEVEL=info

# 5. Deploy
railway up
```

### 2. 🟪 Heroku

```bash
# 1. Instale o Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Crie a aplicação
heroku create xcloud-bot-pagecloud

# 4. Configure as variáveis
heroku config:set GH_APP_ID=Iv23ligqBuX1sUnHLfGY
heroku config:set GH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAs+EKLBylAXs7RLKbTdVjc2MfZ37KfJXb3o0fhOTIfEvzzbyc
m36sdfL6M6b6vxIKtftMpeGg7JOYknAET1xMQRLQtUs1sp8D4JeCqw2kqsD70qwC
L03E63fng1Nt5QEGrI7cgswKRbjV10nYnY4MENI2a32dOEXLhc2N6wkaxhZa12fD
mbD1w6eXWdcwwnimXfQ4J7iyhK4hFZb3Jm1mSjcrDzqVbfg+rrW2c6mvupS00ICN
GDpCqSITKWLO0wPIL+cNafZLLjZhSQMCNSR/mXpqllGPerw978VcmKhZ6WTI+13v
3BM1eoGyqOMcWF/jbeTuv80sYVkaZc4fK5nGGQIDAQABAoIBAEpOn4YjeyKGhrBV
XASmLwQeoX1+iiU3PvHLuIaMgCmgsqF91fACPzomWqd1xkWiLVyJ6FrqPzEbs75i
mdUy2qlTHXaXECKuv8pKrIb/BtQnDqAzwF9MMBnZmYDNuSsN5nToOz2pDmFI/sWF
0v8bC+7y99oltQnnAzFN/d9nDnFfX25B5QD4Ua35mzynzTAy00IV5hfXjFiDZqS9
38Szp12+SZmAGudRfgzwqpR9AQXQIp5/qL9taMKjzXARph5cxMq1Fs1f2rVrxxIo
EU5cyiVUf+KW2KIuWUYrK0oBQAzVndPnlD8TvP+MfV88UindD90Ue9aC2f123DpG
lP+yMyUCgYEA2VUwdespNB030DzJ3sd9siWDZgFGEZjPrffgQPPsaQngM5d0Km0h
J5ZzLl0jo1bJb6tmegicEWA6PNC3jhPG5QkcH9na7tYb3BAnptyamPMCf19bfuds
gIObwOtY72fGkeaS1dGlGTK4vyYHiIOhJ6/HYC9sB93+QdzsI9LOV/sCgYEA0+H0
P8OREHs4a70OIopBldntZqEh2E3YFZiA2v6HuKKs0E2wiH4F+BqIMDtKyvTkv+yL
G68ZlLtwloeUNQMaoIe1Hil06rqN0jjktE//w5/aRvbwDuHwBdmVCrnCMQEMkaK2
nmhsDGHehVozP7p3BbSZejlvbP/JY25tSKV2GfsCgYEArbz7c5jdpIqi/rZJzu19
X3e7tkTYZeLaS0G4JVSaLlI1yCiQNgZtlb8hLvRINCCCAeJslqvhT8a0Z7+WrV7E
Bn6k3BWFfp7tQJwthqgecpz55ycs9qM8yvPrBGtf+mrkg+hmg8YHjMBOjohxR0Gr
CBXudccTPqrJwo9Au1afnBcCgYBDCjs98aL0lAhGDotqYlReFZYH4vPSfM7iBl6+
68oFoXMMdYhlp3o8BikRGbGQhevazf01xTFS3fvBpSQ/obvLDyU/Zd6YZm55FYdH
hghm3S0zRu6txs8rCq0dt6i52JsheVpOxLtrL4w4pVGR2G3QYFQvV/zpgAU4cLgj
RDcaAQKBgFy6NtTiHU+10MhFAR09+YlsLV/aL4Olq6NH+4DRa7Vujg4uWJWGxQJZ
rONL8LMQi4vc48DutzFI5FfDZgmUwLG6ylSBe5IOhsJfHBZ9KFfJmGVxPCD/Ohic
d6w6uxF05Djal9XOXtTc4AIQoPeofaOqUJ1j9yPaEZuhUfEw2s8g
-----END RSA PRIVATE KEY-----"

heroku config:set WEBHOOK_SECRET=your_webhook_secret_here
heroku config:set GH_TOKEN=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
heroku config:set GEMINI_API_KEY=AIzaSyAad7j529fLDYA9IiTabQIOQ5jVv-cdLuo
heroku config:set NODE_ENV=production

# 5. Deploy
git push heroku main
```

### 3. 🔵 Vercel

```bash
# 1. Instale o Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configure as variáveis no dashboard
# https://vercel.com/dashboard
```

## ⚙️ Configuração da GitHub App

### 1. Atualizar Webhook URL

Após o deploy, você terá uma URL como:

- Railway: `https://xcloud-bot-production.up.railway.app`
- Heroku: `https://xcloud-bot-pagecloud.herokuapp.com`
- Vercel: `https://xcloud-bot.vercel.app`

**Configure na GitHub App:**

1. Vá para `https://github.com/settings/apps/xcloud-bot`
2. Atualize **Webhook URL**: `https://sua-url.com/webhooks/github`
3. Salve as alterações

### 2. Instalar nos Repositórios

1. Acesse `https://github.com/apps/xcloud-bot`
2. Clique em **"Install"**
3. Selecione **"PageCloudv1"** (sua organização)
4. Escolha repositórios:
   - ✅ All repositories (recomendado)
   - Ou selecione específicos
5. Clique em **"Install"**

## 🧪 Teste da Instalação

### 1. Verificar Health Check

```bash
curl https://sua-url.com/health
```

**Resposta esperada:**

```json
{
  "status": "ok",
  "service": "xcloud-bot",
  "version": "1.0.0",
  "timestamp": "2024-12-30T...",
  "uptime": 123.45
}
```

### 2. Testar com Issue

1. **Crie uma issue** em qualquer repositório instalado
2. **Aguarde 10-30 segundos**
3. **Verifique se o bot comentou** automaticamente
4. **Verifique se labels foram adicionadas**

### 3. Testar com PR

1. **Abra um Pull Request**
2. **Aguarde a análise automática**
3. **Verifique comentário com estatísticas**
4. **Verifique labels de tamanho**

### 4. Testar Menção

1. **Comente em uma issue**: `@xcloud-bot olá!`
2. **Aguarde resposta do bot**

## 🔍 Troubleshooting

### Bot não responde?

1. **Verifique logs:**

   ```bash
   # Railway
   railway logs

   # Heroku
   heroku logs --tail
   ```

2. **Verifique webhook:**
   - GitHub App Settings > Advanced
   - Veja "Recent Deliveries"
   - Status deve ser 200

3. **Verifique variáveis:**

   ```bash
   # Railway
   railway variables

   # Heroku
   heroku config
   ```

### Erro de autenticação?

- ✅ Verifique `GH_APP_ID`
- ✅ Verifique `GH_PRIVATE_KEY` (com quebras de linha)
- ✅ Verifique `WEBHOOK_SECRET`

### Bot instalado mas não funciona?

1. **Verifique permissões** da GitHub App
2. **Re-instale** a app no repositório
3. **Verifique se webhook URL** está correto

## 📊 Monitoramento

### Logs em Produção

```bash
# Railway
railway logs --follow

# Heroku
heroku logs --tail --app xcloud-bot-pagecloud
```

### Métricas

- **Health**: `GET /health`
- **Info**: `GET /info`
- **Stats**: `GET /stats`

## 🎉 Pronto!

Seu **xcloud-bot** está agora funcionando como o Copilot! 🤖

### O que acontece agora:

✅ **Issues** - Análise automática e labels  
✅ **PRs** - Análise de tamanho e qualidade  
✅ **Menções** - Resposta inteligente  
✅ **Automação** - Labels e comentários

### Próximos passos:

1. **Monitore** os primeiros dias
2. **Ajuste** prompts se necessário
3. **Adicione** mais funcionalidades
4. **Compartilhe** com a equipe

---

**🚀 Seu bot está live e funcionando!**

_Qualquer dúvida, mencione `@xcloud-bot` em uma issue!_
