import React from "react";

type Server = { id: string; name: string; env: string; status: string; version: string };

export default function App() {
  const [servers, setServers] = React.useState<Server[]>([]);
  React.useEffect(() => {
    fetch(`${(import.meta as any).env?.VITE_API_BASE || "http://localhost:8080"}/v1/servers`)
      .then(r => r.json()).then(setServers).catch(console.error);
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <h1>Servers</h1>
      <table>
        <thead><tr><th>Name</th><th>Env</th><th>Status</th><th>Version</th></tr></thead>
        <tbody>
          {servers.map(s => (
            <tr key={s.id}><td>{s.name}</td><td>{s.env}</td><td>{s.status}</td><td>{s.version}</td></tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: 24 }}>Third-Party MCPs</h2>
      <ThirdPartyMcps />
    </div>
  );
}

function ThirdPartyMcps() {
  const [mcps, setMcps] = React.useState<any[]>([]);
  const api = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";
  React.useEffect(() => {
    fetch(`${api}/v1/integrations/mcp`).then(r => r.json()).then(setMcps).catch(console.error);
  }, []);
  const onRegister = async () => {
    const payload = {
      id: crypto.randomUUID(),
      name: "sample-mcp",
      baseUrl: "http://localhost:9091",
      auth: { type: "none" },
      capabilities: [
        { intent: "sample.echo", verbs: ["action"] },
        { intent: "sample.math.add", verbs: ["action"] }
      ],
      env: "dev", tags: ["demo"], owners: ["team@example.com"]
    };
    await fetch(`${api}/v1/integrations/mcp/register`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload)
    });
    const list = await fetch(`${api}/v1/integrations/mcp`).then(r=>r.json());
    setMcps(list);
  };
  return (
    <div>
      <button onClick={onRegister}>Register Sample MCP</button>
      <table>
        <thead><tr><th>Name</th><th>Env</th><th>Status</th><th>Base URL</th></tr></thead>
        <tbody>
          {mcps.map(m => (<tr key={m.id}><td>{m.name}</td><td>{m.env}</td><td>{m.status}</td><td>{m.baseUrl}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
}
