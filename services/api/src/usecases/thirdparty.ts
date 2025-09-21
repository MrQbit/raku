import { ThirdPartyMcp as ThirdPartyMcpSchema } from "@raku/contracts";
import { z } from "zod";
const inmem: any[] = [];
export async function registerThirdPartyMcp(body: unknown) {
  const parsed = ThirdPartyMcpSchema.parse(body);
  inmem.push(parsed); return { id: parsed.id, ok: true };
}
export async function listThirdPartyMcps(query?: { env?: string; tag?: string }) {
  return inmem.filter((m) => (query?.env ? m.env === query.env : true) && (query?.tag ? m.tags?.includes(query.tag) : true));
}
export async function getThirdPartyMcp(id: string) {
  return inmem.find((m) => m.id === id) ?? null;
}
