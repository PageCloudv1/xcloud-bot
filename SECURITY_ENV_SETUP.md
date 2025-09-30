# 🔐 Configuração de Ambiente - Segurança

## ⚠️ **IMPORTANTE**: Segurança de Secrets

O arquivo `.env` **NUNCA** deve ser commitado no repositório pois contém informações sensíveis como tokens, chaves privadas e senhas.

## 📋 Como Configurar

### 1. **Copie o arquivo de exemplo**

```bash
cp .env.example .env
```

### 2. **Edite o arquivo `.env` com seus dados reais**

```bash
# GitHub App Configuration
GH_APP_ID=123456789
GH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA... (sua chave privada real)
-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=seu_webhook_secret_real

# GitHub Token (for API operations)
GH_TOKEN=ghp_seu_token_real_aqui

# Outros configs...
```

### 3. **Verificar se está no .gitignore**

O arquivo `.env` deve estar listado no `.gitignore`:

```
.env
.env.local
.env.*.local
```

## 🚨 **Se Você Commitou Secrets por Acidente**

### GitHub Push Protection

Se você receber este erro:

```
remote: - GITHUB PUSH PROTECTION
remote: Push cannot contain secrets
```

**Solução:**

1. Remova o arquivo do git: `git rm --cached .env`
2. Faça commit da remoção: `git commit -m "Remove .env from repository"`
3. Push normalmente: `git push origin main`

### Revogar Tokens Comprometidos

Se tokens foram expostos:

1. **GitHub Personal Access Token**: Vá em Settings > Developer settings > Personal access tokens → Regenerate
2. **GitHub App Private Key**: Regenere uma nova chave na configuração da GitHub App
3. **Webhook Secret**: Configure um novo secret na GitHub App

## ✅ **Boas Práticas**

### Para Desenvolvimento Local

```bash
# Use o arquivo .env para desenvolvimento
GH_TOKEN=ghp_desenvolvimento_token
NODE_ENV=development
```

### Para Produção

- Use **GitHub Secrets** em Actions
- Use **Environment Variables** no servidor
- Use **Key Vaults** para dados sensíveis
- **NUNCA** coloque secrets em código

### Verificação de Segurança

```bash
# Verificar se .env não está sendo rastreado
git ls-files | grep "\.env$"
# (não deve retornar nada)

# Verificar se está no .gitignore
grep "\.env" .gitignore
```

## 🔍 **Arquivos Seguros para Commit**

✅ **PODE committar:**

- `.env.example` (sem dados reais)
- `.env.template`
- `docker-compose.yml` (com variáveis `${VAR}`)

❌ **NÃO committar:**

- `.env` (dados reais)
- `.env.local`
- `.env.production` (se tiver dados reais)

## 📚 **Recursos Adicionais**

- [GitHub Secret Scanning](https://docs.github.com/code-security/secret-scanning)
- [Push Protection](https://docs.github.com/code-security/secret-scanning/working-with-secret-scanning-and-push-protection)
- [Managing Secrets in Actions](https://docs.github.com/actions/security-guides/encrypted-secrets)

---

**⚡ Lembre-se: A segurança é responsabilidade de todos!**

_Nunca compartilhe tokens, chaves ou senhas reais no código ou repositório._
