import prisma from "../db/client";
import { encrypt, decrypt } from "../domain/encryption";

export async function listAgents() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      url: true,
      isActive: true,
      owners: true,
      tags: true,
      quotasRps: true,
      lastUsedAt: true,
      usageStats: true,
      createdAt: true,
      updatedAt: true,
      // Don't include apiKey in list view for security
    }
  });
  
  return agents;
}

export async function getAgent(agentId: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      name: true,
      description: true,
      url: true,
      isActive: true,
      owners: true,
      tags: true,
      quotasRps: true,
      lastUsedAt: true,
      usageStats: true,
      createdAt: true,
      updatedAt: true,
      // Don't include apiKey in detail view for security
    }
  });
  
  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found`);
  }
  
  return agent;
}

export async function createAgent(data: {
  name: string;
  description?: string;
  url?: string;
  owners?: string[];
  tags?: string[];
  quotasRps?: number;
}) {
  // Generate a new API key
  const apiKey = generateApiKey();
  const encryptedApiKey = encrypt(apiKey);
  
  const agent = await prisma.agent.create({
    data: {
      name: data.name,
      description: data.description,
      url: data.url,
      apiKey: encryptedApiKey,
      owners: data.owners || [],
      tags: data.tags || [],
      quotasRps: data.quotasRps,
      isActive: true,
    }
  });
  
  return {
    ...agent,
    apiKey, // Return the plain API key for display (only time it's visible)
    apiKeyEncrypted: undefined, // Remove encrypted key from response
  };
}

export async function updateAgent(agentId: string, data: {
  name?: string;
  description?: string;
  url?: string;
  isActive?: boolean;
  owners?: string[];
  tags?: string[];
  quotasRps?: number;
}) {
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      description: true,
      url: true,
      isActive: true,
      owners: true,
      tags: true,
      quotasRps: true,
      lastUsedAt: true,
      usageStats: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return agent;
}

export async function regenerateApiKey(agentId: string) {
  const newApiKey = generateApiKey();
  const encryptedApiKey = encrypt(newApiKey);
  
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      apiKey: encryptedApiKey,
      updatedAt: new Date(),
    }
  });
  
  return {
    ...agent,
    apiKey: newApiKey, // Return the plain API key for display (only time it's visible)
    apiKeyEncrypted: undefined, // Remove encrypted key from response
  };
}

export async function deleteAgent(agentId: string) {
  return prisma.agent.delete({
    where: { id: agentId }
  });
}

export async function getAgentByApiKey(apiKey: string) {
  const agents = await prisma.agent.findMany({
    where: { isActive: true }
  });
  
  // Find agent by comparing decrypted API keys
  for (const agent of agents) {
    try {
      const decryptedKey = decrypt(agent.apiKey);
      if (decryptedKey === apiKey) {
        return {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          url: agent.url,
          owners: agent.owners,
          tags: agent.tags,
          quotasRps: agent.quotasRps,
          lastUsedAt: agent.lastUsedAt,
          usageStats: agent.usageStats,
        };
      }
    } catch (error) {
      // Skip invalid encrypted keys
      continue;
    }
  }
  
  return null;
}

export async function updateAgentUsage(agentId: string, usageStats: any) {
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      lastUsedAt: new Date(),
      usageStats: usageStats,
      updatedAt: new Date(),
    }
  });
  
  return agent;
}

// Generate a secure API key
function generateApiKey(): string {
  const prefix = "raku_agent_";
  const randomPart = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  return prefix + randomPart;
}

