# RAKU — MCP Manager

Enterprise-ready MCP control plane with Fastify, Prisma/PostgreSQL, Module Federation React apps, shared contracts, and a built-in Azure OpenAI assistant for MCP onboarding.

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

The API listens on `http://localhost:8080` by default. Point agents to `POST /v1/route/execute` and manage MCP registrations with `/v1/integrations/mcp/*` endpoints.

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
pnpm --filter @raku/ui-host dev       # http://localhost:3000
pnpm --filter @raku/ui-catalog dev    # http://localhost:3001
pnpm --filter @raku/ui-docs dev       # http://localhost:3007
pnpm --filter @raku/sample-mcp dev    # http://localhost:9091
```

- The Docs app (`/docs`) now exposes an “Ask RAKU Copilot” panel backed by the planner endpoint.
- The Catalog app lists servers and allows one-click registration of the sample MCP server.

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

## Enterprise notes

- `ops/docker-compose.enterprise.yml` starts Postgres, Redis, Kafka, ClickHouse, Fastify API, sample MCP, and an NGINX gateway.
- Harden the public ingress with OIDC, mTLS, WAF, and rate limiting before exposing to agents.
