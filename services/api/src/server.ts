import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { executeIntent } from "./usecases/executeIntent";
import { discoverRoutes } from "./usecases/discoverRoutes";
import { listServers, getServer } from "./usecases/servers";
import { listPacks, getPack, upsertPack } from "./usecases/packs";
import { listPolicies, createPolicy } from "./usecases/policies";
import { getJob } from "./usecases/jobs";
import { listTraces } from "./usecases/traces";
import { registerThirdPartyMcp, listThirdPartyMcps, getThirdPartyMcp } from "./usecases/thirdparty";
import { planMcpAssistant } from "./usecases/assistant";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.post("/v1/route/execute", async (req, reply) => {
  const body = z.object({
    intent: z.string(),
    inputs: z.record(z.any()),
    context: z.object({
      tenant: z.string().optional(),
      env: z.enum(["dev","staging","prod"]).optional(),
      budget: z.number().optional(),
      sensitivity: z.enum(["low","medium","high"]).optional()
    }).optional(),
    preferVersion: z.string().optional()
  }).parse(req.body);
  return reply.send(await executeIntent(body));
});

app.post("/v1/route/discover", async (req, reply) => {
  const body = z.object({ intent: z.string() }).parse(req.body);
  return reply.send(await discoverRoutes(body.intent));
});

app.get("/v1/servers", async (_req, reply) => reply.send(await listServers()));
app.get("/v1/servers/:id", async (req, reply) => reply.send(await getServer((req.params as any).id)));

app.get("/v1/packs", async (_req, reply) => reply.send(await listPacks()));
app.get("/v1/packs/:id", async (req, reply) => reply.send(await getPack((req.params as any).id)));
app.post("/v1/packs", async (req, reply) => reply.code(201).send(await upsertPack(req.body)));
app.put("/v1/packs/:id", async (req, reply) => reply.send(await upsertPack({ id: (req.params as any).id, ...(req.body as any) })));

app.get("/v1/policies", async (_req, reply) => reply.send(await listPolicies()));
app.post("/v1/policies", async (req, reply) => reply.code(201).send(await createPolicy(req.body)));

app.get("/v1/jobs/:jobId", async (req, reply) => reply.send(await getJob((req.params as any).jobId)));
app.get("/v1/traces", async (req, reply) => reply.send(await listTraces(req.query as any)));

app.post("/v1/integrations/mcp/register", async (req, reply) => {
  try { return reply.code(201).send(await registerThirdPartyMcp(req.body)); }
  catch (e: any) { return reply.code(400).send({ error: e?.message ?? "invalid payload" }); }
});
app.get("/v1/integrations/mcp", async (req, reply) => reply.send(await listThirdPartyMcps(req.query as any)));
app.get("/v1/integrations/mcp/:id", async (req, reply) => {
  const out = await getThirdPartyMcp((req.params as any).id);
  if (!out) return reply.code(404).send({ error: "not found" });
  return reply.send(out);
});

app.post("/v1/assistant/mcp-planner", async (req, reply) => {
  const result = await planMcpAssistant(req.body);
  if (result.status === "ok") return reply.send(result);
  if (result.status === "partial") return reply.send(result);
  if (result.status === "not_configured") return reply.code(503).send(result);
  if (result.code === "validation") return reply.code(400).send(result);
  return reply.code(502).send(result);
});

app.listen({ port: Number(process.env.PORT || 8080), host: "0.0.0.0" });
