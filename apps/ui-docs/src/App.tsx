import React from "react";

const apiBase = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

const TsSnippet = [
  'import fetch from "node-fetch";',
  "",
  `const API = process.env.RAKU_BASE || "${apiBase}";`,
  "async function run() {",
  '  const resp = await fetch(`${API}/v1/route/execute`, {',
  '    method: "POST",',
  '    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.RAKU_TOKEN}` },',
  '    body: JSON.stringify({',
  '      intent: "sample.math.add",',
  '      inputs: { a: 2, b: 3 },',
  '      context: { env: "dev" }',
  '    })',
  '  });',
  '  console.log(await resp.json());',
  '}',
  'run().catch(console.error);'
].join("\n");

const PySnippet = `import os, requests, json
API = os.environ.get("RAKU_BASE","${apiBase}")
headers = {"content-type":"application/json", "authorization": f"Bearer {os.environ.get('RAKU_TOKEN','dev')}"}
payload = {"intent":"sample.math.add","inputs":{"a":2,"b":3},"context":{"env":"dev"}}
r = requests.post(f"{API}/v1/route/execute", headers=headers, data=json.dumps(payload))
print(r.json())`;

export default function App() {
  const [question, setQuestion] = React.useState("");
  const [apiNotes, setApiNotes] = React.useState("");
  const [assistantResponse, setAssistantResponse] = React.useState<string | null>(null);
  const [assistantError, setAssistantError] = React.useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = React.useState(false);

  const askCopilot = async () => {
    if (!question.trim()) {
      setAssistantError("Provide a question or goal for the assistant.");
      return;
    }
    setAssistantLoading(true);
    setAssistantError(null);
    setAssistantResponse(null);
    try {
      const payload: Record<string, unknown> = { question: question.trim() };
      if (apiNotes.trim()) payload.apis = apiNotes.trim();
      const res = await fetch(`${apiBase}/v1/assistant/mcp-planner`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setAssistantError(data?.message || "Assistant request failed");
        if (data?.raw) setAssistantResponse(data.raw);
        return;
      }
      if (data?.status === "ok" && data?.plan) {
        setAssistantResponse(JSON.stringify(data.plan, null, 2));
      } else if (data?.status === "partial") {
        setAssistantResponse(data.raw);
        setAssistantError(data.message || "Assistant response was unstructured");
      } else if (data?.status === "not_configured") {
        setAssistantError(data.message || "Azure OpenAI is not configured");
      } else {
        setAssistantResponse(JSON.stringify(data, null, 2));
      }
    } catch (error: any) {
      setAssistantError(error?.message || "Assistant request failed");
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1>RAKU — Documentation & Onboarding</h1>
      <h2>Overview</h2>
      <p>RAKU is the MCP control plane and router. It catalogs internal/third-party MCPs, enforces policies, and provides a single endpoint for agents.</p>

      <h2>Connect an Agent (zero/low code)</h2>
      <ol>
        <li>Obtain a <code>RAKU_TOKEN</code> (OIDC/OAuth or API key).</li>
        <li>Point your agent’s tool execution to <code>{apiBase}/v1/route/execute</code>.</li>
        <li>Send <code>{"{ intent, inputs, context }"}</code>. Router will select the right MCP/Pack.</li>
      </ol>
      <h3>TypeScript Quick Start</h3>
      <pre><code>{TsSnippet}</code></pre>

      <h3>Python Quick Start</h3>
      <pre><code>{PySnippet}</code></pre>

      <h2>Register a Third-Party MCP</h2>
      <p>Ask the provider for base URL and capabilities (or discover via <code>/meta</code> if supported). Then POST to RAKU:</p>
      <pre><code>{`curl -X POST ${apiBase}/v1/integrations/mcp/register \
  -H "content-type: application/json" \
  -d '{
    "id":"00000000-0000-0000-0000-000000000777",
    "name":"sample-mcp",
    "baseUrl":"http://localhost:9091",
    "healthEndpoint":"/health",
    "auth":{"type":"none"},
    "capabilities":[
      {"intent":"sample.echo","verbs":["action"]},
      {"intent":"sample.math.add","verbs":["action"]}
    ],
    "owners":["team@example.com"],
    "env":"dev",
    "tags":["demo"]
  }'`}</code></pre>

      <h2>Ask RAKU Copilot</h2>
      <p>
        Share your goal and any API snippets. The built-in assistant (backed by Azure OpenAI) returns a plan plus a draft payload
        for <code>/v1/integrations/mcp/register</code>.
      </p>
      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>What would you like to accomplish?</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            placeholder="e.g. Plan an MCP pack for the billing API"
            style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5f5", fontFamily: "monospace" }}
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>API context (plain text or JSON)</span>
          <textarea
            value={apiNotes}
            onChange={(event) => setApiNotes(event.target.value)}
            rows={6}
            placeholder='{ "name": "Billing", "endpoints": [{ "method": "POST", "path": "/v1/invoices" }] }'
            style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5f5", fontFamily: "monospace" }}
          />
        </label>
        <button onClick={askCopilot} disabled={assistantLoading} style={{ width: "fit-content" }}>
          {assistantLoading ? "Thinking..." : "Ask RAKU Copilot"}
        </button>
        {assistantError ? (
          <div style={{ color: "#b91c1c" }}>{assistantError}</div>
        ) : null}
        {assistantResponse ? (
          <pre style={{ background: "#0f172a", color: "#f8fafc", padding: 12, borderRadius: 8, overflowX: "auto" }}>
            <code>{assistantResponse}</code>
          </pre>
        ) : null}
      </div>

      <h2>Admin Tasks</h2>
      <ul>
        <li>Create Packs from internal APIs (Pack Builder UI).</li>
        <li>Set policies & approvals (Policy UI).</li>
        <li>Monitor traces & metrics (Observability UI).</li>
        <li>Use A2A console for mediated agent handoffs.</li>
      </ul>

      <h2>Enterprise Deployment</h2>
      <p>Use <code>ops/docker-compose.enterprise.yml</code> or managed Postgres/Redis/Kafka/ClickHouse. Put NGINX/API Gateway in front with OIDC/mTLS, rate limiting, and WAF.</p>
    </div>
  );
}
