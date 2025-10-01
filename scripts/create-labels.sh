#!/bin/bash
# Script para criar labels no repositório xcloud-bot
# Usage: ./scripts/create-labels.sh

set -e

REPO="PageCloudv1/xcloud-bot"
GH_TOKEN="${GH_TOKEN}"

if [ -z "$GH_TOKEN" ]; then
  echo "❌ Erro: GH_TOKEN não está definido!"
  echo "Execute: export GH_TOKEN=seu_token_aqui"
  exit 1
fi

echo "🏷️  Criando labels no repositório ${REPO}..."
echo ""

# Função para criar label
create_label() {
  local name=$1
  local color=$2
  local description=$3
  
  echo "📌 Criando label: ${name}"
  
  gh label create "$name" \
    --repo "$REPO" \
    --color "$color" \
    --description "$description" \
    --force 2>/dev/null || echo "   ⚠️  Label já existe, atualizando..."
}

# Labels de tipo (kind)
create_label "bug" "d73a4a" "🐛 Algo não está funcionando corretamente"
create_label "enhancement" "a2eeef" "✨ Nova funcionalidade ou melhoria"
create_label "documentation" "0075ca" "📚 Melhorias na documentação"
create_label "workflow" "c2e0c6" "🔄 Relacionado a workflows e automação"
create_label "ci-cd" "fef2c0" "🚀 Relacionado a CI/CD e deploys"

# Labels de prioridade
create_label "priority/high" "d93f0b" "🔥 Alta prioridade - resolver urgentemente"
create_label "priority/medium" "fbca04" "⚡ Prioridade média - resolver em breve"
create_label "priority/low" "0e8a16" "🌱 Baixa prioridade - pode esperar"

# Labels de estado
create_label "needs-triage" "ededed" "🔍 Precisa ser triado e categorizado"
create_label "good first issue" "7057ff" "👋 Bom para iniciantes começarem"

# Labels adicionais úteis
create_label "help wanted" "008672" "🤝 Ajuda da comunidade é bem-vinda"
create_label "wontfix" "ffffff" "⛔ Não será implementado"
create_label "duplicate" "cfd3d7" "📋 Issue duplicada"
create_label "invalid" "e4e669" "❌ Issue inválida ou mal formatada"
create_label "question" "d876e3" "❓ Pergunta ou pedido de esclarecimento"

echo ""
echo "✅ Labels criadas com sucesso!"
echo ""
echo "🔍 Para ver todas as labels:"
echo "   gh label list --repo ${REPO}"
