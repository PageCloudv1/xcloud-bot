# Script para deletar TODAS as labels do repositório xcloud-bot
# ⚠️ ATENÇÃO: Este script vai deletar TODAS as labels existentes!
# Usage: .\scripts\delete-all-labels.ps1

$ErrorActionPreference = "Stop"

$REPO = "PageCloudv1/xcloud-bot"
$GH_TOKEN = $env:GH_TOKEN

if (-not $GH_TOKEN) {
    Write-Host "❌ Erro: GH_TOKEN não está definido!" -ForegroundColor Red
    Write-Host "Execute: `$env:GH_TOKEN = 'seu_token_aqui'"
    exit 1
}

Write-Host "⚠️  ATENÇÃO: Este script vai deletar TODAS as labels do repositório!" -ForegroundColor Yellow
Write-Host "Repositório: $REPO" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para cancelar ou Enter para continuar..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "🗑️  Buscando labels existentes..." -ForegroundColor Cyan

# Obter lista de todas as labels
$labels = gh label list --repo $REPO --json name --jq '.[].name'

if (-not $labels) {
    Write-Host "✅ Nenhuma label encontrada no repositório." -ForegroundColor Green
    exit 0
}

$labelCount = ($labels | Measure-Object).Count
Write-Host "📋 Encontradas $labelCount labels" -ForegroundColor Yellow
Write-Host ""

# Deletar cada label
$deletedCount = 0
$failedCount = 0

foreach ($label in $labels) {
    Write-Host "🗑️  Deletando: $label" -ForegroundColor Gray
    
    try {
        gh label delete $label --repo $REPO --yes 2>$null
        $deletedCount++
        Write-Host "   ✅ Deletada com sucesso" -ForegroundColor Green
    } catch {
        $failedCount++
        Write-Host "   ❌ Erro ao deletar: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Labels deletadas: $deletedCount" -ForegroundColor Green
Write-Host "❌ Falhas: $failedCount" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Para verificar:" -ForegroundColor Cyan
Write-Host "   gh label list --repo $REPO"
