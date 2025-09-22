import { ThirdPartyMcp as ThirdPartyMcpSchema } from "@raku/contracts";
import prisma from "../db/client";

export async function registerThirdPartyMcp(body: unknown) {
  const parsed = ThirdPartyMcpSchema.parse(body);
  await prisma.thirdPartyMcp.upsert({
    where: { id: parsed.id },
    update: {
      name: parsed.name,
      description: parsed.description,
      baseUrl: parsed.baseUrl,
      authType: parsed.auth.type,
      authHeader: parsed.auth.headerName,
      secretRef: parsed.auth.secretRef,
      healthEndpoint: parsed.healthEndpoint,
      capabilities: parsed.capabilities as any,
      owners: parsed.owners,
      env: parsed.env,
      status: parsed.status,
      tags: parsed.tags
    },
    create: {
      id: parsed.id,
      name: parsed.name,
      description: parsed.description,
      baseUrl: parsed.baseUrl,
      authType: parsed.auth.type,
      authHeader: parsed.auth.headerName,
      secretRef: parsed.auth.secretRef,
      healthEndpoint: parsed.healthEndpoint,
      capabilities: parsed.capabilities as any,
      owners: parsed.owners,
      env: parsed.env,
      status: parsed.status,
      tags: parsed.tags
    }
  });
  return { id: parsed.id, ok: true };
}

export async function listThirdPartyMcps(query?: { env?: string; tag?: string }) {
  const where: any = {};
  if (query?.env) where.env = query.env;
  if (query?.tag) where.tags = { has: query.tag };
  return prisma.thirdPartyMcp.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getThirdPartyMcp(id: string) {
  return prisma.thirdPartyMcp.findUnique({ where: { id } });
}
