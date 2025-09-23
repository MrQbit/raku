import fetch from "node-fetch";
import prisma from "../db/client";
export async function callAdapter({ route, inputs, context }) {
    if (route?.target?.packId === "thirdparty") {
        const rec = await prisma.thirdPartyMcp.findUnique({ where: { id: route?.target?.serverId } });
        if (!rec)
            throw new Error("Third-party MCP not found");
        const base = rec.baseUrl.replace(/\/$/, "");
        const headers = { "content-type": "application/json" };
        if (rec.authType === "bearer" && rec.authHeader)
            headers["authorization"] = rec.authHeader;
        if (rec.authType === "apiKey" && rec.authHeader)
            headers["x-api-key"] = rec.authHeader;
        const res = await fetch(`${base}/execute`, {
            method: "POST",
            headers,
            body: JSON.stringify({ intent: route.intent, inputs })
        });
        if (res.status === 202) {
            const asyncPayload = (await res.json());
            const err = new Error("async");
            err.code = "ASYNC_JOB_STARTED";
            if (asyncPayload?.jobId)
                err.jobId = asyncPayload.jobId;
            throw err;
        }
        if (!res.ok)
            throw new Error(`Third-party MCP error: ${res.status}`);
        return res.json();
    }
    const base = "http://localhost:9090/mock"; // internal placeholder
    const res = await fetch(`${base}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent: route.intent, inputs })
    });
    if (res.status === 202) {
        const asyncPayload = (await res.json());
        const err = new Error("async");
        err.code = "ASYNC_JOB_STARTED";
        if (asyncPayload?.jobId)
            err.jobId = asyncPayload.jobId;
        throw err;
    }
    if (!res.ok)
        throw new Error(`Backend error: ${res.status}`);
    return res.json();
}
