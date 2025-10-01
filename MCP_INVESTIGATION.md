# 🔍 Análise do Problema: MCP GitHub Server no GitHub Actions

## 📊 Status Atual

- **Workflow**: `gemini-pr-review.yml`
- **Ferramenta MCP**: `ghcr.io/github/github-mcp-server` (via Docker)
- **Problema**: Ferramentas MCP do GitHub não são executadas durante o review

## 🐛 Causa Raiz Identificada

### Docker não disponível por padrão em GitHub Actions

O workflow tenta executar o MCP server via Docker:

```yaml
"mcpServers": {
  "github": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"]
  }
}
```

**Problema**: GitHub Actions runners Ubuntu **NÃO** têm o Docker daemon rodando por padrão durante a execução do `google-github-actions/run-gemini-cli`.

### Evidências

1. ✅ O workflow executa com sucesso (sem erros fatais)
2. ❌ As ferramentas `mcp__github__*` não aparecem nos logs
3. ❌ O Gemini AI não consegue usar as ferramentas para postar comentários
4. ✅ O Gemini gera análise, mas não a envia para o GitHub via MCP

## 🔧 Soluções Possíveis

### Opção 1: Setup Docker Daemon (Mais Complexo)

**Prós**: Mantém uso do MCP server oficial
**Contras**: Requer setup adicional, overhead de tempo

```yaml
steps:
  - name: Set up Docker Buildx
    uses: docker/setup-buildx-action@v3
    
  - name: Start Docker daemon
    run: |
      sudo systemctl start docker
      sudo usermod -aG docker $USER
```

**Problema**: Pode não funcionar no contexto do `run-gemini-cli` action.

### Opção 2: MCP Server Nativo via NPX (Recomendado) ✅

**Prós**: Não requer Docker, mais rápido, mais confiável
**Contras**: Precisa reconfigurar o workflow

```yaml
"mcpServers": {
  "github": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-github"
    ],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

### Opção 3: GitHub API Direta (Solução Atual Alternativa)

**Prós**: Já funciona, sem dependências do MCP
**Contras**: Menos features do MCP, mais código manual

O workflow já tem fallback para GitHub API via `actions/github-script`:

```yaml
- name: Post review comment
  uses: actions/github-script@v7
  with:
    github-token: ${{ steps.generate_token.outputs.token }}
    script: |
      await github.rest.pulls.createReview({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.payload.pull_request.number,
        event: 'COMMENT',
        body: process.env.GEMINI_OUTPUT
      });
```

## ✅ Recomendação Final

**Implementar Opção 2: MCP Server via NPX**

### Passo a passo:

1. Substituir `"command": "docker"` por `"command": "npx"`
2. Ajustar args para usar o pacote NPM oficial do MCP
3. Testar em um PR novo
4. Documentar a mudança

### Benefícios:

- ✅ Sem dependência de Docker
- ✅ Instalação automática via NPX
- ✅ Mesmas funcionalidades do MCP
- ✅ Mais rápido e confiável no CI/CD
- ✅ Compatível com GitHub Actions padrão

## 📝 Documentação Relacionada

- [MCP GitHub Server](https://github.com/modelcontextprotocol/server-github)
- [NPM Package](https://www.npmjs.com/package/@modelcontextprotocol/server-github)
- [GitHub Actions Runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)
- [Docker in GitHub Actions](https://docs.github.com/en/actions/using-containerized-services/about-service-containers)

## 🎯 Próximos Passos

1. [ ] Atualizar `gemini-pr-review.yml` com configuração NPX
2. [ ] Testar em PR de desenvolvimento
3. [ ] Verificar logs para confirmar que ferramentas MCP são carregadas
4. [ ] Validar que comentários são postados automaticamente
5. [ ] Documentar mudança no README

---

**Data da Análise**: 01/10/2025
**Status**: Causa raiz identificada, solução proposta
**Prioridade**: Média (workflow funciona parcialmente com fallback da API)
