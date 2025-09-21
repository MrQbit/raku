type ThirdPartyCandidate = { id: string; packId?: string; version?: string };

export async function pickRouteForIntent(intent: string, preferVersion?: string, ctx?: any) {
  // TODO: 1) query internal Route table; 2) fallback to ThirdPartyMcp.capabilities match
  const thirdPartyCandidate = null as ThirdPartyCandidate | null; // TODO: lookup by intent/env/status
  if (thirdPartyCandidate) {
    return {
      route: {
        intent,
        target: {
          serverId: thirdPartyCandidate.id,
          packId: thirdPartyCandidate.packId ?? "thirdparty",
          version: thirdPartyCandidate.version ?? "ext"
        }
      },
      policyContext: { source: "thirdparty" }
    };
  }
  return { route: { intent, target: { serverId: "00000000-0000-0000-0000-000000000001", packId: "00000000-0000-0000-0000-000000000002", version: preferVersion ?? "1.0.0" } }, policyContext: {} };
}
