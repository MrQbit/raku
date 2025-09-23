const DEFAULT_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-02-01";
function buildUrl(endpoint, deployment, apiVersion) {
    const base = endpoint.replace(/\/$/, "");
    return `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
}
export async function runAzureChat(messages, options) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = DEFAULT_API_VERSION;
    if (!endpoint || !apiKey || !deployment) {
        return { ok: false, reason: "not_configured", error: "Azure OpenAI environment variables are not configured." };
    }
    const temperature = options?.temperature ?? 0.2;
    const maxTokens = options?.maxTokens ?? 1200;
    const url = buildUrl(endpoint, deployment, apiVersion);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify({ messages, temperature, max_tokens: maxTokens })
        });
        if (!response.ok) {
            const text = await response.text().catch(() => response.statusText);
            return { ok: false, error: `Azure OpenAI request failed (${response.status}): ${text}` };
        }
        const payload = await response.json();
        const content = payload?.choices?.[0]?.message?.content ?? "";
        return { ok: true, message: String(content ?? ""), data: payload };
    }
    catch (error) {
        return { ok: false, error: error?.message ?? "Azure OpenAI request error" };
    }
}
