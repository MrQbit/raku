import prisma from "../db/client";

export async function listTraces(q: any) {
  const where: any = {};
  if (q?.intent) where.intent = q.intent;
  const rows = await prisma.trace.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  return rows.map((t) => ({ id: t.id, agentId: t.agentId, intent: t.intent, status: t.status, latencyMs: t.latencyMs }));
}
