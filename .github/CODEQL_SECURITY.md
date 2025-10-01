# 🔒 CodeQL Security Analysis

## Visão Geral

O workflow `codeql-analysis.yml` implementa análise de segurança automatizada usando o **GitHub CodeQL** - o mecanismo de análise de código semântico do GitHub que identifica vulnerabilidades de segurança, bugs e anti-patterns.

## 🎯 Objetivos

1. **Detecção Proativa de Vulnerabilidades**: Identifica falhas de segurança antes que cheguem à produção
2. **Análise Contínua**: Executa em pushes, PRs e semanalmente
3. **Supply Chain Protection**: Usa Harden Runner para proteger contra ataques
4. **Segurança por Design**: Todas as ações são pinadas com SHA256 completo

## 🚀 Quando o Workflow Executa

| Trigger | Descrição | Frequência |
|---------|-----------|------------|
| `push` (main) | Análise de código ao fazer push para main | Cada commit |
| `pull_request` | Análise de PRs antes do merge | Cada PR |
| `schedule` | Verificação periódica de vulnerabilidades | Segunda-feira 00:00 UTC |
| `workflow_dispatch` | Execução manual sob demanda | Conforme necessário |

## 📊 O que é Analisado

### Linguagens Suportadas

- **JavaScript/TypeScript** (configurado atualmente)
- Python, Go, Java, C#, C++, Ruby (podem ser adicionados à matrix)

### Verificações de Segurança

1. **Injection Vulnerabilities**
   - SQL Injection
   - Command Injection
   - XSS (Cross-Site Scripting)
   - Path Traversal

2. **Authentication & Authorization**
   - Broken authentication
   - Missing authorization checks
   - Insecure session management

3. **Data Exposure**
   - Hardcoded secrets
   - Sensitive data exposure
   - Insecure data storage

4. **Code Quality**
   - Null pointer dereferences
   - Resource leaks
   - Dead code
   - Complexity issues

## 🛡️ Recursos de Segurança

### 1. Harden Runner

```yaml
- uses: 'step-security/harden-runner@...'
  with:
    egress-policy: 'audit'
    disable-telemetry: true
```

**Benefícios:**
- Monitora todo o tráfego de rede do runner
- Detecta acessos não autorizados
- Previne exfiltração de dados
- Protege contra supply chain attacks

### 2. Action Pinning

Todas as ações são pinadas com **SHA256 completo**:

```yaml
actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

**Por que isso importa:**
- ❌ `actions/checkout@v4` - Inseguro (tag pode ser alterada)
- ✅ `actions/checkout@11bd719...` - Seguro (SHA imutável)

### 3. Permissões Mínimas

```yaml
permissions:
  contents: 'read'        # Nível workspace
  
jobs:
  analyze:
    permissions:
      actions: 'read'     # Ler workflows
      contents: 'read'    # Ler código
      security-events: 'write'  # Escrever resultados
```

**Princípio do Menor Privilégio**: Cada job só tem as permissões necessárias.

## 📈 Interpretando Resultados

### Onde Ver os Resultados

1. **GitHub Security Tab**: `https://github.com/PageCloudv1/xcloud-bot/security/code-scanning`
2. **PR Checks**: Aparece como check no PR
3. **Step Summary**: Relatório no workflow run

### Níveis de Severidade

| Ícone | Severidade | Ação Recomendada |
|-------|-----------|------------------|
| 🔴 | **Critical** | Corrigir imediatamente (bloqueia merge) |
| 🟠 | **High** | Corrigir antes do merge |
| 🟡 | **Medium** | Revisar e planejar correção |
| 🟢 | **Low** | Considerar correção |
| ℹ️ | **Note** | Informativo, sem ação necessária |

## 🔧 Configuração Avançada

### Adicionar Mais Linguagens

Edite a matrix em `.github/workflows/codeql-analysis.yml`:

```yaml
strategy:
  matrix:
    language:
      - 'javascript-typescript'
      - 'python'
      - 'go'
```

### Queries Customizadas

Descomente e configure queries adicionais:

```yaml
- name: '🔧 Initialize CodeQL'
  uses: 'github/codeql-action/init@...'
  with:
    languages: '${{ matrix.language }}'
    queries: +security-extended,security-and-quality
```

**Queries Disponíveis:**
- `security-extended` - Verificações de segurança adicionais
- `security-and-quality` - Segurança + qualidade de código
- Custom queries - Arquivo `.github/codeql/custom-queries.ql`

### Ignorar Arquivos

Já configurado para ignorar:

```yaml
paths-ignore:
  - node_modules
  - dist
  - build
  - coverage
  - '**/*.test.js'
  - '**/*.spec.js'
```

## 🚨 Troubleshooting

### Workflow Falha com "Out of Memory"

**Solução**: Aumente o timeout ou divida a análise:

```yaml
jobs:
  analyze:
    timeout-minutes: 60  # Aumentar de 30 para 60
```

### Falsos Positivos

**Solução**: Adicione exceções no código:

```javascript
// codeql[js/sql-injection]
// Justificação: Input é sanitizado pela biblioteca X
const query = buildQuery(userInput);
```

### Action SHA Desatualizado

**Solução**: Use Dependabot para atualizar:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

## 📚 Recursos Adicionais

- **Documentação CodeQL**: https://codeql.github.com/docs/
- **Queries Disponíveis**: https://github.com/github/codeql/tree/main/javascript/ql/src/Security
- **Harden Runner**: https://github.com/step-security/harden-runner
- **Best Practices**: https://github.com/ossf/scorecard

## 🎓 Exemplo: Workflow Conforma

Este workflow foi inspirado no projeto **Conforma**:
- Repositório: https://github.com/conforma/policy
- Workflow: https://github.com/conforma/policy/blob/bba371ad8f0fff7eea2ce7a50539cde658645a56/.github/workflows/codeql.yml

**Melhorias implementadas sobre o original:**
- ✅ Relatório de segurança no Step Summary
- ✅ Configuração de paths-ignore
- ✅ Setup de Node.js otimizado com cache
- ✅ Documentação completa em português
- ✅ Emojis para melhor visualização

## ✅ Checklist de Implementação

Após implementar este workflow:

- [x] Workflow criado em `.github/workflows/codeql-analysis.yml`
- [ ] Primeira execução completa com sucesso
- [ ] Security tab configurado no repositório
- [ ] Branch protection rules atualizadas para exigir CodeQL
- [ ] Equipe notificada sobre novo processo de segurança
- [ ] Dependabot configurado para atualizar actions

---

**Mantido por**: xCloud DevOps Team  
**Última atualização**: 2025-10-01  
**Status**: ✅ Ativo
