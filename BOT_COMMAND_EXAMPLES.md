# 🤖 xCloud Bot - Command Response Examples

This document shows examples of how the bot responds to different commands.

## 📋 Example Interactions

### Example 1: Help Command

**User Comment:**
```
@xcloud-bot help
```

**Bot Response:**
```
Olá @usuario! 👋

Sou o **xCloud Bot** e estou aqui para ajudar!

**Comandos disponíveis:**
- `@xcloud-bot help` - Mostra esta mensagem de ajuda
- `@xcloud-bot analyze` - Re-analisa a issue/PR atual

**Sobre mim:**
- 🔍 Analiso automaticamente issues e PRs quando são criados
- 🏷️ Adiciono labels relevantes baseado no conteúdo
- 📊 Forneço estatísticas e métricas sobre mudanças
- 🤝 Respondo a menções e ajudo no desenvolvimento

**Status do webhook:** ✅ Funcionando!

---
*Resposta gerada pelo xCloud Bot* 🤖
```

---

### Example 2: Analyze Command

**User Comment:**
```
I've updated the issue description. @xcloud-bot analyze
```

**Bot Response:**
```
🔍 **Análise Re-executada** - @usuario

📊 **Resultado da análise:**
- **Tipo:** enhancement
- **Prioridade:** medium
- **Complexidade:** medium
- **Labels sugeridas:** enhancement, feature, priority-medium

📝 **Resumo:**
Esta issue propõe uma nova funcionalidade para o sistema de bot. 
A implementação parece ser de complexidade média e deve levar 
aproximadamente 3-5 dias para ser concluída.

---
*Análise gerada pelo xCloud Bot* 🤖
```

---

### Example 3: Portuguese Help Command

**User Comment:**
```
@xcloud-bot ajuda
```

**Bot Response:**
```
Olá @usuario! 👋

Sou o **xCloud Bot** e estou aqui para ajudar!

**Comandos disponíveis:**
- `@xcloud-bot help` - Mostra esta mensagem de ajuda
- `@xcloud-bot analyze` - Re-analisa a issue/PR atual

**Sobre mim:**
- 🔍 Analiso automaticamente issues e PRs quando são criados
- 🏷️ Adiciono labels relevantes baseado no conteúdo
- 📊 Forneço estatísticas e métricas sobre mudanças
- 🤝 Respondo a menções e ajudo no desenvolvimento

**Status do webhook:** ✅ Funcionando!

---
*Resposta gerada pelo xCloud Bot* 🤖
```

---

### Example 4: Generic Mention (No Specific Command)

**User Comment:**
```
@xcloud-bot what do you think about this approach?
```

**Bot Response:**
```
Olá @usuario! 👋

Você me mencionou, mas não reconheci um comando específico.

**Comandos disponíveis:**
- `@xcloud-bot help` - Mostra ajuda completa
- `@xcloud-bot analyze` - Re-analisa a issue/PR atual

Use um destes comandos para interagir comigo! 😊

---
*xCloud Bot* 🤖
```

---

### Example 5: Analyze Command with Error

**User Comment:**
```
@xcloud-bot analyze
```

**Bot Response (if analysis fails):**
```
❌ **Erro ao analisar** - @usuario

Desculpe, ocorreu um erro ao tentar re-analisar esta issue/PR. 
Por favor, tente novamente mais tarde.

---
*xCloud Bot* 🤖
```

---

### Example 6: Help in Sentence

**User Comment:**
```
Can you help me understand this issue, @xcloud-bot?
```

**Bot Response:**
```
Olá @usuario! 👋

Sou o **xCloud Bot** e estou aqui para ajudar!

**Comandos disponíveis:**
- `@xcloud-bot help` - Mostra esta mensagem de ajuda
- `@xcloud-bot analyze` - Re-analisa a issue/PR atual

**Sobre mim:**
- 🔍 Analiso automaticamente issues e PRs quando são criados
- 🏷️ Adiciono labels relevantes baseado no conteúdo
- 📊 Forneço estatísticas e métricas sobre mudanças
- 🤝 Respondo a menções e ajudo no desenvolvimento

**Status do webhook:** ✅ Funcionando!

---
*Resposta gerada pelo xCloud Bot* 🤖
```

---

### Example 7: Portuguese Analyze

**User Comment:**
```
@xcloud-bot analisa esta issue por favor
```

**Bot Response:**
```
🔍 **Análise Re-executada** - @usuario

📊 **Resultado da análise:**
- **Tipo:** bug
- **Prioridade:** high
- **Complexidade:** high
- **Labels sugeridas:** bug, priority-high, backend

📝 **Resumo:**
Esta issue relata um bug crítico no backend que afeta a funcionalidade
principal do sistema. Requer atenção imediata e deve ser priorizada.

---
*Análise gerada pelo xCloud Bot* 🤖
```

---

## 🎯 Key Features Demonstrated

1. **Case-Insensitive**: Commands work in any case (HELP, help, Help)
2. **Language Support**: Works in English and Portuguese
3. **Flexible Placement**: Commands can be anywhere in the comment
4. **Error Handling**: Graceful error messages when analysis fails
5. **Fallback Response**: Clear guidance when command is not recognized

## 📚 More Information

- [BOT_COMMANDS_GUIDE.md](./BOT_COMMANDS_GUIDE.md) - Complete command guide
- [README.md](./README.md) - Bot overview and setup
- [BOT_NOT_RESPONDING.md](./BOT_NOT_RESPONDING.md) - Troubleshooting

---

*xCloud Bot - Making GitHub automation intelligent and friendly* 🤖✨
