#!/bin/bash
# Script para deletar TODAS as labels do repositório xcloud-bot
# ⚠️ ATENÇÃO: Este script vai deletar TODAS as labels existentes!
# Usage: ./scripts/delete-all-labels.sh

set -e

REPO="PageCloudv1/xcloud-bot"
GH_TOKEN="${GH_TOKEN}"

if [ -z "$GH_TOKEN" ]; then
  echo "❌ Erro: GH_TOKEN não está definido!"
  echo "Execute: export GH_TOKEN=seu_token_aqui"
  exit 1
fi

echo "⚠️  ATENÇÃO: Este script vai deletar TODAS as labels do repositório!"
echo "Repositório: ${REPO}"
echo ""
echo "Pressione Ctrl+C para cancelar ou Enter para continuar..."
read -r

echo ""
echo "🗑️  Buscando labels existentes..."

# Obter lista de todas as labels
LABELS=$(gh label list --repo "${REPO}" --json name --jq '.[].name')

if [ -z "$LABELS" ]; then
  echo "✅ Nenhuma label encontrada no repositório."
  exit 0
fi

LABEL_COUNT=$(echo "$LABELS" | wc -l)
echo "📋 Encontradas ${LABEL_COUNT} labels"
echo ""

# Deletar cada label
DELETED_COUNT=0
FAILED_COUNT=0

while IFS= read -r label; do
  echo "🗑️  Deletando: ${label}"
  
  if gh label delete "$label" --repo "${REPO}" --yes 2>/dev/null; then
    DELETED_COUNT=$((DELETED_COUNT + 1))
    echo "   ✅ Deletada com sucesso"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo "   ❌ Erro ao deletar"
  fi
done <<< "$LABELS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Labels deletadas: ${DELETED_COUNT}"
echo "❌ Falhas: ${FAILED_COUNT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Para verificar:"
echo "   gh label list --repo ${REPO}"
