const DEFAULT_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-02-01";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AzureChatResponse =
  | { ok: true; message: string; data: any }
  | { ok: false; error: string; reason?: "not_configured" };

function buildUrl(endpoint: string, deployment: string, apiVersion: string) {
  const base = endpoint.replace(/\/$/, "");
  return `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
}

export async function runAzureChat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = DEFAULT_API_VERSION;

  if (!endpoint || !apiKey || !deployment) {
    return { ok: false as const, reason: "not_configured" as const, error: "Azure OpenAI environment variables are not configured." };
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
      return { ok: false as const, error: `Azure OpenAI request failed (${response.status}): ${text}` };
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content ?? "";
    return { ok: true as const, message: String(content ?? ""), data: payload };
  } catch (error: any) {
    return { ok: false as const, error: error?.message ?? "Azure OpenAI request error" };
  }
}
