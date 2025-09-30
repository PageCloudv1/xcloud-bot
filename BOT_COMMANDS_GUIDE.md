# 🤖 xCloud Bot - Guia de Comandos

Este guia explica como interagir com o xCloud Bot através de comandos em issues e pull requests.

## ⚡ Feedback Instantâneo

Quando você envia um comando para o bot, ele **imediatamente** responde com uma mensagem de "processamento" para confirmar que recebeu sua solicitação:

> ⏳ Processando seu comando, @usuario... Por favor, aguarde.

Esta mensagem será atualizada automaticamente com a resposta completa assim que o processamento for concluído.

## 📋 Comandos Disponíveis

### 1. Help Command (Comando de Ajuda)

Mostra a mensagem de ajuda com todos os comandos disponíveis.

**Uso:**
```
@xcloud-bot help
@xcloud-bot ajuda
```

**Exemplo:**
> @xcloud-bot help

**Resposta:**
O bot responderá com uma mensagem explicando todos os comandos disponíveis, suas funcionalidades e status.

---

### 2. Analyze Command (Comando de Análise)

Re-analisa a issue ou PR atual e fornece insights atualizados.

**Uso:**
```
@xcloud-bot analyze
@xcloud-bot analisa
```

**Exemplo:**
> @xcloud-bot analyze

**Resposta:**
O bot analisará a issue/PR e fornecerá:
- Tipo de problema/mudança
- Prioridade sugerida
- Complexidade estimada
- Labels recomendadas
- Resumo contextual

---

### 3. Menção Genérica

Mencione o bot sem um comando específico para obter uma resposta contextual inteligente.

**Uso:**
```
@xcloud-bot [sua pergunta ou comentário]
```

**Exemplo:**
> @xcloud-bot o que você acha desta solução?

**Resposta:**
O bot usará IA para fornecer uma resposta contextual baseada na sua pergunta e no contexto da issue/PR.

---

## 🌍 Suporte a Idiomas

O bot suporta comandos em **Português** e **Inglês**:

| Inglês | Português |
|--------|-----------|
| `help` | `ajuda` |
| `analyze` | `analisa` |

## 💡 Dicas de Uso

### ✅ Boas Práticas

1. **Seja específico**: Use comandos claros como `@xcloud-bot help` ou `@xcloud-bot analyze`
2. **Contexto importa**: Para perguntas genéricas, forneça contexto suficiente
3. **Case-insensitive**: Comandos funcionam em maiúsculas ou minúsculas
4. **Flexível**: Pode incluir o comando em uma frase (ex: "Can you help me @xcloud-bot?")

### ❌ Evite

1. Mencionar o bot várias vezes seguidas (aguarde a resposta)
2. Usar comandos inexistentes
3. Esperar respostas instantâneas em momentos de alta carga

## 📊 Exemplos de Uso

### Exemplo 1: Solicitando Ajuda
```markdown
@xcloud-bot help

Gostaria de saber quais comandos estão disponíveis.
```

**Resposta do Bot:**
```
Olá @usuario! 👋

Sou o **xCloud Bot** e estou aqui para ajudar!

**Comandos disponíveis:**
- `@xcloud-bot help` - Mostra esta mensagem de ajuda
- `@xcloud-bot analyze` - Re-analisa a issue/PR atual
...
```

### Exemplo 2: Re-analisando uma Issue
```markdown
Atualizei a descrição da issue com mais detalhes.

@xcloud-bot analyze
```

**Resposta do Bot:**
```
🔍 **Análise Re-executada** - @usuario

📊 **Resultado da análise:**
- **Tipo:** bug
- **Prioridade:** high
- **Complexidade:** medium
- **Labels sugeridas:** bug, priority-high, backend
...
```

### Exemplo 3: Pergunta Genérica
```markdown
@xcloud-bot qual a melhor abordagem para resolver este problema?
```

**Resposta do Bot:**
```
@usuario Olá! Analisando o contexto desta issue...

[Resposta contextual gerada por IA]
```

## 🔧 Quando o Bot Não Responde

Se o bot não responder à sua menção:

1. **Verifique se o bot está ativo**: Veja o status nos logs do repositório
2. **Aguarde alguns minutos**: O bot pode estar processando outras solicitações
3. **Tente novamente**: Mencione o bot novamente após alguns minutos
4. **Consulte o guia de troubleshooting**: [BOT_NOT_RESPONDING.md](./BOT_NOT_RESPONDING.md)

## 🚀 Recursos Automáticos

Além dos comandos manuais, o bot também:

- ✅ **Analisa automaticamente** issues e PRs quando criados
- 🏷️ **Adiciona labels** relevantes baseado no conteúdo
- 📊 **Fornece estatísticas** sobre PRs (tamanho, complexidade, etc.)
- 🎉 **Celebra merges** e fechamentos de issues

## 📚 Documentação Adicional

- [README.md](./README.md) - Visão geral do bot
- [BOT_NOT_RESPONDING.md](./BOT_NOT_RESPONDING.md) - Troubleshooting
- [GITHUB_BOT_SETUP_GUIDE.md](./GITHUB_BOT_SETUP_GUIDE.md) - Configuração
- [QUICK_START.md](./QUICK_START.md) - Início rápido

## 🤝 Feedback e Suporte

Encontrou um problema ou tem uma sugestão?
- Abra uma issue no repositório
- Mencione `@xcloud-bot` para testar a funcionalidade
- Consulte a documentação de troubleshooting

---

*Última atualização: 2024*
*xCloud Bot - Automatizando seu workflow no GitHub* 🚀
