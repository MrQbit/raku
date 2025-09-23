import prisma from "../db/client";
export async function discoverRoutes(intent) {
    const mcps = await prisma.thirdPartyMcp.findMany({ where: { status: "healthy" } });
    const candidates = mcps
        .filter((m) => Array.isArray(m.capabilities) && m.capabilities.some((c) => c?.intent === intent))
        .map((m) => ({ serverId: m.id, packId: "thirdparty", version: "ext" }));
    return { candidates };
}
