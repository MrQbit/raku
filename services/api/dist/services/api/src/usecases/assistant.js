import { z } from "zod";
import { runAzureChat } from "../integrations/azureOpenAI";
const EndpointSchema = z.object({
    method: z.string(),
    path: z.string(),
    summary: z.string().optional(),
    sampleRequest: z.any().optional(),
    sampleResponse: z.any().optional()
});
const ApiSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    openapi: z.string().optional(),
    endpoints: z.array(EndpointSchema).optional()
});
const AssistantInputSchema = z.object({
    question: z.string(),
    apis: z.union([z.string(), z.array(ApiSchema)]).optional(),
    context: z.record(z.any()).optional()
});
const AssistantPlanSchema = z.object({
    summary: z.string(),
    highLevelSteps: z.array(z.string()),
    mcpRegistration: z
        .object({
        samplePayload: z.record(z.any()),
        validationChecklist: z.array(z.string()).optional(),
        followUp: z.array(z.string()).optional()
    })
        .optional(),
    recommendedAutomation: z.array(z.string()).optional(),
    nextQuestions: z.array(z.string()).optional()
});
function normalizeApis(apis) {
    if (!apis)
        return "";
    if (typeof apis === "string")
        return apis;
    return JSON.stringify(apis, null, 2);
}
function buildMessages(input) {
    const contextParts = [];
    contextParts.push(`User question:\n${input.question}`);
    const apis = normalizeApis(input.apis);
    if (apis.trim().length) {
        contextParts.push(`Known API context (may include OpenAPI excerpts):\n${apis}`);
    }
    if (input.context && Object.keys(input.context).length > 0) {
        contextParts.push(`Additional context:\n${JSON.stringify(input.context, null, 2)}`);
    }
    const userContent = contextParts.join("\n\n");
    const systemContent = [
        "You are RAKU's built-in enablement agent.",
        "Assist platform engineers in using the MCP control plane, especially when preparing to register new Model Context Protocol (MCP) integrations.",
        "Always respond with valid JSON and no markdown. The JSON must match this schema:",
        JSON.stringify({
            summary: "string",
            highLevelSteps: ["string"],
            mcpRegistration: {
                samplePayload: {
                    id: "string",
                    name: "string",
                    baseUrl: "string",
                    capabilities: [{ intent: "string", verbs: ["list", "get", "create", "update", "delete", "action"] }]
                },
                validationChecklist: ["string"],
                followUp: ["string"]
            },
            recommendedAutomation: ["string"],
            nextQuestions: ["string"]
        }, null, 2),
        "Focus on synthesizing existing API descriptions, highlight gaps that the engineer should fill, and recommend concrete next actions inside RAKU (pack builder, policy setup, registration calls)."
    ].join("\n");
    return [
        { role: "system", content: systemContent },
        { role: "user", content: userContent }
    ];
}
function tryParseJson(raw) {
    const direct = safeParse(raw);
    if (direct)
        return direct;
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
        const sliced = raw.slice(start, end + 1);
        return safeParse(sliced);
    }
    return null;
}
function safeParse(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
}
export async function planMcpAssistant(body) {
    let parsed;
    try {
        parsed = AssistantInputSchema.parse(body);
    }
    catch (error) {
        return { status: "error", code: "validation", message: error?.message ?? "Invalid request" };
    }
    const messages = buildMessages(parsed);
    const azure = await runAzureChat(messages, { temperature: 0.1, maxTokens: 1400 });
    if (!azure.ok) {
        if (azure.reason === "not_configured") {
            return { status: "not_configured", message: azure.error };
        }
        return { status: "error", code: "upstream", message: azure.error };
    }
    const raw = azure.message.trim();
    const parsedPlan = tryParseJson(raw);
    if (parsedPlan) {
        const validated = AssistantPlanSchema.safeParse(parsedPlan);
        if (validated.success) {
            return { status: "ok", plan: validated.data, raw };
        }
    }
    return { status: "partial", raw, message: "Assistant response could not be parsed as structured plan." };
}
