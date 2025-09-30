# 🤖 Guia do Sistema Inteligente de Issues

## 🌟 Como Funciona

### Para Issues Normais (Automático)
Quando uma nova issue é criada, o sistema **automaticamente**:

1. **🔍 Pesquisa Duplicatas**
   ```
   Verifica issues existentes com palavras-chave similares
   Se encontrar → Comenta mencionando a issue original
   ```

2. **🏷️ Aplica Labels Inteligentes**
   ```
   Analisa conteúdo → bug/feature/enhancement/etc
   Avalia urgência → priority:high/medium/low
   Identifica categoria → api/ui/infrastructure/etc
   ```

3. **👥 Assignment Automático**
   ```
   Sempre: @xcloud-team
   Se crítico/segurança: @xcloud-team + @rootkit-original
   ```

4. **💬 Resposta Estruturada**
   ```markdown
   ## 🤖 Análise Automática - xCloud Team
   
   ### 📋 Classificação
   - Tipo: bug
   - Prioridade: high
   - Categoria: api
   
   ### 🔍 Status de Duplicatas  
   ✅ Não encontradas duplicatas
   
   ### 📝 Análise Técnica
   [Análise detalhada baseada no conteúdo]
   
   ### 🎯 Próximos Passos Recomendados
   1. Verificar logs do servidor
   2. Reproduzir o erro localmente
   3. Implementar correção na API
   
   ### 👥 Assignments
   - Team: @xcloud-team
   - Reviewer: @rootkit-original (ou qualquer membro autorizado)
   ```

### Para Revisões Manuais (Qualquer Usuário)

#### Comandos Especiais via Comentário:
```bash
# Revisar issue manualmente
/review

# Escalar prioridade  
/escalate

# Fechar issue com explicação
/close motivo aqui

# Reassignar para outro usuário
/reassign @usuario
```

#### Via Workflow Dispatch:
1. Acesse Actions → Manual Review
2. Selecione ação: review/escalate/close/reassign  
3. Digite número da issue
4. Execute

## 🎯 Exemplos de Uso

### Exemplo 1: Issue de Bug
**Input**: "A API /users/profile está retornando erro 500"

**Output Automático**:
- Labels: `bug`, `priority:high`, `category:api`
- Assignment: `@xcloud-team`, `@rootkit-original`
- Comentário com análise técnica
- Verificação de duplicatas

### Exemplo 2: Feature Request  
**Input**: "Gostaria de um dark mode no painel"

**Output Automático**:
- Labels: `feature`, `priority:medium`, `category:ui`
- Assignment: `@xcloud-team`
- Comentário com próximos passos
- Pesquisa por requests similares

### Exemplo 3: Revisão Manual
**Cenário**: Issue crítica de segurança precisa atenção especial

**Usuário comenta**: "/escalate - possível vulnerabilidade SQL injection"

**Sistema responde**:
- Adiciona `priority:critical`
- Notifica @xcloud-team
- Cria resumo executivo
- Documenta a escalação

## 🔧 Configuração Necessária

### Secrets Obrigatórios:
```bash
GEMINI_API_KEY=sua_chave_gemini
GH_PRIVATE_KEY=chave_privada_github_app  
```

### Variables Obrigatórias:
```bash  
GH_APP_ID=id_da_sua_github_app
```

### GitHub App Permissions:
- Issues: Read & Write
- Contents: Read
- Metadata: Read

## 🚀 Ativação

1. **Configure secrets** no repository
2. **Crie uma issue de teste**
3. **Observe o bot em ação** 
4. **Use comandos manuais** quando necessário

## 📊 Benefícios

- ✅ **Zero trabalho manual** para triagem básica
- ✅ **Consistência** na aplicação de labels
- ✅ **Detecção automática** de duplicatas
- ✅ **Assignment inteligente** baseado em conteúdo
- ✅ **Controle manual** quando necessário
- ✅ **Histórico completo** de decisões
- ✅ **Integração nativa** com GitHub

---
🤖 *Sistema desenvolvido pela xcloud-team para otimização de workflow*