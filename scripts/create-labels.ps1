# Script para criar labels no repositório xcloud-bot (PowerShell)
# Usage: .\scripts\create-labels.ps1

$ErrorActionPreference = "Stop"

$REPO = "PageCloudv1/xcloud-bot"
$GH_TOKEN = $env:GH_TOKEN

if (-not $GH_TOKEN) {
    Write-Host "❌ Erro: GH_TOKEN não está definido!" -ForegroundColor Red
    Write-Host "Execute: `$env:GH_TOKEN = 'seu_token_aqui'"
    exit 1
}

Write-Host "🏷️  Criando labels no repositório $REPO..." -ForegroundColor Cyan
Write-Host ""

# Função para criar label
function Create-Label {
    param (
        [string]$Name,
        [string]$Color,
        [string]$Description
    )
    
    Write-Host "📌 Criando label: $Name" -ForegroundColor Yellow
    
    try {
        gh label create $Name `
            --repo $REPO `
            --color $Color `
            --description $Description `
            --force 2>$null
    } catch {
        Write-Host "   ⚠️  Label já existe, atualizando..." -ForegroundColor Gray
    }
}

# Labels de tipo (kind)
Create-Label "bug" "d73a4a" "🐛 Algo não está funcionando corretamente"
Create-Label "enhancement" "a2eeef" "✨ Nova funcionalidade ou melhoria"
Create-Label "documentation" "0075ca" "📚 Melhorias na documentação"
Create-Label "workflow" "c2e0c6" "🔄 Relacionado a workflows e automação"
Create-Label "ci-cd" "fef2c0" "🚀 Relacionado a CI/CD e deploys"

# Labels de prioridade
Create-Label "priority/high" "d93f0b" "🔥 Alta prioridade - resolver urgentemente"
Create-Label "priority/medium" "fbca04" "⚡ Prioridade média - resolver em breve"
Create-Label "priority/low" "0e8a16" "🌱 Baixa prioridade - pode esperar"

# Labels de estado
Create-Label "needs-triage" "ededed" "🔍 Precisa ser triado e categorizado"
Create-Label "good first issue" "7057ff" "👋 Bom para iniciantes começarem"

# Labels adicionais úteis
Create-Label "help wanted" "008672" "🤝 Ajuda da comunidade é bem-vinda"
Create-Label "wontfix" "ffffff" "⛔ Não será implementado"
Create-Label "duplicate" "cfd3d7" "📋 Issue duplicada"
Create-Label "invalid" "e4e669" "❌ Issue inválida ou mal formatada"
Create-Label "question" "d876e3" "❓ Pergunta ou pedido de esclarecimento"

Write-Host ""
Write-Host "✅ Labels criadas com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Para ver todas as labels:" -ForegroundColor Cyan
Write-Host "   gh label list --repo $REPO"
