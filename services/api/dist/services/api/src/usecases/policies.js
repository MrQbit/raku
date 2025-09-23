import prisma from "../db/client";
export async function listPolicies() {
    const rows = await prisma.policy.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((p) => ({ id: p.id, name: p.name, description: p.description, rbac: p.rbacJson, abac: p.abacJson, approvals: p.approvalsJson }));
}
export async function createPolicy(body) {
    const created = await prisma.policy.create({
        data: {
            name: body.name,
            description: body.description,
            rbacJson: body.rbac,
            abacJson: body.abac,
            approvalsJson: body.approvals
        }
    });
    return { id: created.id, name: created.name };
}
