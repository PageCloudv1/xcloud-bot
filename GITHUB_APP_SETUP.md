# xCloud Bot - GitHub App Setup

## Como Registrar o Bot

1. Acesse: https://github.com/settings/apps/new
2. Preencha as informacoes basicas (nome, descricao, homepage)
3. Configure as permissoes necessarias
4. Crie a GitHub App
5. **IMPORTANTE**: Anote o **App ID** (numero) - NAO confunda com Client ID
6. Gere e baixe a Private Key (arquivo .pem)
7. Configure os secrets no repositorio

## ⚠️ ATENÇÃO: App ID vs Client ID

**MUITO IMPORTANTE**: Existem dois IDs diferentes na pagina da GitHub App:

- **App ID**: Um numero (ex: `123456`) ✅ **USE ESTE**
- **Client ID**: Comeca com "Iv" (ex: `Iv1.abc123def`) ❌ **NÃO USE ESTE**

Voce deve usar o **App ID** (numerico) na variavel `GITHUB_APP_ID`.

### Como encontrar o App ID correto:

1. Acesse a pagina da sua GitHub App
2. No menu lateral, clique em "General"
3. Role ate "About" - voce vera:
   - **App ID**: `123456` ← Use este valor
   - **Client ID**: `Iv1.xxxxx` ← Não use este

## Permissoes Necessarias

Repository permissions:
- Actions: write
- Checks: write
- Contents: write
- Issues: write
- Pull Requests: write
- Metadata: read (automatico)

## Configuracao dos Secrets

No seu repositorio, va em **Settings > Secrets and variables > Actions**:

```bash
GITHUB_APP_ID=123456              # Numero do App ID (NAO o Client ID)
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...conteudo completo do arquivo .pem...
-----END RSA PRIVATE KEY-----"
GITHUB_OWNER=seu-usuario-ou-org   # Seu usuario ou organizacao
```

## Proximos Passos

1. ✅ Registrar GitHub App
2. ✅ Anotar App ID correto (numerico)
3. ✅ Baixar Private Key (.pem)
4. ✅ Configurar secrets no repositorio
5. ✅ Instalar a app nos repositorios
6. ✅ Validar: `npm run validate:github-app`
7. ✅ Testar: `npm run bot:start`

## Solucao de Problemas

### Erro "Bad credentials"

Se voce receber este erro, provavelmente usou o **Client ID** em vez do **App ID**.

**Solucao**:
1. Acesse a pagina da sua GitHub App
2. Encontre o **App ID** (numero) na secao "About"
3. Atualize o valor de `GITHUB_APP_ID` no .env ou nos secrets
4. Use apenas o numero, sem aspas

### Como validar a configuracao

Execute o validador:
```bash
npm run validate:github-app
```

Se houver problemas, o validador ira indicar exatamente o que precisa ser corrigido.
