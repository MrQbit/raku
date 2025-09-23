import crypto from "node:crypto";
import prisma from "../db/client";
function redact(obj) {
    const SENSITIVE = ["email", "phone", "ssn", "password", "token", "secret"];
    const clone = JSON.parse(JSON.stringify(obj ?? {}));
    function mask(o) {
        if (Array.isArray(o))
            return o.map(mask);
        if (o && typeof o === "object") {
            for (const k of Object.keys(o)) {
                if (SENSITIVE.includes(k.toLowerCase()))
                    o[k] = "***";
                else
                    o[k] = mask(o[k]);
            }
        }
        return o;
    }
    return mask(clone);
}
export async function recordTrace({ body, route, status, latency, output, error }) {
    const id = crypto.randomUUID();
    await prisma.trace.create({
        data: {
            id,
            conversationId: body?.context?.conversationId ?? null,
            agentId: body?.context?.agentId ?? "unknown",
            intent: body?.intent ?? "unknown",
            routeJson: route,
            inputRedacted: redact(body?.inputs ?? {}),
            outputRedacted: output ? redact(output) : null,
            latencyMs: latency ?? 0,
            cost: null,
            status: String(status ?? "ok")
        }
    });
    return id;
}
export { redact };
