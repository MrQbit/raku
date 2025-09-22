import prisma from "../db/client";

export async function listServers() {
  // Treat ThirdPartyMcp records as servers for catalog purposes
  const tp = await prisma.thirdPartyMcp.findMany({ orderBy: { createdAt: "desc" } });
  return tp.map((m) => ({ id: m.id, name: m.name, env: m.env, status: m.status, version: "ext" }));
}
export async function getServer(id: string) {
  const m = await prisma.thirdPartyMcp.findUnique({ where: { id } });
  if (!m) return null as any;
  return { id: m.id, name: m.name, env: m.env, status: m.status, version: "ext", endpointBaseUrl: m.baseUrl };
}
