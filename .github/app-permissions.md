# GitHub App Permissions Required for xCloud Bot

Para que o xCloud Bot apareça na lista de assignees e reviewers, a GitHub App precisa ter as seguintes permissões configuradas:

## Repository Permissions

### Issues
- **Read & Write** - Para ler e modificar issues, incluindo assignments

### Pull Requests  
- **Read & Write** - Para ler e modificar PRs, incluindo reviews e assignments

### Contents
- **Read & Write** - Para acessar e modificar arquivos do repositório

### Metadata
- **Read** - Para acessar metadados do repositório

### Actions
- **Read & Write** - Para executar e monitorar GitHub Actions

## Organization Permissions

### Members
- **Read** - Para verificar membros da organização (opcional)

## Events/Webhooks

A GitHub App deve estar subscrita aos seguintes eventos:

- `issues` (opened, edited, closed, assigned, unassigned)
- `pull_request` (opened, edited, closed, review_requested)
- `issue_comment` (created, edited)
- `pull_request_review` (submitted)
- `workflow_run` (completed)

## Configuração Adicional

1. **User-to-server token expiration**: Configure para "Never expire" ou um período longo
2. **Webhook URL**: Configure para o endpoint do seu bot
3. **Webhook Secret**: Configure o mesmo valor da variável `WEBHOOK_SECRET`

## Verificação

Para verificar se as permissões estão corretas:

1. Vá para Settings > Developer settings > GitHub Apps
2. Selecione sua app
3. Verifique as permissões na seção "Permissions"
4. Verifique os eventos na seção "Subscribe to events"

## Troubleshooting

Se o bot não aparecer para assignment:

1. Verifique se a app está instalada no repositório
2. Verifique se as permissões de Issues estão em "Read & Write"
3. Verifique se o evento "issues" está habilitado
4. Verifique se o webhook está funcionando corretamente