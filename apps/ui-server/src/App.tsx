import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Select, Textarea } from "@raku/ui-foundation";
import "@raku/ui-foundation/dist/tokens.css";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

interface Server {
  id: string;
  name: string;
  env: string;
  status: string;
  version: string;
  endpointBaseUrl?: string;
  type?: "third-party" | "raku-created";
  deploymentId?: string;
  namespace?: string;
  landingZone?: {
    name: string;
    clusterUrl: string;
  };
}

interface Pack {
  id: string;
  namespace: string;
  version: string;
  intents: any[];
}

interface LandingZone {
  id: string;
  name: string;
  clusterUrl: string;
  registryUrl: string;
  namespacePrefix: string;
  isActive: boolean;
}

interface Deployment {
  id: string;
  serverName: string;
  namespace: string;
  status: string;
  deployedAt?: string;
  landingZone: LandingZone;
}

export default function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [serverType, setServerType] = useState<"third-party" | "new-server">("third-party");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [landingZones, setLandingZones] = useState<LandingZone[]>([]);
  
  // Third-party server form data
  const [thirdPartyForm, setThirdPartyForm] = useState({
    name: "",
    env: "dev",
    baseUrl: "",
    authType: "none",
    authHeader: "",
    description: ""
  });
  
  // New server form data
  const [newServerForm, setNewServerForm] = useState({
    serverName: "",
    landingZoneId: "",
    selectedPackIds: [] as string[],
    replicas: 1,
    resources: {
      cpu: "100m",
      memory: "128Mi"
    }
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all servers (third-party + deployments)
      const [serversRes, deploymentsRes, packsRes, landingZonesRes] = await Promise.all([
        fetch(`${API_BASE}/v1/servers`),
        fetch(`${API_BASE}/v1/deployments`),
        fetch(`${API_BASE}/v1/packs`),
        fetch(`${API_BASE}/v1/landing-zones`)
      ]);

      const [thirdPartyServers, deployments, packsData, landingZonesData] = await Promise.all([
        serversRes.json(),
        deploymentsRes.json(),
        packsRes.json(),
        landingZonesRes.json()
      ]);

      // Transform third-party servers
      const transformedThirdParty = thirdPartyServers.map((server: any) => ({
        ...server,
        type: "third-party" as const
      }));

      // Transform deployments to server format
      const transformedDeployments = deployments.map((deployment: any) => ({
        id: deployment.id,
        name: deployment.serverName,
        env: "prod", // Default for deployed servers
        status: deployment.status,
        version: "deployed",
        type: "raku-created" as const,
        deploymentId: deployment.id,
        namespace: deployment.namespace,
        landingZone: deployment.landingZone,
        endpointBaseUrl: `https://${deployment.serverName}.${deployment.landingZone?.clusterUrl}`
      }));

      // Combine all servers
      const allServers = [...transformedThirdParty, ...transformedDeployments];
      setServers(allServers);
      setPacks(packsData);
      setLandingZones(landingZonesData.filter((zone: LandingZone) => zone.isActive));
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServerSelect = async (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setSelectedServer(server);
    }
  };

  const handleThirdPartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/v1/integrations/mcp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: thirdPartyForm.name,
          baseUrl: thirdPartyForm.baseUrl,
          authType: thirdPartyForm.authType,
          authHeader: thirdPartyForm.authHeader || undefined,
          description: thirdPartyForm.description,
          env: thirdPartyForm.env,
          owners: ["admin@company.com"],
          tags: ["registered"]
        })
      });

      if (response.ok) {
        await fetchAllData(); // Refresh data
        setShowCreateForm(false);
        setThirdPartyForm({
          name: "",
          env: "dev",
          baseUrl: "",
          authType: "none",
          authHeader: "",
          description: ""
        });
      }
    } catch (error) {
      console.error("Failed to register third-party server:", error);
    }
  };

  const handleNewServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/v1/servers/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverName: newServerForm.serverName,
          landingZoneId: newServerForm.landingZoneId,
          packIds: newServerForm.selectedPackIds,
          config: {
            replicas: newServerForm.replicas,
            resources: newServerForm.resources
          }
        })
      });

      if (response.ok) {
        await fetchAllData(); // Refresh data
        setShowCreateForm(false);
        setNewServerForm({
          serverName: "",
          landingZoneId: "",
          selectedPackIds: [],
          replicas: 1,
          resources: { cpu: "100m", memory: "128Mi" }
        });
      }
    } catch (error) {
      console.error("Failed to create new server:", error);
    }
  };

  const handlePackSelection = (packId: string, checked: boolean) => {
    setNewServerForm(prev => ({
      ...prev,
      selectedPackIds: checked 
        ? [...prev.selectedPackIds, packId]
        : prev.selectedPackIds.filter(id => id !== packId)
    }));
  };

  const columns = [
    { 
      key: "name", 
      label: "Name",
      render: (name: string, server: Server) => (
        <div>
          <div style={{ fontWeight: "500" }}>{name}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {server.type === "raku-created" ? "RAKU Created" : "Third Party"}
          </div>
        </div>
      )
    },
    { key: "env", label: "Environment" },
    { 
      key: "status", 
      label: "Status",
      render: (status: string) => (
        <span style={{
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "500",
          background: status === "healthy" || status === "running" ? "#dcfce7" : 
                     status === "degraded" || status === "building" || status === "deploying" ? "#fef3c7" : "#fee2e2",
          color: status === "healthy" || status === "running" ? "#166534" : 
                 status === "degraded" || status === "building" || status === "deploying" ? "#92400e" : "#dc2626"
        }}>
          {status}
        </span>
      )
    },
    { 
      key: "version", 
      label: "Version",
      render: (version: string, server: Server) => (
        <div>
          <div>{version}</div>
          {server.namespace && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              NS: {server.namespace}
            </div>
          )}
        </div>
      )
    },
    {
      key: "id",
      label: "Actions",
      render: (id: string, server: Server) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <Button
            size="sm"
            onClick={() => handleServerSelect(id)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            Details
          </Button>
          {server.type === "raku-created" && (
            <Button
              size="sm"
              onClick={() => {
                // TODO: Add scaling/deletion actions for RAKU-created servers
                console.log("Manage deployment:", id);
              }}
              style={{ fontSize: "12px", padding: "4px 8px", background: "#3b82f6", color: "white" }}
            >
              Manage
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: "var(--rku-space-3)" }}>
        <h1>MCP Server Management</h1>
        <p>Loading servers...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <div>
          <h1>MCP Server Management</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Manage third-party MCP servers and create new servers from packs
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          New Server
        </Button>
      </div>

      <div style={{ display: "grid", gap: "var(--rku-space-3)", gridTemplateColumns: selectedServer ? "1fr 400px" : "1fr" }}>
        <Card title={`All MCP Servers (${servers.length})`}>
          <Table data={servers} columns={columns} emptyMessage="No servers found. Create your first server to get started." />
        </Card>

        {selectedServer && (
          <Card title="Server Details">
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <div>
                <strong>Name:</strong> {selectedServer.name}
              </div>
              <div>
                <strong>Type:</strong> {selectedServer.type === "raku-created" ? "RAKU Created" : "Third Party"}
              </div>
              <div>
                <strong>Environment:</strong> {selectedServer.env}
              </div>
              <div>
                <strong>Status:</strong> {selectedServer.status}
              </div>
              <div>
                <strong>Version:</strong> {selectedServer.version}
              </div>
              {selectedServer.endpointBaseUrl && (
                <div>
                  <strong>Endpoint:</strong> {selectedServer.endpointBaseUrl}
                </div>
              )}
              {selectedServer.namespace && (
                <div>
                  <strong>K8s Namespace:</strong> {selectedServer.namespace}
                </div>
              )}
              {selectedServer.landingZone && (
                <div>
                  <strong>Landing Zone:</strong> {selectedServer.landingZone.name}
                </div>
              )}
              <div style={{ marginTop: "var(--rku-space-2)" }}>
                <Button onClick={() => setSelectedServer(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {showCreateForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <Card title="Create New MCP Server" style={{ width: "600px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ marginBottom: "var(--rku-space-3)" }}>
              <div style={{ display: "flex", gap: "var(--rku-space-2)" }}>
                <Button 
                  onClick={() => setServerType("third-party")} 
                  style={{ 
                    background: serverType === "third-party" ? "#3b82f6" : "#f3f4f6",
                    color: serverType === "third-party" ? "white" : "black"
                  }}
                >
                  Register Third-Party Server
                </Button>
                <Button 
                  onClick={() => setServerType("new-server")} 
                  style={{ 
                    background: serverType === "new-server" ? "#3b82f6" : "#f3f4f6",
                    color: serverType === "new-server" ? "white" : "black"
                  }}
                >
                  Create New Server from Packs
                </Button>
              </div>
            </div>

            {serverType === "third-party" ? (
              <form onSubmit={handleThirdPartySubmit} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <Input
                  label="Server Name"
                  value={thirdPartyForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThirdPartyForm({ ...thirdPartyForm, name: e.target.value })}
                  placeholder="e.g., my-api-server"
                  required
                />
                <Select
                  label="Environment"
                  value={thirdPartyForm.env}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setThirdPartyForm({ ...thirdPartyForm, env: e.target.value })}
                  options={[
                    { value: "dev", label: "Development" },
                    { value: "staging", label: "Staging" },
                    { value: "prod", label: "Production" }
                  ]}
                />
                <Input
                  label="Base URL"
                  value={thirdPartyForm.baseUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThirdPartyForm({ ...thirdPartyForm, baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                  required
                />
                <Select
                  label="Authentication Type"
                  value={thirdPartyForm.authType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setThirdPartyForm({ ...thirdPartyForm, authType: e.target.value })}
                  options={[
                    { value: "none", label: "None" },
                    { value: "bearer", label: "Bearer Token" },
                    { value: "api-key", label: "API Key" }
                  ]}
                />
                {thirdPartyForm.authType !== "none" && (
                  <Input
                    label={thirdPartyForm.authType === "bearer" ? "Bearer Token" : "API Key"}
                    value={thirdPartyForm.authHeader}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThirdPartyForm({ ...thirdPartyForm, authHeader: e.target.value })}
                    placeholder={thirdPartyForm.authType === "bearer" ? "your-bearer-token" : "your-api-key"}
                    type="password"
                  />
                )}
                <Textarea
                  label="Description"
                  value={thirdPartyForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setThirdPartyForm({ ...thirdPartyForm, description: e.target.value })}
                  placeholder="Optional description of the server"
                  rows={3}
                />
                <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                  <Button type="submit">Register Server</Button>
                  <Button type="button" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNewServerSubmit} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <Input
                  label="Server Name"
                  value={newServerForm.serverName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewServerForm({ ...newServerForm, serverName: e.target.value })}
                  placeholder="e.g., billing-mcp-server"
                  required
                />

                <Select
                  label="Landing Zone"
                  value={newServerForm.landingZoneId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewServerForm({ ...newServerForm, landingZoneId: e.target.value })}
                  options={[
                    { value: "", label: "Select a landing zone" },
                    ...landingZones.map(zone => ({
                      value: zone.id,
                      label: `${zone.name} (${zone.clusterUrl})`
                    }))
                  ]}
                  required
                />

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    Select Packs to Include
                  </label>
                  <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px" }}>
                    {packs.map(pack => (
                      <div key={pack.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <input
                          type="checkbox"
                          id={pack.id}
                          checked={newServerForm.selectedPackIds.includes(pack.id)}
                          onChange={(e) => handlePackSelection(pack.id, e.target.checked)}
                        />
                        <label htmlFor={pack.id} style={{ flex: 1, fontSize: "14px" }}>
                          {pack.namespace} (v{pack.version}) - {pack.intents?.length || 0} intents
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--rku-space-2)" }}>
                  <Input
                    label="CPU Resources"
                    value={newServerForm.resources.cpu}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewServerForm({ 
                      ...newServerForm, 
                      resources: { ...newServerForm.resources, cpu: e.target.value }
                    })}
                    placeholder="100m"
                  />
                  <Input
                    label="Memory Resources"
                    value={newServerForm.resources.memory}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewServerForm({ 
                      ...newServerForm, 
                      resources: { ...newServerForm.resources, memory: e.target.value }
                    })}
                    placeholder="128Mi"
                  />
                </div>

                <Input
                  label="Replicas"
                  type="number"
                  value={newServerForm.replicas}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewServerForm({ ...newServerForm, replicas: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                />

                <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                  <Button type="submit" disabled={newServerForm.selectedPackIds.length === 0}>
                    Deploy Server
                  </Button>
                  <Button type="button" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
