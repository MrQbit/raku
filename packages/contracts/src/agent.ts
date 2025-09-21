export async function rakuExecute(base: string, token: string | undefined, intent: string, inputs: any, context?: any) {
  const res = await fetch(`${base.replace(/\/$/, "")}/v1/route/execute`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ intent, inputs, context })
  });
  if (!res.ok) throw new Error(`RAKU error ${res.status}`);
  return res.json();
}
