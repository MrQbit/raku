import { pickRouteForIntent } from "../domain/routing";
import { enforcePolicies } from "../domain/policy";
import { callAdapter } from "../domain/adapters";
import { recordTrace } from "../domain/tracing";
export async function executeIntent(body) {
    const { route } = await pickRouteForIntent(body.intent, body.preferVersion, body.context);
    await enforcePolicies({ intent: body.intent, context: body.context, route });
    const started = Date.now();
    try {
        const result = await callAdapter({ route, inputs: body.inputs, context: body.context });
        const latency = Date.now() - started;
        const traceId = await recordTrace({ body, route, status: "ok", latency, output: result });
        return { status: "ok", result, traceId };
    }
    catch (e) {
        if (e?.code === "ASYNC_JOB_STARTED") {
            const latency = Date.now() - started;
            const traceId = await recordTrace({ body, route, status: "async", latency });
            return { status: "async", jobId: e.jobId, traceId };
        }
        const latency = Date.now() - started;
        const traceId = await recordTrace({ body, route, status: "error", latency, error: e });
        return { status: "error", traceId };
    }
}
