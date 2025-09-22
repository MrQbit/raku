import prisma from "../db/client";

export async function discoverRoutes(intent: string) {
  const mcps = await prisma.thirdPartyMcp.findMany({ where: { status: "healthy" } });
  const candidates = mcps
    .filter((m: any) => Array.isArray(m.capabilities) && (m.capabilities as any[]).some((c: any) => c?.intent === intent))
    .map((m) => ({ serverId: m.id, packId: "thirdparty", version: "ext" }));
  return { candidates };
}
