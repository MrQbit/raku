import prisma from "../db/client";
export async function pickRouteForIntent(intent, preferVersion, ctx) {
    // 1) Prefer explicit internal routes
    const explicit = await prisma.route.findFirst({ where: { intent }, orderBy: { createdAt: "desc" } });
    if (explicit) {
        return {
            route: { intent, target: { serverId: explicit.serverId, packId: explicit.packId, version: explicit.version } },
            policyContext: { source: "route_table" }
        };
    }
    // 2) Fallback to ThirdPartyMcp capability match in requested env (if any)
    const where = { status: "healthy" };
    if (ctx?.env)
        where.env = ctx.env;
    const mcps = await prisma.thirdPartyMcp.findMany({ where });
    const match = mcps.find((m) => Array.isArray(m.capabilities) && m.capabilities.some((c) => c?.intent === intent));
    if (match) {
        return {
            route: { intent, target: { serverId: match.id, packId: "thirdparty", version: preferVersion ?? "ext" } },
            policyContext: { source: "thirdparty", env: match.env }
        };
    }
    throw new Error(`No route found for intent '${intent}'`);
}
