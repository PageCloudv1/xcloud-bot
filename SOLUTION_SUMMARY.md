# Solução para: Bot não está lendo mensagens

## 📝 Resumo do Problema

Você mencionou `@xcloud-bot help` várias vezes mas o bot não respondeu. Analisamos o código e identificamos que **o bot precisa ser registrado como GitHub App e instalado no repositório**.

## ✅ Solução Rápida

Siga estes passos na ordem:

### 1. Registre a GitHub App

```bash
npm install
npm run register:github-app
```

O assistente interativo irá guiá-lo através do processo de registro.

### 2. Verifique a configuração

```bash
npm run validate:github-app
```

Se todos os checks passarem, prossiga. Se não, o script dirá exatamente o que está faltando.

### 3. Inicie o bot

```bash
npm run bot:start
```

Você deve ver:

```
🤖 xcloud-bot iniciado na porta 3000
📡 Webhooks disponíveis em: /webhooks/github
```

### 4. Configure webhooks (para desenvolvimento local)

```bash
# Instale ngrok: https://ngrok.com/download
ngrok http 3000
```

Copie a URL HTTPS (ex: `https://abc123.ngrok.io`) e:

1. Acesse as configurações da sua GitHub App
2. Edite "Webhook URL" para: `https://abc123.ngrok.io/webhooks/github`
3. Salve as alterações

### 5. Teste o bot

1. Crie uma issue de teste ou vá para uma issue existente
2. Adicione um comentário: `@xcloud-bot help`
3. Aguarde alguns segundos
4. O bot deve responder! 🎉

## 📚 Documentação Completa

Criamos documentação completa para ajudar você:

### Guias de Setup

- **[GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md)** - Guia completo passo a passo
- **[QUICK_START.md](./QUICK_START.md)** - Início rápido

### Troubleshooting

- **[QUICK_TROUBLESHOOTING.md](./QUICK_TROUBLESHOOTING.md)** - Checklist de 5 minutos
- **[BOT_NOT_RESPONDING.md](./BOT_NOT_RESPONDING.md)** - Diagnóstico completo com todos os cenários possíveis

### Verificação

- **[REGISTRATION_CHECKLIST.md](./REGISTRATION_CHECKLIST.md)** - Checklist completo de registro

## 🔍 Por que o bot não estava respondendo?

O código do bot está correto e funcional. O webhook handler para comentários está implementado e procura por menções ao `@xcloud-bot`.

**O problema é que:**

1. **GitHub App não está registrada** - Sem registro, o bot não tem credenciais para se autenticar
2. **App não está instalada** - Mesmo registrada, precisa ser instalada no repositório para receber webhooks
3. **Webhooks não estão configurados** - Para desenvolvimento local, precisa usar ngrok ou similar

## 🎯 Próximos Passos

Após seguir os passos acima:

1. ✅ Execute `npm run validate:github-app` para confirmar que tudo está ok
2. ✅ Inicie o bot com `npm run bot:start`
3. ✅ Teste mencionando `@xcloud-bot help` em uma issue
4. ✅ Verifique os logs no terminal do bot

## ❓ Dúvidas?

Se encontrar problemas:

1. Consulte [BOT_NOT_RESPONDING.md](./BOT_NOT_RESPONDING.md) para diagnóstico completo
2. Verifique "Recent Deliveries" nas configurações da app para ver se webhooks estão chegando
3. Abra uma issue com os logs e detalhes do problema

## 📞 Suporte

- **Issues**: https://github.com/PageCloudv1/xcloud-bot/issues
- **Documentação**: Todos os guias estão na raiz do repositório

---

**🎉 Boa sorte com o setup!** O bot tem recursos muito úteis como análise automática de issues, resposta a menções, sugestão de labels e muito mais. Depois de configurado, você terá um assistente poderoso!
