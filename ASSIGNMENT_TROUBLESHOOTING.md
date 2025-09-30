# 🔧 Troubleshooting: xCloud Bot não aparece para Assignment

Se o xCloud Bot não está aparecendo na lista de assignees ou reviewers no GitHub, siga este guia para resolver o problema.

## 🔍 Diagnóstico Rápido

Execute o script de diagnóstico:

```bash
npm run debug:assignment
```

Este script verificará:

- ✅ Configuração das variáveis de ambiente
- 🤖 Informações do bot (username, tipo)
- 🏢 Status da GitHub App
- 🔐 Permissões e eventos
- 🧪 Função de reconhecimento de assignments

## 🛠️ Soluções Comuns

### 1. GitHub App não instalada

**Problema**: A GitHub App não está instalada no repositório.

**Solução**:

1. Vá para Settings > Developer settings > GitHub Apps
2. Selecione sua app
3. Clique em "Install App"
4. Selecione o repositório ou organização

### 2. Permissões insuficientes

**Problema**: A GitHub App não tem permissões para issues.

**Solução**:

1. Vá para Settings > Developer settings > GitHub Apps
2. Selecione sua app
3. Em "Permissions", configure:
   - **Issues**: Read & Write
   - **Pull requests**: Read & Write
   - **Contents**: Read & Write

### 3. Eventos não configurados

**Problema**: A GitHub App não está subscrita aos eventos necessários.

**Solução**:

1. Na configuração da GitHub App
2. Em "Subscribe to events", habilite:
   - ✅ Issues
   - ✅ Pull request
   - ✅ Issue comment

### 4. Username incorreto

**Problema**: O bot está configurado com username incorreto.

**Solução**:

1. Execute `npm run debug:assignment` para ver o username real
2. Use o username exato mostrado (pode ser `xcloud-bot[bot]`)
3. Ou configure a variável `XBOT_USERNAME` com o username correto

### 5. CODEOWNERS não configurado

**Problema**: O arquivo CODEOWNERS não inclui o bot.

**Solução**: O arquivo `.github/CODEOWNERS` já foi criado com as configurações corretas.

## 🧪 Testando a Configuração

### Teste 1: Assignment Manual

1. Crie um issue de teste
2. Tente assignar o bot usando o username mostrado no diagnóstico
3. Verifique os logs do webhook

### Teste 2: Simulação via API

```bash
curl -X POST http://localhost:3000/api/agent/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "PageCloudv1/xcloud-bot",
    "issue_number": "1",
    "assignee": "xcloud-bot[bot]"
  }'
```

### Teste 3: Webhook Manual

```bash
npm run webhook:test
```

## 📋 Checklist de Verificação

- [ ] GitHub App instalada no repositório
- [ ] Permissões "Issues: Read & Write" habilitadas
- [ ] Evento "issues" subscrito
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook URL configurada corretamente
- [ ] Bot aparece na lista de assignees
- [ ] Assignment funciona corretamente

## 🆘 Ainda não funciona?

Se após seguir todos os passos o problema persistir:

1. **Verifique os logs**: `npm run server:logs`
2. **Teste o webhook**: Use o GitHub webhook delivery test
3. **Verifique a rede**: Certifique-se que o webhook URL é acessível
4. **Recrie a GitHub App**: Em último caso, crie uma nova GitHub App

## 📞 Suporte

Para mais ajuda:

1. Execute `npm run debug:assignment` e compartilhe a saída
2. Verifique os logs do servidor
3. Teste com um repositório simples primeiro

---

**💡 Dica**: O username do bot pode ser diferente do nome da app. GitHub Apps geralmente têm `[bot]` no final do username.
