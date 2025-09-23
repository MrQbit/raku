import { getAgentByApiKey } from "./usecases/agents";
// Enhanced API key validation with agent support
export async function validateApiKey(request, reply) {
    const legacyApiKey = process.env.RAKU_API_KEY;
    const authHeader = request.headers.authorization;
    // Skip auth for development if no API key is set
    if (!legacyApiKey && !authHeader && !request.headers["x-api-key"]) {
        console.log("⚠️  Development mode: API authentication disabled");
        return;
    }
    let providedApiKey;
    // Check for Bearer token
    if (authHeader && authHeader.startsWith("Bearer ")) {
        providedApiKey = authHeader.substring(7);
    }
    // Check for X-API-Key header
    if (!providedApiKey) {
        providedApiKey = request.headers["x-api-key"];
    }
    if (!providedApiKey) {
        reply.code(401).send({
            error: "Unauthorized",
            message: "Valid API key required. Use 'Authorization: Bearer your-key' or 'X-API-Key: your-key' header."
        });
        return;
    }
    // First check legacy admin API key
    if (legacyApiKey && providedApiKey === legacyApiKey) {
        // Add admin context to request
        request.user = { type: "admin", permissions: ["*"] };
        return;
    }
    // Check if it's a registered agent API key
    const agent = await getAgentByApiKey(providedApiKey);
    if (agent) {
        // Add agent context to request
        request.user = {
            type: "agent",
            agentId: agent.id,
            agentName: agent.name,
            permissions: ["route:execute", "route:discover"]
        };
        return;
    }
    reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid API key. Please register your agent or use a valid admin key."
    });
}
// Generate a simple API key for development
export function generateApiKey() {
    return "raku-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
