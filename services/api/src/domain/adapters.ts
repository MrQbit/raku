import fetch from "node-fetch";

export async function callAdapter({ route, inputs, context }: { route: any; inputs: any; context?: any }) {
  if (route?.target?.packId === "thirdparty") {
    // TODO: fetch third-party record by serverId; set auth, call `${baseUrl}/execute`
    const base = "http://localhost:9091"; // placeholder
    const res = await fetch(`${base}/execute`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ intent: route.intent, inputs })
    });
    if (res.status === 202) {
      const asyncPayload = (await res.json()) as { jobId?: string };
      const err: any = new Error("async");
      err.code = "ASYNC_JOB_STARTED";
      if (asyncPayload?.jobId) err.jobId = asyncPayload.jobId;
      throw err;
    }
    if (!res.ok) throw new Error(`Third-party MCP error: ${res.status}`);
    return res.json();
  }

  const base = "http://localhost:9090/mock"; // internal placeholder
  const res = await fetch(`${base}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ intent: route.intent, inputs })
  });
  if (res.status === 202) {
    const asyncPayload = (await res.json()) as { jobId?: string };
    const err: any = new Error("async");
    err.code = "ASYNC_JOB_STARTED";
    if (asyncPayload?.jobId) err.jobId = asyncPayload.jobId;
    throw err;
  }
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}
