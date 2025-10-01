# 🤖 xCloud Bot

Bot inteligente de automação GitHub para o ecossistema xCloud, com triage automático de issues usando Gemini AI.

[![GitHub App](https://img.shields.io/badge/GitHub-App-blue)](https://github.com/apps/xcloud-bot)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Funcionalidades

- 🤖 **Triage Automático de Issues** - Gemini AI classifica issues automaticamente
- 🏷️ **Sistema de Labels Inteligente** - 15 labels organizadas por tipo, prioridade e estado
- 📝 **Templates Padronizados** - 4 templates de issues (Bug, Feature, Docs, Workflow)
- ⚡ **Automação CI/CD** - Workflows para análise e gerenciamento de repositórios
- 🔍 **Análise de Código** - Integração com Gemini para revisão de código

---

## 🚀 Início Rápido

### Configuração em 3 Passos

```powershell
# 1. Criar labels
$env:GH_TOKEN = "seu_token_aqui"
.\scripts\create-labels.ps1

# 2. Configurar secret
gh secret set GEMINI_API_KEY --body "sua_api_key" --repo PageCloudv1/xcloud-bot

# 3. Testar
gh issue create --repo PageCloudv1/xcloud-bot --title "[TESTE] Bug" --body "Teste"
gh workflow run "gemini-scheduled-triage.yml" --repo PageCloudv1/xcloud-bot
```

**→ Guia completo:** [`docs/QUICK_START_TRIAGE.md`](docs/QUICK_START_TRIAGE.md)

---

## � Política de Auto-Refatoração

### Issues Criadas por rootkit-original

Quando **rootkit-original** cria uma issue, o sistema automaticamente:

1. **🔄 Auto-Atribuição**: A issue é automaticamente atribuída para rootkit-original
2. **🏷️ Labels Automáticas**: Adiciona labels `🤖 auto-refactored` e `👤 rootkit-original`
3. **💬 Confirmação**: Posta comentário confirmando as ações realizadas
4. **📋 Pronto para Desenvolvimento**: Issue fica pronta para trabalho imediato

### Como Funciona

- **Trigger**: Issues abertas (`issues: opened`)
- **Condição**: Apenas issues criadas por `rootkit-original`
- **Ações**: Auto-atribuição + labels + comentário de confirmação
- **Workflow**: `.github/workflows/auto-refactor-issues.yml`

### Exemplo de Funcionamento

```markdown
<!-- Issue criada por rootkit-original -->
✅ Auto-atribuída para @rootkit-original
🏷️ Labels: 🤖 auto-refactored, 👤 rootkit-original
💬 Comentário postado confirmando ações
```

**→ Próxima Fase**: Sistema de refatoração inteligente com Gemini AI será implementado em breve.

---

Toda a documentação está organizada no diretório [`docs/`](docs/):

### Guias Principais
- **[README.md](docs/README.md)** - Índice da documentação
- **[COMMANDS.md](docs/COMMANDS.md)** - Comandos prontos
- **[QUICK_START.md](docs/QUICK_START.md)** - Início rápido do bot
- **[SETUP_SUMMARY.md](docs/SETUP_SUMMARY.md)** - Resumo da configuração
- **[.github/GEMINI_TRIAGE_SETUP.md](.github/GEMINI_TRIAGE_SETUP.md)** - Guia detalhado

### Guias Técnicos
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Como contribuir
- **[TESTING.md](docs/TESTING.md)** - Testes
- **[WORKFLOWS.md](docs/WORKFLOWS.md)** - Workflows disponíveis
- **[TROUBLESHOOTING_SETUP.md](docs/TROUBLESHOOTING_SETUP.md)** - Solução de problemas

### Mais Documentação
→ Veja o índice completo em [`docs/DOC_INDEX.md`](docs/DOC_INDEX.md)

---

## 🏷️ Labels Disponíveis

O sistema cria automaticamente 15 labels organizadas:

| Tipo | Labels |
|------|--------|
| **Tipos** | `bug` 🐛, `enhancement` ✨, `documentation` 📚, `workflow` 🔄, `ci-cd` 🚀 |
| **Prioridades** | `priority/high` 🔥, `priority/medium` ⚡, `priority/low` 🌱 |
| **Estados** | `needs-triage` 🔍, `good first issue` 👋 |
| **Extras** | `help wanted`, `wontfix`, `duplicate`, `invalid`, `question` |

---

## ⚙️ Configuração

### Pré-requisitos

- Node.js 20+
- GitHub CLI (`gh`)
- Gemini API Key ([obter aqui](https://aistudio.google.com/app/apikey))

### Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `GEMINI_API_KEY` | Chave da API do Gemini AI |
| `GH_APP_ID` | ID do GitHub App (se usar) |
| `GH_PRIVATE_KEY` | Private key do GitHub App (se usar) |
| `WEBHOOK_SECRET` | Secret para webhooks |

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

---

## 🛠️ Scripts Disponíveis

### Gerenciamento de Labels
```powershell
# Criar labels
.\scripts\create-labels.ps1

# Deletar todas as labels
.\scripts\delete-all-labels.ps1
```

### Bot
```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Produção
npm start

# Testes
npm test
```

---

## 🤖 Workflows Disponíveis

| Workflow | Descrição | Frequência |
|----------|-----------|------------|
| **gemini-scheduled-triage** | Triage automático de issues | A cada hora |
| **gemini-dispatch** | Análise sob demanda | Manual |
| **gemini-triage** | Triage manual | Manual |

→ Detalhes em [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md)

---

## 📦 Estrutura do Projeto

```
xcloud-bot/
├── .github/
│   ├── workflows/          # GitHub Actions workflows
│   ├── ISSUE_TEMPLATE/     # Templates de issues
│   └── GEMINI_TRIAGE_SETUP.md
├── docs/                   # 📚 Documentação completa
│   ├── README.md           # Índice da documentação
│   ├── COMMANDS.md         # Comandos prontos
│   ├── QUICK_START.md      # Guia de início rápido
│   └── ...                 # +40 guias e documentos
├── scripts/                # Scripts utilitários
│   ├── create-labels.ps1   # Criar labels
│   └── delete-all-labels.ps1
├── src/                    # Código-fonte do bot
│   ├── bot/               # Lógica do bot
│   ├── tools/             # Ferramentas e utilitários
│   └── utils/             # Funções auxiliares
└── package.json
```

---

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

→ Leia [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) para mais detalhes

---

## 🐛 Reportar Problemas

Use nossos templates de issues:

- 🐛 [Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml)
- ✨ [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml)
- 📚 [Documentation](.github/ISSUE_TEMPLATE/documentation.yml)
- 🔄 [Workflow/CI/CD](.github/ISSUE_TEMPLATE/workflow.yml)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🔗 Links Úteis

- **Repositório:** [PageCloudv1/xcloud-bot](https://github.com/PageCloudv1/xcloud-bot)
- **Documentação:** [docs/](docs/)
- **Issues:** [Issues](https://github.com/PageCloudv1/xcloud-bot/issues)
- **Discussões:** [Discussions](https://github.com/PageCloudv1/xcloud-bot/discussions)

---

## 🌟 Apoie o Projeto

Se este projeto foi útil para você, considere:
- ⭐ Dar uma estrela no GitHub
- 🐛 Reportar bugs
- 💡 Sugerir melhorias
- 🤝 Contribuir com código

---

**Desenvolvido com ❤️ pela equipe xCloud**

**Última atualização:** Outubro 2025
