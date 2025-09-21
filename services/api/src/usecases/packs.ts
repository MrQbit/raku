export async function listPacks() {
  return [{ id: "00000000-0000-0000-0000-000000000002", namespace: "billing.invoice", version: "1.0.0", intents: [] }];
}
export async function getPack(id: string) {
  return { id, namespace: "billing.invoice", version: "1.0.0", intents: [] };
}
export async function upsertPack(body: any) {
  return { ok: true, id: body?.id ?? "00000000-0000-0000-0000-000000000002" };
}
