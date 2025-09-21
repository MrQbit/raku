# RAKU Architecture

## System overview

RAKU is an enterprise-grade Model Context Protocol (MCP) control plane that centralizes routing, cataloging, and governance for internal and third-party MCP providers. The monorepo is organized as a Turborepo workspace with Fastify/Prisma services, Module Federation React apps, shared contract packages, and infrastructure automation. Key traits:

- **Deterministic contracts** shared by all surfaces via `@raku/contracts` (Zod schemas and helpers).
- **Fastify API service** backed by PostgreSQL/Prisma with extension points for Redis, Kafka, ClickHouse, and OTEL exports.
- **Module Federation UI suite** (host shell + remotes) for catalog, docs, observability, policy, A2A, packs, and server management.
- **Sample MCP server** to validate router integrations and third-party registration flows.
- **Built-in Azure OpenAI assistant** that plans MCP registrations by analyzing existing APIs and returning draft payloads.

## Monorepo layout

```
apps/            # Module Federation host + remote React apps
services/        # Fastify API (@raku/api) and sample MCP service
packages/        # Shared tooling, contracts, UI foundation, CLI skeletons
ops/             # Docker Compose + gateway assets for enterprise deployments
.github/         # CI workflow ensuring install/typecheck/build
```

Turborepo pipelines orchestrate build, lint, test, and typecheck tasks across packages.

## Control plane API (`services/api`)

### Core components

- **Fastify server (`src/server.ts`)** exposes REST endpoints for routing (`/v1/route/execute`), discovery, packs, policies, jobs, traces, and third-party MCP registrations.
- **Domain utilities (`src/domain/*`)** encapsulate routing decisions, policy enforcement, tracing redaction, and adapter calls.
- **Use cases (`src/usecases/*`)** provide orchestration per endpoint. The new `assistant.ts` use case powers the built-in agent.
- **Prisma schema (`prisma/schema.prisma`)** models servers, packs, policies, traces, async jobs, and third-party MCP records.
- **Azure OpenAI integration (`src/integrations/azureOpenAI.ts`)** performs REST calls against Azure endpoints to retrieve structured chat completions for the assistant.

### Request lifecycle: intent execution

1. `POST /v1/route/execute` validates the payload with Zod.
2. `usecases/executeIntent` fetches a route via `domain/routing` and enforces policy checks.
3. `domain/adapters` calls either an internal adapter or third-party MCP HTTP endpoint, surfacing async jobs.
4. `domain/tracing` (placeholder) redacts sensitive data and would emit traces/persist to the DB.
5. Responses are normalized as `{ status: "ok" | "async" | "error", ... }`.

### Request lifecycle: assistant planner

1. `POST /v1/assistant/mcp-planner` accepts a question plus optional API context (plain text or structured JSON).
2. `usecases/assistant.planMcpAssistant` constructs a deterministic system prompt instructing Azure OpenAI to reply with JSON (summary, steps, draft registration payload, validation checklist).
3. `integrations/azureOpenAI.runAzureChat` posts to Azure's chat completions endpoint using environment-provided credentials.
4. Responses are parsed/validated via Zod. Structured plans return `status: "ok"`; otherwise the raw response is surfaced with `status: "partial"` for transparency.
5. Missing Azure credentials yield `503` to help operators configure the assistant.

### Data & observability stack

- PostgreSQL persists catalog entities (servers, packs, policies, traces, jobs, MCP registrations).
- Redis, Kafka, and ClickHouse are optional enterprise dependencies configured via environment variables and Compose templates.
- OTEL exporter endpoint can be wired for tracing/metrics.
- NGINX gateway proxy (in `ops/`) fronts the API for TLS termination, auth, and WAF policies.

## UI surfaces

- **`apps/ui-host`** renders navigation and lazy-loads remote apps via Module Federation.
- **Catalog (`apps/ui-catalog`)** lists servers/packs and drives third-party MCP registration.
- **Docs (`apps/ui-docs`)** provides onboarding guides plus the new “Ask RAKU Copilot” panel that calls the assistant endpoint and renders JSON guidance.
- **Other remotes** (policy, packs, observability, server, a2a) are scaffolded placeholders to extend.
- All apps consume the shared design tokens/components from `@raku/ui-foundation`.

## Sample MCP server (`services/sample-mcp`)

Implements health/meta/execute endpoints for `sample.echo` and `sample.math.add`. Used for end-to-end validation of routing, registration, and assistant-generated payloads.

## Infrastructure & deployment

- **Local development** uses pnpm workspaces and `docker-compose.yml` for API + Postgres + sample MCP.
- **Enterprise Compose stack** (`ops/docker-compose.enterprise.yml`) adds Redis, Kafka, ClickHouse, and NGINX gateway. Environment variables point the API to managed services where desired.
- CI workflow installs dependencies, runs typechecks/lint/tests, and builds via Turborepo.

## Decision log (“why” notes)

1. **Shared Zod contracts** ensure backend, UIs, and tooling validate identical payloads. This avoids drift across teams integrating MCP packs.
2. **Fastify + Prisma** selected for performance, schema-driven data modeling, and straightforward TypeScript integration with PostgreSQL.
3. **Azure OpenAI assistant** introduced to satisfy the requirement for a built-in guide capable of reasoning over arbitrary API descriptions and proposing MCP registrations. Azure endpoints align with enterprise compliance needs.
4. **Module Federation** keeps each UI surface independently deployable while sharing runtime dependencies, enabling teams to iterate on catalog, observability, or docs without rebuilding the host shell.
5. **Fallback-friendly assistant responses** (partial/raw output) preserve observability and debuggability when Azure returns unexpected formats, ensuring operators can troubleshoot prompt/data issues.
6. **Infrastructure manifests** (Docker Compose + NGINX) codify enterprise topology—Postgres for state, Redis/Kafka/ClickHouse for scale, and gateway for security—meeting HA/multi-tenant expectations.
