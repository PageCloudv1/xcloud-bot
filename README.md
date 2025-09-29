<div align="center">

# xCloud Bot

🤖 **Assistant inteligente para orquestração e gerenciamento da plataforma xCloud** - Simplifique DevOps, acesse documentação e monitore serviços através de conversação natural.

[![CI/CD Pipeline](https://github.com/PageCloudv1/xcloud-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/PageCloudv1/xcloud-bot/actions/workflows/ci.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-84%25-brightgreen.svg)](https://github.com/PageCloudv1/xcloud-bot)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

---

O **xCloud Bot** é a interface de conversação inteligente da **xCloud Platform**. Ele não é apenas um chatbot; é um engenheiro DevOps Sênior disponível 24/7, pronto para automatizar, monitorar e gerenciar todo o ecossistema xCloud através de comandos em linguagem natural.

## 🎯 A Vantagem xCloud

O xCloud Bot foi projetado para ser o ponto central de interação com a plataforma. Ele possui conhecimento profundo sobre a arquitetura, os serviços e os workflows da xCloud, oferecendo uma experiência de gerenciamento unificada e inteligente que acelera o desenvolvimento e simplifica a operação.

## ✨ Funcionalidades Essenciais

- **🤖 Orquestração de DevOps**: Faça deploys, verifique o status de pipelines de CI/CD, analise logs e gerencie seus containers com simples comandos de chat.
- **🔎 Conhecimento Profundo da Plataforma**: Pergunte sobre a arquitetura, encontre documentação técnica e obtenha respostas instantâneas sobre qualquer componente do ecossistema xCloud.
- **🔌 Ecossistema de Plugins Conectado**: Integra-se nativamente com o `xcloud-cli`, a `xcloud-platform` e o `xcloud-dashboard` para executar ações reais e fornecer dados em tempo real.
- **📊 Monitoramento Inteligente**: Receba resumos e alertas sobre a saúde dos seus serviços, o status de builds e a atividade da plataforma diretamente na interface do chat.
- **🚀 Acelere o Desenvolvimento**: Reduza a curva de aprendizado para novos desenvolvedores e elimine o tempo gasto em tarefas repetitivas. Deixe o bot cuidar da operação enquanto sua equipe foca no código.

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Instalação

```bash
# Clone o repositório
git clone https://github.com/PageCloudv1/xcloud-bot.git
cd xcloud-bot

# Instale as dependências
npm install

# Execute os testes
npm test

# Execute o build
npm run build

# Execute o linting
npm run lint
```

### Executando o Bot

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

---

## 🧪 Testes e Qualidade

O projeto possui uma suite abrangente de testes com alta cobertura:

### Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar testes por tipo
npm run test:unit          # Testes unitários
npm run test:integration   # Testes de integração
npm run test:e2e          # Testes end-to-end

# Executar com cobertura
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

### Comandos de Qualidade

```bash
# Verificar linting
npm run lint

# Corrigir problemas de linting
npm run lint:fix

# Verificar formatação
npm run format:check

# Aplicar formatação
npm run format

# Validação completa
npm run validate
```

### Estatísticas de Qualidade

- **📊 Cobertura de Código**: 84.25%
- **🧪 Total de Testes**: 41 (33 unit, 4 integration, 4 e2e)
- **🔍 Linting**: ESLint + Prettier
- **🏗️ Build**: TypeScript
- **🛡️ Segurança**: npm audit (0 vulnerabilidades)

---

## 🏗️ Arquitetura

```
src/
├── core/              # Funcionalidade principal do bot
│   └── XCloudBot.ts   # Classe principal do bot
├── services/          # Serviços externos e integrações
│   └── DevOpsService.ts # Orquestração de CI/CD
└── utils/             # Utilitários e helpers
    ├── Logger.ts      # Sistema de logging
    └── ConfigManager.ts # Gerenciamento de configuração

test/
├── unit/              # Testes unitários
├── integration/       # Testes de integração
└── e2e/              # Testes end-to-end
```

---

## 🎯 Ecossistema xCloud Platform

A xCloud Platform é composta por um conjunto de repositórios projetados para trabalhar em conjunto, fornecendo uma experiência de desenvolvimento completa e integrada.

| Repositório | Descrição |
|---|---|
| **[xcloud-platform](https://github.com/PageCloudv1/xcloud-platform)** | Core da plataforma, orquestrando build, deploy e gerenciamento. |
| **[xcloud-cli](https://github.com/PageCloudv1/xcloud-cli)** | Interface de linha de comando em Go para interagir com a plataforma. |
| **[xcloud-dashboard](https://github.com/PageCloudv1/xcloud-dashboard)** | Interface web em React para gerenciamento de projetos e analytics. |
| **[xcloud-runtime](https://github.com/PageCloudv1/xcloud-runtime)** | Runtime serverless para funções em Python, Node.js e Go. |
| **[xcloud-docs](https://github.com/PageCloudv1/xcloud-docs)** | Documentação completa da plataforma. |
| **[xcloud-templates](https://github.com/PageCloudv1/xcloud-templates)** | Templates de projetos prontos para uso. |
| **[xcloud-components](https://github.com/PageCloudv1/xcloud-components)** | Marketplace de componentes de UI e integrações. |
| **[xcloud-examples](https://github.com/PageCloudv1/xcloud-examples)** | Projetos de exemplo e demonstrações. |
| **[xcloud-bot](https://github.com/PageCloudv1/xcloud-bot)** | Assistente de IA para operações DevOps. |
| **[xcloud-containers](https://github.com/PageCloudv1/xcloud-containers)** | Configurações de contêineres Podman para o ambiente de desenvolvimento. |

---

## 💬 Exemplos de Uso

> **xcloud, faça o deploy da branch `feature/new-auth` do `xcloud-platform` em staging.**

> **Qual o status do último workflow de CI do `xcloud-cli`?**

> **Me mostre os logs de erro do `xcloud-dashboard` das últimas 3 horas.**

> **Como eu configuro um novo segredo no ambiente de produção?**

---

## 🤝 Como Contribuir

O xCloud Bot está em desenvolvimento ativo e sua contribuição é bem-vinda! Para saber como ajudar, leia nosso **[Guia de Contribuição](CONTRIBUTING.md)**.

### Fluxo de Desenvolvimento

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Execute os testes (`npm test`)
5. Push para a branch (`git push origin feature/nova-funcionalidade`)
6. Abra um Pull Request

---

<div align="center">

**[Documentação](https://docs.xcloud.dev) • [Issues](https://github.com/PageCloudv1/xcloud-bot/issues) • [Releases](https://github.com/PageCloudv1/xcloud-bot/releases)**

</div>

## 📝 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.