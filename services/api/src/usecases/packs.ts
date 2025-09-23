import prisma from "../db/client";

export async function listPacks() {
  const rows = await prisma.pack.findMany({ 
    orderBy: { createdAt: "desc" },
    include: {
      servers: {
        include: {
          server: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
  return rows.map((p) => ({ 
    id: p.id, 
    namespace: p.namespace, 
    version: p.version, 
    description: p.description,
    // Legacy support
    intents: p.intentsJson,
    // New hybrid pack resources
    tools: p.toolsJson,
    databases: p.databasesJson,
    files: p.filesJson,
    knowledge: p.knowledgeJson,
    streams: p.streamsJson,
    prompts: p.promptsJson,
    contextSchema: p.contextSchemaJson,
    capabilities: p.capabilitiesJson,
    relationships: p.relationshipsJson,
    workflows: p.workflowsJson,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    consumingServers: p.servers.map(s => s.server.name)
  }));
}

export async function getPack(id: string) {
  const p = await prisma.pack.findUnique({ 
    where: { id },
    include: {
      servers: {
        include: {
          server: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
  if (!p) return null as any;
  return { 
    id: p.id, 
    namespace: p.namespace, 
    version: p.version, 
    description: p.description,
    // Legacy support
    intents: p.intentsJson,
    // New hybrid pack resources
    tools: p.toolsJson,
    databases: p.databasesJson,
    files: p.filesJson,
    knowledge: p.knowledgeJson,
    streams: p.streamsJson,
    prompts: p.promptsJson,
    contextSchema: p.contextSchemaJson,
    capabilities: p.capabilitiesJson,
    relationships: p.relationshipsJson,
    workflows: p.workflowsJson,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    consumingServers: p.servers.map(s => s.server.name)
  };
}

export async function createPack(body: any) {
  const created = await prisma.pack.create({
    data: {
      namespace: body.namespace,
      version: body.version,
      description: body.description,
      // Legacy support
      intentsJson: body.intentsJson || body.intents || [],
      // New hybrid pack resources
      toolsJson: body.toolsJson || body.tools,
      databasesJson: body.databasesJson || body.databases,
      filesJson: body.filesJson || body.files,
      knowledgeJson: body.knowledgeJson || body.knowledge,
      streamsJson: body.streamsJson || body.streams,
      promptsJson: body.promptsJson || body.prompts,
      contextSchemaJson: body.contextSchemaJson || body.contextSchema,
      capabilitiesJson: body.capabilitiesJson || body.capabilities,
      relationshipsJson: body.relationshipsJson || body.relationships,
      workflowsJson: body.workflowsJson || body.workflows,
      errorModel: body.errorModel ?? [],
      policies: body.policies ?? []
    }
  });
  return created;
}

export async function upsertPack(body: any) {
  const created = await prisma.pack.upsert({
    where: { id: body.id ?? "" },
    update: {
      namespace: body.namespace,
      version: body.version,
      description: body.description,
      // Legacy support
      intentsJson: body.intents,
      // New hybrid pack resources
      toolsJson: body.tools,
      databasesJson: body.databases,
      filesJson: body.files,
      knowledgeJson: body.knowledge,
      streamsJson: body.streams,
      promptsJson: body.prompts,
      contextSchemaJson: body.contextSchema,
      capabilitiesJson: body.capabilities,
      relationshipsJson: body.relationships,
      workflowsJson: body.workflows,
      errorModel: body.errorModel ?? [],
      policies: body.policies ?? []
    },
    create: {
      id: body.id,
      namespace: body.namespace,
      version: body.version,
      description: body.description,
      // Legacy support
      intentsJson: body.intents,
      // New hybrid pack resources
      toolsJson: body.tools,
      databasesJson: body.databases,
      filesJson: body.files,
      knowledgeJson: body.knowledge,
      streamsJson: body.streams,
      promptsJson: body.prompts,
      contextSchemaJson: body.contextSchema,
      capabilitiesJson: body.capabilities,
      relationshipsJson: body.relationships,
      workflowsJson: body.workflows,
      errorModel: body.errorModel ?? [],
      policies: body.policies ?? []
    }
  });
  return { ok: true, id: created.id };
}
