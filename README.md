# RAKU — MCP Factory & Manager

Enterprise-ready MCP Factory that automates the creation of MCP servers from existing APIs. Features intelligent API analysis, pack-based tool grouping, Docker image generation, Kubernetes deployment, and comprehensive management through Fastify, Prisma/PostgreSQL, Module Federation React apps, and Azure OpenAI integration.

## Quick links

- [Architecture overview](./architecture.md)
- [.env template for the API service](./services/api/.env.example)

## Prerequisites

- Node.js 20+
- pnpm 9 (`corepack enable` or `npm i -g pnpm@9`)
- Local PostgreSQL (or use the bundled Docker Compose)

## Running the API server

```bash
pnpm install
cp services/api/.env.example services/api/.env   # edit values as needed
pnpm --filter @raku/api prisma:generate
pnpm --filter @raku/api prisma:migrate
pnpm --filter @raku/api dev
```

The API listens on `http://localhost:8080` by default. Point agents to `POST /v1/route/execute`, manage MCP registrations with `/v1/integrations/mcp/*` endpoints, and deploy MCP servers with `/v1/servers/deploy`.

## MCP Factory Workflow

RAKU automates the complete MCP creation process:

1. **API Analysis** → Analyze existing APIs (REST, GraphQL, etc.)
2. **Pack Creation** → Group related tools into logical packs
3. **Pack Selection** → Choose which packs to include in MCP server
4. **Docker Generation** → Generate Docker images with selected packs
5. **Kubernetes Deployment** → Deploy to configurable landing zones
6. **Server Management** → Monitor and manage deployed MCP servers

### Azure OpenAI-powered assistant

The built-in enablement agent uses Azure OpenAI to analyze existing APIs and draft MCP registrations.

1. Provision an Azure OpenAI resource and deployment (e.g. `gpt-4o-mini`).
2. Populate the following environment variables in `services/api/.env`:

   ```bash
   AZURE_OPENAI_ENDPOINT=https://<resource-name>.openai.azure.com
   AZURE_OPENAI_API_KEY=<key>
   AZURE_OPENAI_DEPLOYMENT=<deployment-name>
   AZURE_OPENAI_API_VERSION=2024-02-01
   ```

3. Call `POST /v1/assistant/mcp-planner` with a payload such as:

   ```json
   {
     "question": "Help me register the billing REST API as an MCP pack",
     "apis": [
       {
         "name": "Billing REST",
         "description": "Invoices, payments, refunds",
         "endpoints": [
           { "method": "POST", "path": "/v1/invoices", "summary": "Create invoice" },
           { "method": "POST", "path": "/v1/invoices/{id}/send", "summary": "Send invoice" }
         ]
       }
     ]
   }
   ```

   The response includes a high-level plan and a draft payload for `/v1/integrations/mcp/register`. If Azure credentials are missing, the API returns `503` with guidance.

## Running the UI surfaces

```bash
pnpm --filter @raku/ui-host dev       # http://localhost:3000 (Main Dashboard)
pnpm --filter @raku/ui-catalog dev    # http://localhost:3001 (Server Catalog)
pnpm --filter @raku/ui-server dev     # http://localhost:3002 (Server Management)
pnpm --filter @raku/ui-packs dev      # http://localhost:3003 (MCP Factory - Pack Management)
pnpm --filter @raku/ui-policy dev     # http://localhost:3004 (Policy Management)
pnpm --filter @raku/ui-obs dev        # http://localhost:3005 (Observability Dashboard)
pnpm --filter @raku/ui-a2a dev        # http://localhost:3006 (Agent-to-Agent Console)
pnpm --filter @raku/ui-docs dev       # http://localhost:3007 (Documentation)
pnpm --filter @raku/sample-mcp dev    # http://localhost:9091 (Sample MCP Server)
```

### UI Applications Overview

- **Host Dashboard** (`/host`) - Main navigation hub with Module Federation integration
- **Server Catalog** (`/catalog`) - Browse and register third-party MCP servers
- **Server Management** (`/servers`) - Manage deployed MCP server instances
- **MCP Factory** (`/packs`) - Complete MCP creation workflow (API analysis → Pack creation → Deployment)
- **Policy Management** (`/policies`) - RBAC/ABAC policy configuration
- **Observability** (`/obs`) - Metrics, traces, and monitoring dashboards
- **Agent Console** (`/a2a`) - Agent-to-agent communication and job management
- **Documentation** (`/docs`) - API docs and "Ask RAKU Copilot" assistant

## Sample MCP registration

Use the Catalog UI button or run:

```bash
curl -X POST http://localhost:8080/v1/integrations/mcp/register \
  -H "content-type: application/json" \
  -d '{"id":"00000000-0000-0000-0000-000000000777","name":"sample-mcp","baseUrl":"http://localhost:9091","auth":{"type":"none"},"capabilities":[{"intent":"sample.echo","verbs":["action"]},{"intent":"sample.math.add","verbs":["action"]}],"env":"dev","tags":["demo"]}'
```

## Agent quick start

TypeScript/Python snippets live in the Docs UI. You can also call the helper directly:

```ts
import { rakuExecute } from "@raku/contracts";

await rakuExecute(
  process.env.RAKU_BASE || "http://localhost:8080",
  process.env.RAKU_TOKEN,
  "sample.math.add",
  { a: 2, b: 3 },
  { env: "dev" }
);
```

## Landing Zones & Deployment

RAKU supports configurable Kubernetes landing zones for MCP server deployment:

```bash
# Environment variables for landing zone configuration
DEV_CLUSTER_URL=https://dev-k8s.company.com
DEV_CLUSTER_TOKEN=dev-token-here
DEV_REGISTRY=dev-registry.company.com

STAGING_CLUSTER_URL=https://staging-k8s.company.com
STAGING_CLUSTER_TOKEN=staging-token-here
STAGING_REGISTRY=staging-registry.company.com

PROD_CLUSTER_URL=https://prod-k8s.company.com
PROD_CLUSTER_TOKEN=prod-token-here
PROD_REGISTRY=prod-registry.company.com
```

Each deployed MCP server runs in its own dedicated Kubernetes namespace with:
- Docker image generation from selected packs
- Automatic Kubernetes manifest generation
- Health checking and monitoring
- Resource management and scaling

## Enterprise notes

- `ops/docker-compose.enterprise.yml` starts Postgres, Redis, Kafka, ClickHouse, Fastify API, sample MCP, and an NGINX gateway.
- Harden the public ingress with OIDC, mTLS, WAF, and rate limiting before exposing to agents.
- Landing zones support multi-tenant isolation and security policies.
