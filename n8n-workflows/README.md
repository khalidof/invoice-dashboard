# n8n Workflows Backup

This folder contains exported n8n workflows for version control.

## Workflows

| File | Workflow Name | ID | Description |
|------|--------------|-----|-------------|
| `invoice-processor-ai-agent-mcp.json` | Invoice Processor (AI Agent + MCP) | 1yo0k14XyiE2cQnz | Main workflow using AI Agent with MCP tools |
| `invoice-tools-mcp-server.json` | Invoice Tools MCP Server | pJuNchSXpVGK0mDG | MCP Server exposing extraction tools |
| `invoice-processor-vision-api.json` | Invoice Processor (Vision API) | Wtve6TUEa9c2XPW1 | Legacy workflow using direct Claude API |

## Importing Workflows

### Via n8n UI
1. Open n8n at http://localhost:5678
2. Go to **Workflows** → **Import from file**
3. Select the JSON file
4. Configure credentials after import

### Via n8n CLI
```bash
n8n import:workflow --input=./invoice-processor-ai-agent-mcp.json
```

## After Import: Configure Credentials

These credentials must be set manually after importing:

### Invoice Processor (AI Agent + MCP)
- **Claude node**: Anthropic API credential
- **Save to Supabase node**: Supabase API credential

### Invoice Tools MCP Server
- No credentials required

### Invoice Processor (Vision API)
- **Claude Vision API node**: HTTP Header Auth with Anthropic API key

## Backup Script

To export all workflows from n8n:

```bash
# Export specific workflow
curl -X GET "http://localhost:5678/api/v1/workflows/WORKFLOW_ID" \
  -H "X-N8N-API-KEY: your-api-key" \
  -o workflow-backup.json

# Export all workflows
curl -X GET "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-api-key" \
  -o all-workflows.json
```

## Git Workflow

```bash
# After making changes in n8n, export and commit
cd invoice-dashboard/n8n-workflows

# Stage workflow changes
git add *.json

# Commit with descriptive message
git commit -m "n8n: Update invoice processor workflow with Supabase integration"

# Push to remote
git push
```

## Restoring from Git

1. Pull the latest from git
2. Import the workflow JSON in n8n
3. Configure credentials
4. Activate the workflow

---
*Last updated: February 1, 2026*
