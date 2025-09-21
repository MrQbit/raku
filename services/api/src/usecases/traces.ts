export async function listTraces(q: any) {
  return [{ id: "t1", agentId: "agent-123", intent: q?.intent ?? "sample.math.add", status: "ok", latencyMs: 120 }];
}
