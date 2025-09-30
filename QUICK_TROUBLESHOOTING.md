# 🚨 Guia Rápido: Bot não está respondendo

## Comandos de Diagnóstico Rápido

```bash
# 1. Verifique a configuração
npm run validate:github-app

# 2. Se falhar, registre a GitHub App
npm run register:github-app

# 3. Inicie o bot
npm run bot:start
```

## Checklist de 5 Minutos

- [ ] **App registrada?** → Execute `npm run validate:github-app`
- [ ] **App instalada?** → Acesse https://github.com/apps/SEU-APP
- [ ] **Bot rodando?** → Execute `npm run bot:start`
- [ ] **Webhook configurado?** → Use ngrok para desenvolvimento local
- [ ] **Permissões corretas?** → Issues: Read & Write + Issue comment evento

## Problemas Comuns

### "Missing environment variables"

```bash
npm run register:github-app
# Siga o assistente
```

### "Bot não responde"

1. Verifique se app está instalada no repositório
2. Configure ngrok: `ngrok http 3000`
3. Atualize Webhook URL nas configurações da app
4. Teste com `@xcloud-bot help`

### "Webhook não chega"

- Verifique ngrok está rodando
- Webhook URL está correta?
- Bot está rodando?
- Veja "Recent Deliveries" na app

## Links Úteis

- 📖 [Guia Completo de Troubleshooting](./BOT_NOT_RESPONDING.md)
- 🚀 [Setup Completo](./GITHUB_APP_SETUP.md)
- 📋 [README](./README.md)

## Precisa de Ajuda?

Abra uma issue: https://github.com/PageCloudv1/xcloud-bot/issues
