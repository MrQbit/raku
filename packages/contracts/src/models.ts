import { z } from "zod";

export const EnvEnum = z.enum(["dev", "staging", "prod"]);
export const IntentId = z.string().min(3);

export const CapabilityIntent = z.object({
  name: IntentId,
  description: z.string().optional(),
  inputSchema: z.any().optional(),
  outputSchema: z.any().optional(),
  verbs: z.array(z.enum(["list","get","create","update","delete","action"])).nonempty()
});

export const Pack = z.object({
  id: z.string().uuid(),
  namespace: z.string().min(2),
  version: z.string().min(1),
  intents: z.array(CapabilityIntent),
  errorModel: z.array(z.enum(["NotFound","Conflict","RateLimited","Unauthorized","ValidationFailed"])),
  policies: z.array(z.string()).optional(),
  scorecard: z.object({
    latencyP95Ms: z.number().optional(),
    errorRate: z.number().optional()
  }).optional()
});

export const Server = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  version: z.string(),
  env: EnvEnum,
  status: z.enum(["healthy","degraded","down"]),
  endpointBaseUrl: z.string().url(),
  packs: z.array(z.string().uuid()),
  owners: z.array(z.string()),
  quotas: z.object({
    rps: z.number().optional(),
    concurrency: z.number().optional()
  }).optional(),
  secretsRef: z.string().optional()
});

export const Policy = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  rbac: z.object({
    roles: z.array(z.string()),
    grants: z.array(z.object({
      role: z.string(),
      intentPattern: z.string(),
      env: EnvEnum.optional(),
      actions: z.array(z.enum(["execute","discover"])).default(["execute"])
    }))
  }),
  abac: z.object({
    constraints: z.array(z.object({
      key: z.string(),
      op: z.enum(["eq","neq","lte","gte","in","nin"]),
      value: z.any()
    })).optional()
  }).optional(),
  approvals: z.array(z.object({
    intentPattern: z.string(),
    approverGroup: z.string()
  })).optional()
});

export const Route = z.object({
  intent: IntentId,
  target: z.object({
    serverId: z.string().uuid(),
    packId: z.string().uuid(),
    version: z.string()
  })
});

export const Trace = z.object({
  id: z.string().uuid(),
  conversationId: z.string().optional(),
  agentId: z.string(),
  route: Route,
  inputRedacted: z.record(z.any()).optional(),
  outputRedacted: z.record(z.any()).optional(),
  latencyMs: z.number(),
  cost: z.number().optional(),
  status: z.enum(["ok","error","async"])
});

// Third-party MCP registry
export const ThirdPartyMcp = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  baseUrl: z.string().url(),
  capabilities: z.array(z.object({
    intent: z.string(),
    inputSchema: z.any().optional(),
    outputSchema: z.any().optional(),
    verbs: z.array(z.enum(["list","get","create","update","delete","action"])).nonempty()
  })),
  auth: z.object({
    type: z.enum(["none","apiKey","bearer","mtls"]),
    headerName: z.string().optional(),
    secretRef: z.string().optional()
  }),
  healthEndpoint: z.string().optional(),
  owners: z.array(z.string()).default([]),
  env: EnvEnum.default("dev"),
  status: z.enum(["healthy","degraded","down"]).default("healthy"),
  tags: z.array(z.string()).default([])
});

export type TEnv = z.infer<typeof EnvEnum>;
export type TPack = z.infer<typeof Pack>;
export type TServer = z.infer<typeof Server>;
export type TPolicy = z.infer<typeof Policy>;
export type TTrace = z.infer<typeof Trace>;
export type TRoute = z.infer<typeof Route>;
export type TCapabilityIntent = z.infer<typeof CapabilityIntent>;
export type TThirdPartyMcp = z.infer<typeof ThirdPartyMcp>;
