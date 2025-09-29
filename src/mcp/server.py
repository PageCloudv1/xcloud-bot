#!/usr/bin/env python3
"""
🤖 xCloud Bot - MCP Server

FastMCP server para integração com AI e ferramentas de automação
"""

from fastmcp import FastMCP
import asyncio
import json
import subprocess
import os
from typing import List, Dict, Optional
from datetime import datetime
import aiohttp

app = FastMCP("xcloud-bot")

# 🔧 Configuração
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_API_BASE = "https://api.github.com"

async def run_command(command: str) -> Dict:
    """Executa comando shell de forma assíncrona"""
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        return {
            "success": process.returncode == 0,
            "stdout": stdout.decode(),
            "stderr": stderr.decode(),
            "returncode": process.returncode
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

async def github_api_request(endpoint: str, method: str = "GET", data: Dict = None) -> Dict:
    """Faz requisições para a API do GitHub"""
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    async with aiohttp.ClientSession() as session:
        url = f"{GITHUB_API_BASE}{endpoint}"
        
        if method == "GET":
            async with session.get(url, headers=headers) as response:
                return await response.json()
        elif method == "POST":
            async with session.post(url, headers=headers, json=data) as response:
                return await response.json()
        elif method == "PATCH":
            async with session.patch(url, headers=headers, json=data) as response:
                return await response.json()

@app.tool()
async def analyze_repository(repo_url: str, analysis_type: str = "general") -> Dict:
    """
    Analisa um repositório GitHub e sugere melhorias
    
    Args:
        repo_url: URL do repositório (ex: PageCloudv1/xcloud-bot)
        analysis_type: Tipo de análise (general, workflows, security, performance)
    """
    try:
        # Extrai owner/repo da URL
        if "/" not in repo_url:
            return {"error": "URL inválida. Use formato: owner/repo"}
        
        owner, repo = repo_url.split("/")[-2:]
        
        # Busca informações do repositório
        repo_data = await github_api_request(f"/repos/{owner}/{repo}")
        
        if "message" in repo_data:
            return {"error": f"Repositório não encontrado: {repo_data['message']}"}
        
        # Busca workflows
        workflows = await github_api_request(f"/repos/{owner}/{repo}/actions/workflows")
        
        # Busca runs recentes
        runs = await github_api_request(f"/repos/{owner}/{repo}/actions/runs?per_page=20")
        
        # Análise básica
        analysis = {
            "repository": f"{owner}/{repo}",
            "description": repo_data.get("description", ""),
            "language": repo_data.get("language", ""),
            "stars": repo_data.get("stargazers_count", 0),
            "forks": repo_data.get("forks_count", 0),
            "workflows": {
                "total": workflows.get("total_count", 0),
                "active": len([w for w in workflows.get("workflows", []) if w["state"] == "active"])
            },
            "recent_activity": {
                "total_runs": runs.get("total_count", 0),
                "successful_runs": len([r for r in runs.get("workflow_runs", []) if r["conclusion"] == "success"]),
                "failed_runs": len([r for r in runs.get("workflow_runs", []) if r["conclusion"] == "failure"])
            }
        }
        
        # Sugestões baseadas na análise
        suggestions = []
        
        if analysis["workflows"]["total"] == 0:
            suggestions.append({
                "type": "workflow",
                "priority": "high",
                "title": "Implementar workflows CI/CD",
                "description": "Repositório não possui workflows GitHub Actions configurados"
            })
        
        if analysis["recent_activity"]["failed_runs"] > 0:
            failure_rate = analysis["recent_activity"]["failed_runs"] / max(analysis["recent_activity"]["total_runs"], 1)
            if failure_rate > 0.2:  # 20% de falha
                suggestions.append({
                    "type": "reliability",
                    "priority": "high",
                    "title": "Melhorar confiabilidade dos workflows",
                    "description": f"Taxa de falha alta: {failure_rate:.1%}"
                })
        
        analysis["suggestions"] = suggestions
        analysis["timestamp"] = datetime.now().isoformat()
        
        return analysis
        
    except Exception as e:
        return {"error": f"Erro na análise: {str(e)}"}

@app.tool()
async def create_workflow_issue(repo: str, workflow_type: str, title: str = None) -> Dict:
    """
    Cria uma issue para implementar um workflow específico
    
    Args:
        repo: Repositório (owner/repo)
        workflow_type: Tipo do workflow (ci, cd, build, test, deploy, main)
        title: Título customizado (opcional)
    """
    try:
        owner, repo_name = repo.split("/")[-2:]
        
        workflow_templates = {
            "ci": {
                "title": "🔄 Implementar Workflow CI (Integração Contínua)",
                "labels": ["enhancement", "ci-cd", "workflow", "priority-high"],
                "body": """## 🔄 Implementar Workflow CI

### 📋 Objetivo
Implementar workflow de Integração Contínua seguindo o padrão xCloud.

### ✅ Checklist de Implementação
- [ ] Criar arquivo `.github/workflows/ci.yml`
- [ ] Configurar triggers (push/PR para main/develop)
- [ ] Implementar quality checks (lint, format, audit)
- [ ] Configurar build do projeto
- [ ] Adicionar execução de testes
- [ ] Upload de artefatos de build
- [ ] Configurar coverage reports

### 🎯 Referência
- [Padrão de Workflows xCloud](../xcloud-docs/docs/guides/github-actions-workflows.md)
- [Implementação de Referência](../xcloud-bot/.github/workflows/ci.yml)

### 📊 Critérios de Aceite
- [ ] Workflow executado em push/PR
- [ ] Quality checks passando
- [ ] Build gerado com sucesso
- [ ] Testes executados
- [ ] Cobertura reportada
- [ ] Documentação atualizada

_Issue criada automaticamente pelo xCloud Bot_"""
            },
            "cd": {
                "title": "🚀 Implementar Workflow CD (Entrega Contínua)",
                "labels": ["enhancement", "ci-cd", "workflow", "deployment"],
                "body": """## 🚀 Implementar Workflow CD

### 📋 Objetivo
Implementar workflow de Entrega Contínua para deploy automático.

### ✅ Checklist de Implementação
- [ ] Criar arquivo `.github/workflows/cd.yml`
- [ ] Configurar trigger pós-CI
- [ ] Implementar deploy para staging
- [ ] Configurar deploy manual para production
- [ ] Adicionar notificações
- [ ] Configurar environments no GitHub

### 🎯 Ambientes
- **Staging**: Deploy automático após CI
- **Production**: Deploy manual com aprovação

### 📊 Critérios de Aceite
- [ ] Deploy staging automático
- [ ] Deploy production manual
- [ ] Notificações funcionando
- [ ] Rollback em caso de falha

_Issue criada automaticamente pelo xCloud Bot_"""
            },
            "build": {
                "title": "🏗️ Implementar Workflow Build Especializado",
                "labels": ["enhancement", "build", "workflow"],
                "body": """## 🏗️ Implementar Workflow Build

### 📋 Objetivo
Implementar workflow especializado para builds reutilizáveis.

### ✅ Checklist de Implementação
- [ ] Criar arquivo `.github/workflows/build.yml` 
- [ ] Configurar `workflow_call`
- [ ] Implementar build otimizado
- [ ] Análise de artefatos
- [ ] Build de documentação
- [ ] Cache inteligente

### 📊 Critérios de Aceite
- [ ] Reutilizável por outros workflows
- [ ] Build otimizado e rápido
- [ ] Artefatos bem organizados
- [ ] Documentação gerada

_Issue criada automaticamente pelo xCloud Bot_"""
            }
        }
        
        if workflow_type not in workflow_templates:
            return {"error": f"Tipo de workflow inválido: {workflow_type}"}
        
        template = workflow_templates[workflow_type]
        
        issue_data = {
            "title": title or template["title"],
            "body": template["body"],
            "labels": template["labels"]
        }
        
        result = await github_api_request(
            f"/repos/{owner}/{repo_name}/issues",
            method="POST",
            data=issue_data
        )
        
        if "html_url" in result:
            return {
                "success": True,
                "issue_url": result["html_url"],
                "issue_number": result["number"],
                "title": result["title"]
            }
        else:
            return {"error": f"Erro ao criar issue: {result}"}
        
    except Exception as e:
        return {"error": f"Erro: {str(e)}"}

@app.tool()
async def monitor_ci_status(repo: str, limit: int = 10) -> List[Dict]:
    """
    Monitora status de workflows CI em um repositório
    
    Args:
        repo: Repositório (owner/repo)
        limit: Número máximo de runs para analisar
    """
    try:
        owner, repo_name = repo.split("/")[-2:]
        
        runs = await github_api_request(f"/repos/{owner}/{repo_name}/actions/runs?per_page={limit}")
        
        if "workflow_runs" not in runs:
            return {"error": "Erro ao buscar workflow runs"}
        
        status_data = []
        for run in runs["workflow_runs"]:
            status_data.append({
                "workflow": run["name"],
                "status": run["status"],
                "conclusion": run["conclusion"],
                "branch": run["head_branch"],
                "commit": run["head_sha"][:7],
                "actor": run["actor"]["login"],
                "created_at": run["created_at"],
                "html_url": run["html_url"]
            })
        
        return status_data
        
    except Exception as e:
        return {"error": f"Erro: {str(e)}"}

@app.tool()
async def get_xcloud_repositories() -> List[Dict]:
    """
    Lista todos os repositórios da organização PageCloudv1 relacionados ao xCloud
    """
    try:
        repos = await github_api_request("/orgs/PageCloudv1/repos?per_page=100")
        
        if isinstance(repos, list):
            xcloud_repos = [
                {
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo["description"],
                    "language": repo["language"],
                    "html_url": repo["html_url"],
                    "has_workflows": False  # Será verificado depois
                }
                for repo in repos
                if repo["name"].startswith("xcloud-")
            ]
            
            # Verifica se cada repo tem workflows
            for repo in xcloud_repos:
                workflows = await github_api_request(f"/repos/{repo['full_name']}/actions/workflows")
                repo["has_workflows"] = workflows.get("total_count", 0) > 0
            
            return xcloud_repos
        else:
            return {"error": f"Erro ao buscar repositórios: {repos}"}
        
    except Exception as e:
        return {"error": f"Erro: {str(e)}"}

@app.tool()
async def run_gemini_analysis(prompt: str, context: Dict = None) -> Dict:
    """
    Executa análise usando Gemini CLI (integração com ferramentas existentes)
    
    Args:
        prompt: Prompt para análise
        context: Contexto adicional
    """
    try:
        # Prepara comando gemini_cli
        context_str = json.dumps(context) if context else "{}"
        command = f'gemini_cli --prompt="{prompt}" --context=\'{context_str}\''
        
        result = await run_command(command)
        
        if result["success"]:
            try:
                return json.loads(result["stdout"])
            except json.JSONDecodeError:
                return {"response": result["stdout"]}
        else:
            return {"error": f"Comando falhou: {result['stderr']}"}
        
    except Exception as e:
        return {"error": f"Erro: {str(e)}"}

if __name__ == "__main__":
    print("🤖 Iniciando xCloud Bot MCP Server...")
    print("🔗 Ferramentas disponíveis:")
    print("  • analyze_repository - Análise de repositórios")
    print("  • create_workflow_issue - Criação de issues")
    print("  • monitor_ci_status - Monitoramento CI")
    print("  • get_xcloud_repositories - Lista repositórios xCloud")
    print("  • run_gemini_analysis - Integração Gemini")
    print("")
    print("🌐 Server rodando na porta 8000")
    
    app.run(port=8000)