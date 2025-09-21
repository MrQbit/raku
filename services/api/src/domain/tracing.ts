import crypto from "node:crypto";

function redact(obj: any): any {
  const SENSITIVE = ["email","phone","ssn","password","token","secret"];
  const clone = JSON.parse(JSON.stringify(obj ?? {}));
  function mask(o: any): any {
    if (Array.isArray(o)) return o.map(mask);
    if (o && typeof o === "object") {
      for (const k of Object.keys(o)) {
        if (SENSITIVE.includes(k.toLowerCase())) o[k] = "***";
        else o[k] = mask(o[k]);
      }
    }
    return o;
  }
  return mask(clone);
}

export async function recordTrace({ body, route, status, latency, output, error }: any) {
  // TODO: Persist to DB + OTEL
  const id = crypto.randomUUID();
  return id;
}

export { redact };
