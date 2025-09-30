# 🔌 Configuração do MCP GitHub Server

## 📋 O que é o MCP GitHub Server?

O **Model Context Protocol (MCP) GitHub Server** permite que LLMs (como Gemini) interajam diretamente com a API do GitHub para:
- 📝 Criar e gerenciar issues
- 💬 Adicionar comentários
- 🏷️ Aplicar labels
- 👥 Atribuir issues
- 🔍 Buscar informações de repositórios
- E muito mais!

---

## 🚀 Métodos de Instalação

### Método 1: Via Docker (Recomendado)

#### Pré-requisitos
- Docker instalado: https://www.docker.com/products/docker-desktop

#### Instalação do Docker no Windows
```powershell
# Via winget
winget install Docker.DockerDesktop

# Após instalar, reinicie o computador e inicie o Docker Desktop
```

#### Uso do MCP GitHub Server
```powershell
# Definir o token do GitHub
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "seu_token_aqui"

# Executar o servidor
docker run -i --rm `
  -e GITHUB_PERSONAL_ACCESS_TOKEN `
  ghcr.io/github/github-mcp-server
```

### Método 2: Via npx (Mais simples, sem Docker)

```powershell
# Instalar globalmente
npm install -g @modelcontextprotocol/server-github

# Ou usar diretamente com npx
npx -y @modelcontextprotocol/server-github
```

---

## ⚙️ Configuração no xCloud Bot

### 1. Configurar Variáveis de Ambiente

Adicione ao seu `.env`:

```bash
# GitHub Personal Access Token para MCP
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_seu_token_aqui

# Ou use o token do GitHub App (preferencial)
GH_TOKEN=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
```

### 2. Configurar nos Workflows do GitHub Actions

O MCP já está configurado nos workflows! Veja em `.github/workflows/issue-management.yml`:

```yaml
- name: '🤖 Processar Issue com Gemini + GitHub MCP'
  uses: 'google-github-actions/run-gemini-cli@v0'
  env:
    GH_TOKEN: '${{ steps.mint_token.outputs.token || github.token }}'
  with:
    gemini_api_key: '${{ secrets.GEMINI_API_KEY }}'
    gemini_model: 'gemini-2.5-flash'
    settings: |-
      {
        "maxSessionTurns": 10,
        "mcpServers": {
          "github": {
            "command": "docker",
            "args": [
              "run",
              "-i",
              "--rm",
              "-e",
              "GITHUB_PERSONAL_ACCESS_TOKEN",
              "ghcr.io/github/github-mcp-server"
            ],
            "includeTools": [
              "add_issue_comment",
              "get_issue",
              "update_issue",
              "list_issues",
              "get_issue_comments"
            ],
            "env": {
              "GITHUB_PERSONAL_ACCESS_TOKEN": "${GH_TOKEN}"
            }
          }
        }
      }
```

---

## 🧪 Testar o MCP Server Localmente

### Teste 1: Verificar se o Docker está funcionando

```powershell
docker --version
# Deve mostrar: Docker version XX.X.X
```

### Teste 2: Executar o MCP Server

```powershell
# Definir token
$env:GITHUB_PERSONAL_ACCESS_TOKEN = $env:GH_TOKEN

# Executar servidor
docker run -i --rm `
  -e GITHUB_PERSONAL_ACCESS_TOKEN `
  ghcr.io/github/github-mcp-server
```

O servidor vai iniciar e esperar por comandos via stdio.

### Teste 3: Testar com Gemini CLI

Crie um arquivo `test-mcp.json`:

```json
{
  "maxSessionTurns": 1,
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

Execute:

```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN = $env:GH_TOKEN
$env:GEMINI_API_KEY = "AIzaSyAad7j529fLDYA9IiTabQIOQ5jVv-cdLuo"

gemini --settings test-mcp.json "Liste as issues abertas do repositório PageCloudv1/xcloud-bot"
```

---

## 🔧 Configuração Avançada

### Ferramentas Disponíveis no MCP GitHub

```javascript
// Ferramentas configuradas no xCloud Bot
const mcpTools = [
  "add_issue_comment",      // Adicionar comentários
  "create_issue",           // Criar issues
  "get_issue",              // Obter detalhes de issue
  "update_issue",           // Atualizar issue (labels, assignees, estado)
  "list_issues",            // Listar issues
  "get_issue_comments",     // Obter comentários
  "create_pull_request",    // Criar PR
  "get_pull_request",       // Obter detalhes de PR
  "list_pull_requests",     // Listar PRs
  "fork_repository",        // Fork de repositório
  "create_repository",      // Criar repositório
  "get_file_contents",      // Ler arquivos
  "push_files",             // Enviar arquivos
  "create_branch",          // Criar branch
  "create_or_update_file",  // Criar/atualizar arquivo
  "search_repositories",    // Buscar repositórios
  "search_code",            // Buscar código
  "search_issues"           // Buscar issues
];
```

### Configurar Permissões do Token

O token precisa dos seguintes escopos:

```
✅ repo (acesso completo a repositórios)
✅ workflow (gerenciar workflows)
✅ read:org (ler dados da organização)
✅ admin:repo_hook (gerenciar webhooks)
```

Gere um novo token em: https://github.com/settings/tokens/new

---

## 🐛 Troubleshooting

### Erro: "docker: command not found"

**Solução:**
```powershell
# Instale o Docker Desktop
winget install Docker.DockerDesktop

# Reinicie o computador
# Inicie o Docker Desktop
```

### Erro: "GITHUB_PERSONAL_ACCESS_TOKEN not set"

**Solução:**
```powershell
# Defina a variável de ambiente
$env:GITHUB_PERSONAL_ACCESS_TOKEN = $env:GH_TOKEN

# Ou adicione no .env
echo "GITHUB_PERSONAL_ACCESS_TOKEN=$env:GH_TOKEN" >> .env
```

### Erro: "Cannot connect to the Docker daemon"

**Solução:**
1. Abra o Docker Desktop
2. Aguarde até que o Docker esteja totalmente iniciado
3. Tente novamente

### MCP Server não responde

**Solução:**
```powershell
# Verifique se o servidor está rodando
docker ps

# Verifique os logs
docker logs <container_id>

# Reinicie o servidor
docker restart <container_id>
```

---

## 📊 Monitoramento

### Ver logs do MCP Server

```powershell
# Em tempo real
docker logs -f <container_id>

# Últimas 100 linhas
docker logs --tail 100 <container_id>
```

### Verificar uso de recursos

```powershell
docker stats
```

---

## 🎯 Próximos Passos

1. ✅ Instale o Docker Desktop
2. ✅ Configure o `GITHUB_PERSONAL_ACCESS_TOKEN`
3. ✅ Teste o MCP Server localmente
4. ✅ Valide a integração nos workflows
5. ✅ Crie uma issue de teste para ver o MCP em ação!

---

## 📚 Recursos

- 📖 [MCP GitHub Server Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- 📖 [Gemini CLI Documentation](https://github.com/google-gemini/gemini-cli)
- 📖 [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- 📖 [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

**Status atual:** ✅ MCP já está configurado nos workflows do xCloud Bot!
**Próximo teste:** Crie uma issue no GitHub e veja o Gemini + MCP trabalhando juntos!
