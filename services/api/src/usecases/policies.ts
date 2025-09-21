export async function listPolicies() { return [{ id: "p1", name: "default" }]; }
export async function createPolicy(body: any) { return { id: "p2", ...body }; }
