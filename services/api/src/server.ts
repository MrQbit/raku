import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { executeIntent } from "./usecases/executeIntent";
import { discoverRoutes } from "./usecases/discoverRoutes";
import { listServers, getServer } from "./usecases/servers";
import { listPacks, getPack, upsertPack } from "./usecases/packs";
import { listPolicies, createPolicy } from "./usecases/policies";
import { getJob, createJob, updateJob } from "./usecases/jobs";
import { listTraces } from "./usecases/traces";
import { registerThirdPartyMcp, listThirdPartyMcps, getThirdPartyMcp } from "./usecases/thirdparty";
import { planMcpAssistant } from "./usecases/assistant";
import { listLandingZones, getLandingZone, createLandingZone, updateLandingZone, deleteLandingZone } from "./usecases/landingZones";
import { listDeployments, getDeployment, createDeployment, updateDeploymentStatus, deleteDeployment } from "./usecases/deployments";
import { deployMcpServer } from "./usecases/dockerGeneration";
import { deployToKubernetes, getDeploymentStatus, scaleDeployment, deleteKubernetesDeployment } from "./usecases/kubernetes";

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
app.post("/v1/jobs", async (req, reply) => {
  const body = z.object({
    owner: z.string(),
    payload: z.record(z.any()),
    status: z.string().optional().default("pending")
  }).parse(req.body);
  return reply.code(201).send(await createJob(body.owner, body.payload, body.status));
});
app.put("/v1/jobs/:jobId", async (req, reply) => {
  const body = z.object({
    status: z.string().optional(),
    progress: z.number().optional(),
    resultRef: z.string().optional()
  }).parse(req.body);
  return reply.send(await updateJob((req.params as any).jobId, body));
});
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

// Landing Zone Management Endpoints
app.get("/v1/landing-zones", async (req, reply) => {
  return reply.send(await listLandingZones());
});

app.get("/v1/landing-zones/:zoneId", async (req, reply) => {
  try {
    return reply.send(await getLandingZone((req.params as any).zoneId));
  } catch (error) {
    return reply.code(404).send({ error: (error as Error).message });
  }
});

app.post("/v1/landing-zones", async (req, reply) => {
  const body = z.object({
    name: z.string(),
    clusterUrl: z.string().url(),
    token: z.string(),
    registryUrl: z.string().url(),
    namespacePrefix: z.string().optional(),
    description: z.string().optional()
  }).parse(req.body);
  
  try {
    return reply.code(201).send(await createLandingZone(body));
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.put("/v1/landing-zones/:zoneId", async (req, reply) => {
  const body = z.object({
    name: z.string().optional(),
    clusterUrl: z.string().url().optional(),
    token: z.string().optional(),
    registryUrl: z.string().url().optional(),
    namespacePrefix: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional()
  }).parse(req.body);
  
  try {
    return reply.send(await updateLandingZone((req.params as any).zoneId, body));
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.delete("/v1/landing-zones/:zoneId", async (req, reply) => {
  try {
    return reply.send(await deleteLandingZone((req.params as any).zoneId));
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

// Deployment Management Endpoints
app.get("/v1/deployments", async (req, reply) => {
  const landingZoneId = (req.query as any).landingZoneId;
  return reply.send(await listDeployments(landingZoneId));
});

app.get("/v1/deployments/:deploymentId", async (req, reply) => {
  try {
    return reply.send(await getDeployment((req.params as any).deploymentId));
  } catch (error) {
    return reply.code(404).send({ error: (error as Error).message });
  }
});

app.post("/v1/deployments", async (req, reply) => {
  const body = z.object({
    serverName: z.string(),
    landingZoneId: z.string(),
    namespace: z.string(),
    imageUrl: z.string(),
    config: z.any().optional()
  }).parse(req.body);
  
  try {
    return reply.code(201).send(await createDeployment(body));
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.put("/v1/deployments/:deploymentId/status", async (req, reply) => {
  const body = z.object({
    status: z.string().optional(),
    deployedAt: z.string().datetime().optional()
  }).parse(req.body);
  
  const updates = {
    ...body,
    deployedAt: body.deployedAt ? new Date(body.deployedAt) : undefined
  };
  
  try {
    return reply.send(await updateDeploymentStatus((req.params as any).deploymentId, updates));
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.delete("/v1/deployments/:deploymentId", async (req, reply) => {
  try {
    return reply.send(await deleteDeployment((req.params as any).deploymentId));
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

// MCP Server Deployment Endpoints
app.post("/v1/servers/deploy", async (req, reply) => {
  const body = z.object({
    serverName: z.string(),
    landingZoneId: z.string(),
    packIds: z.array(z.string()),
    config: z.any().optional()
  }).parse(req.body);
  
  try {
    const deploymentId = await deployMcpServer(body);
    return reply.code(201).send({ deploymentId, status: "building" });
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.post("/v1/deployments/:deploymentId/deploy", async (req, reply) => {
  try {
    await deployToKubernetes((req.params as any).deploymentId);
    return reply.send({ status: "deployed" });
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.get("/v1/deployments/:deploymentId/status", async (req, reply) => {
  try {
    return reply.send(await getDeploymentStatus((req.params as any).deploymentId));
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.put("/v1/deployments/:deploymentId/scale", async (req, reply) => {
  const body = z.object({
    replicas: z.number().min(0)
  }).parse(req.body);
  
  try {
    await scaleDeployment((req.params as any).deploymentId, body.replicas);
    return reply.send({ status: "scaled", replicas: body.replicas });
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.delete("/v1/deployments/:deploymentId/kubernetes", async (req, reply) => {
  try {
    await deleteKubernetesDeployment((req.params as any).deploymentId);
    return reply.send({ status: "deleted" });
  } catch (error) {
    return reply.code(400).send({ error: (error as Error).message });
  }
});

app.listen({ port: Number(process.env.PORT || 8080), host: "0.0.0.0" });
