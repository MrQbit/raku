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
        intents: p.intentsJson,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        consumingServers: p.servers.map(s => s.server.name)
    }));
}
export async function getPack(id) {
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
    if (!p)
        return null;
    return {
        id: p.id,
        namespace: p.namespace,
        version: p.version,
        description: p.description,
        intents: p.intentsJson,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        consumingServers: p.servers.map(s => s.server.name)
    };
}
export async function createPack(body) {
    const created = await prisma.pack.create({
        data: {
            namespace: body.namespace,
            version: body.version,
            description: body.description,
            intentsJson: body.intentsJson,
            errorModel: body.errorModel ?? [],
            policies: body.policies ?? []
        }
    });
    return created;
}
export async function upsertPack(body) {
    const created = await prisma.pack.upsert({
        where: { id: body.id ?? "" },
        update: {
            namespace: body.namespace,
            version: body.version,
            description: body.description,
            intentsJson: body.intents,
            errorModel: body.errorModel ?? [],
            policies: body.policies ?? []
        },
        create: {
            id: body.id,
            namespace: body.namespace,
            version: body.version,
            description: body.description,
            intentsJson: body.intents,
            errorModel: body.errorModel ?? [],
            policies: body.policies ?? []
        }
    });
    return { ok: true, id: created.id };
}
