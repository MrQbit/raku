import prisma from "../db/client";

export async function listPacks() {
  const rows = await prisma.pack.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((p) => ({ id: p.id, namespace: p.namespace, version: p.version, intents: p.intentsJson }));
}

export async function getPack(id: string) {
  const p = await prisma.pack.findUnique({ where: { id } });
  if (!p) return null as any;
  return { id: p.id, namespace: p.namespace, version: p.version, intents: p.intentsJson };
}

export async function upsertPack(body: any) {
  const created = await prisma.pack.upsert({
    where: { id: body.id ?? "" },
    update: {
      namespace: body.namespace,
      version: body.version,
      intentsJson: body.intents,
      errorModel: body.errorModel ?? [],
      policies: body.policies ?? []
    },
    create: {
      id: body.id,
      namespace: body.namespace,
      version: body.version,
      intentsJson: body.intents,
      errorModel: body.errorModel ?? [],
      policies: body.policies ?? []
    }
  });
  return { ok: true, id: created.id };
}
