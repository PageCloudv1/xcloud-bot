# 🛡️ Branch Protection Rules - xCloud Bot

## 📋 Configuração Atual

A branch `main` está protegida com as seguintes regras de segurança:

### ✅ Regras Ativas

| Regra | Status | Descrição |
|-------|--------|-----------|
| **Required Status Checks** | ✅ Ativo | CodeQL deve passar antes do merge |
| **Required Pull Request Reviews** | ✅ Ativo | 1 aprovação necessária |
| **Prevent Force Pushes** | ✅ Ativo | Força pushes são bloqueados |
| **Prevent Deletions** | ✅ Ativo | Branch não pode ser deletada |
| **Enforce for Admins** | ❌ Desativado | Admins podem bypassar (útil para emergências) |

### 🔍 Detalhes das Regras

#### 1. Required Status Checks
- **Check obrigatório**: `CodeQL`
- **Strict mode**: ✅ Sim (branch deve estar atualizada com base)
- **Propósito**: Garantir que nenhum código com vulnerabilidades seja merged

#### 2. Required Pull Request Reviews
- **Aprovações necessárias**: 1
- **Dismiss stale reviews**: ❌ Não (reviews antigas permanecem válidas)
- **Require code owner reviews**: ❌ Não
- **Require last push approval**: ❌ Não

#### 3. Force Push Protection
- Previne reescrita de histórico
- Mantém integridade do git log
- Protege contra perda acidental de commits

#### 4. Deletion Protection
- Previne deleção acidental da branch
- Garante continuidade do desenvolvimento

## 🔧 Como Gerenciar

### Via GitHub CLI

```bash
# Ver configuração atual
gh api /repos/PageCloudv1/xcloud-bot/branches/main/protection | jq

# Atualizar regras (usando arquivo JSON)
gh api -X PUT /repos/PageCloudv1/xcloud-bot/branches/main/protection \
  --input branch-protection.json
```

### Via Interface Web

1. Vá para **Settings** > **Branches**
2. Clique em **Edit** na regra de proteção da `main`
3. Ajuste as configurações conforme necessário
4. Clique em **Save changes**

### Via API REST

```bash
# Endpoint
PUT /repos/{owner}/{repo}/branches/{branch}/protection

# Exemplo com curl
curl -X PUT \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/PageCloudv1/xcloud-bot/branches/main/protection \
  -d @branch-protection.json
```

## 📄 Arquivo de Configuração

O arquivo `branch-protection.json` contém a configuração completa:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["CodeQL"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

## 🚨 Situações de Emergência

### Desabilitar Temporariamente

Em casos críticos onde você precisa fazer merge urgente sem aprovação:

```bash
# 1. Desabilitar proteção
gh api -X DELETE /repos/PageCloudv1/xcloud-bot/branches/main/protection

# 2. Fazer o merge necessário
git push origin main --force-with-lease  # Se necessário

# 3. IMPORTANTE: Reativar proteção
gh api -X PUT /repos/PageCloudv1/xcloud-bot/branches/main/protection \
  --input branch-protection.json
```

⚠️ **AVISO**: Sempre reative a proteção após emergências!

## 📊 Verificar Status de um PR

```bash
# Ver checks de um PR específico
gh pr checks 107

# Ver status detalhado
gh pr view 107 --json statusCheckRollup
```

## 🔄 Workflow de Desenvolvimento Recomendado

1. **Criar branch de feature**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Fazer commits e push**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   git push -u origin feature/nova-funcionalidade
   ```

3. **Criar Pull Request**
   ```bash
   gh pr create --title "✨ Nova Funcionalidade" --body "Descrição..."
   ```

4. **Aguardar CodeQL passar** (automático)

5. **Solicitar review**
   ```bash
   gh pr review 107 --request @reviewer-username
   ```

6. **Após aprovação, fazer merge**
   ```bash
   gh pr merge 107 --squash  # ou --merge, --rebase
   ```

## 🎯 Boas Práticas

### ✅ Faça
- ✅ Sempre trabalhe em branches separadas
- ✅ Aguarde o CodeQL passar antes de pedir review
- ✅ Escreva mensagens de commit descritivas
- ✅ Teste localmente antes de fazer push
- ✅ Mantenha PRs pequenos e focados

### ❌ Evite
- ❌ Commits diretos na `main`
- ❌ Force push sem motivo justificado
- ❌ PRs muito grandes (difícil revisar)
- ❌ Merge sem aprovação (bloqueado pela proteção)
- ❌ Ignorar falhas do CodeQL

## 🔗 Links Úteis

- [Documentação GitHub: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [GitHub CLI Manual](https://cli.github.com/manual/)

## 📝 Histórico de Mudanças

| Data | Mudança | Autor |
|------|---------|-------|
| 01/10/2025 | Configuração inicial com CodeQL e reviews obrigatórios | @rootkit-original |

---

**Última atualização**: 01/10/2025  
**Status**: Ativo e funcionando  
**Contato**: Abra uma issue para sugestões de melhorias
