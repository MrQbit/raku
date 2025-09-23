import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Select } from "@raku/ui-foundation";
import "@raku/ui-foundation/dist/tokens.css";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

interface Pack {
  id: string;
  namespace: string;
  version: string;
  description?: string;
  intents: any[];
  createdAt: string;
  updatedAt: string;
  consumingServers?: string[];
}

interface Server {
  id: string;
  name: string;
  type: "third-party" | "raku-created";
  version?: string;
  status?: string;
  endpointBaseUrl?: string;
  namespace?: string;
  landingZone?: {
    name: string;
    clusterUrl: string;
  };
  packs?: string[];
  env?: string;
}

interface LandingZone {
  id: string;
  name: string;
  clusterUrl: string;
  registryUrl: string;
  namespacePrefix: string;
  isActive: boolean;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  url?: string;
  isActive: boolean;
  owners: string[];
  tags: string[];
  quotasRps?: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [landingZones, setLandingZones] = useState<LandingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "servers" | "packs" | "agents">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Pack | Server | Agent | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Server creation form data (for pack-to-server flow)
  const [serverFormData, setServerFormData] = useState({
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
      
      const [packsRes, serversRes, agentsRes, deploymentsRes, landingZonesRes] = await Promise.all([
        fetch(`${API_BASE}/v1/packs`),
        fetch(`${API_BASE}/v1/servers`),
        fetch(`${API_BASE}/v1/agents`),
        fetch(`${API_BASE}/v1/deployments`),
        fetch(`${API_BASE}/v1/landing-zones`)
      ]);

      const [packsData, serversData, agentsData, deploymentsData, landingZonesData] = await Promise.all([
        packsRes.json(),
        serversRes.json(),
        agentsRes.json(),
        deploymentsRes.json(),
        landingZonesRes.json()
      ]);

      // Transform servers to include both third-party and RAKU-created
      const transformedServers = [
        ...serversData.map((server: any) => ({ ...server, type: "third-party" as const })),
        ...deploymentsData.map((deployment: any) => ({
          id: deployment.id,
          name: deployment.serverName,
          type: "raku-created" as const,
          status: deployment.status,
          namespace: deployment.namespace,
          landingZone: deployment.landingZone,
          packs: deployment.configJson?.packs?.map((p: any) => p.id) || []
        }))
      ];

      setPacks(packsData);
      setServers(transformedServers);
      setAgents(agentsData);
      setLandingZones(landingZonesData);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: Pack | Server | Agent) => {
    setSelectedItem(item);
  };

  const handlePackToServer = (pack: Pack) => {
    setServerFormData(prev => ({
      ...prev,
      selectedPackIds: [pack.id]
    }));
    setShowCreateForm(true);
  };

  const handleServerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE}/v1/servers/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverName: serverFormData.serverName,
          landingZoneId: serverFormData.landingZoneId,
          packIds: serverFormData.selectedPackIds,
          config: {
            replicas: serverFormData.replicas,
            resources: serverFormData.resources
          }
        })
      });

      if (response.ok) {
        await fetchAllData(); // Refresh data
        setShowCreateForm(false);
        setSelectedItem(null);
        setServerFormData({
          serverName: "",
          landingZoneId: "",
          selectedPackIds: [],
          replicas: 1,
          resources: { cpu: "100m", memory: "128Mi" }
        });
      }
    } catch (error) {
      console.error("Failed to create server:", error);
    }
  };

  const filteredItems = () => {
    let items: (Pack | Server | Agent)[] = [];
    
    if (filter === "all") {
      items = [...packs, ...servers, ...agents];
    } else if (filter === "packs") {
      items = packs;
    } else if (filter === "servers") {
      items = servers;
    } else if (filter === "agents") {
      items = agents;
    }

    if (searchTerm) {
      items = items.filter(item => {
        const isPack = 'namespace' in item;
        const isAgent = 'owners' in item;
        const name = isPack ? (item as Pack).namespace : isAgent ? (item as Agent).name : (item as Server).name;
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (isPack && (item as Pack).namespace?.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    return items;
  };

  const renderItemCard = (item: Pack | Server | Agent) => {
    const isPack = 'namespace' in item;
    const isAgent = 'owners' in item;
    const displayName = isPack ? (item as Pack).namespace : isAgent ? (item as Agent).name : (item as Server).name;
    
    return (
      <Card 
        key={item.id} 
        title={displayName}
        style={{ 
          cursor: "pointer",
          border: selectedItem?.id === item.id ? "2px solid #3b82f6" : "1px solid #e5e7eb",
          background: selectedItem?.id === item.id ? "#f8fafc" : "white"
        }}
        onClick={() => handleItemSelect(item)}
      >
        <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
          {isPack ? (
            <>
              <div>
                <strong>Namespace:</strong> {(item as Pack).namespace}
              </div>
              <div>
                <strong>Version:</strong> {(item as Pack).version}
              </div>
              <div>
                <strong>Tools:</strong> {(item as Pack).intents?.length || 0}
              </div>
              <div>
                <strong>Used by:</strong> {(item as Pack).consumingServers?.length || 0} servers
              </div>
              {(item as Pack).description && (
                <div>
                  <strong>Description:</strong> {(item as Pack).description}
                </div>
              )}
              <div style={{ marginTop: "var(--rku-space-2)" }}>
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePackToServer(item as Pack);
                  }}
                  style={{ background: "#3b82f6", color: "white" }}
                >
                  Create Server from Pack
                </Button>
              </div>
            </>
          ) : isAgent ? (
            <>
              <div>
                <strong>Agent Name:</strong> {(item as Agent).name}
              </div>
              {(item as Agent).description && (
                <div>
                  <strong>Description:</strong> {(item as Agent).description}
                </div>
              )}
              {(item as Agent).url && (
                <div>
                  <strong>URL:</strong> {(item as Agent).url}
                </div>
              )}
              <div>
                <strong>Status:</strong> 
                <span style={{
                  background: (item as Agent).isActive ? "#10b981" : "#ef4444",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "500",
                  marginLeft: "8px"
                }}>
                  {(item as Agent).isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <strong>Rate Limit:</strong> {(item as Agent).quotasRps || 100} req/sec
              </div>
              <div>
                <strong>Last Used:</strong> {(item as Agent).lastUsedAt ? new Date((item as Agent).lastUsedAt!).toLocaleDateString() : "Never"}
              </div>
            </>
          ) : (
            <>
              <div>
                <strong>Type:</strong> {(item as Server).type === "raku-created" ? "RAKU Created" : "Third Party"}
              </div>
              {(item as Server).version && (
                <div>
                  <strong>Version:</strong> {(item as Server).version}
                </div>
              )}
              <div>
                <strong>Status:</strong> 
                <span style={{
                  marginLeft: "8px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  background: (item as Server).status === "running" ? "#dcfce7" : "#fef3c7",
                  color: (item as Server).status === "running" ? "#166534" : "#92400e"
                }}>
                  {(item as Server).status || "unknown"}
                </span>
              </div>
              {(item as Server).endpointBaseUrl && (
                <div>
                  <strong>Endpoint:</strong> {(item as Server).endpointBaseUrl}
                </div>
              )}
              {(item as Server).namespace && (
                <div>
                  <strong>Namespace:</strong> {(item as Server).namespace}
                </div>
              )}
              <div>
                <strong>Packs:</strong> {(item as Server).packs?.length || 0}
              </div>
            </>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "var(--rku-space-3)" }}>
        <h1>MCP Catalog</h1>
        <p>Loading catalog...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <div>
          <h1>MCP Catalog</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Browse and select MCP servers and packs to use in your applications
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ display: "flex", gap: "var(--rku-space-3)", marginBottom: "var(--rku-space-3)" }}>
        <Select
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as any)}
          options={[
            { value: "all", label: "All Items" },
            { value: "servers", label: "Servers Only" },
            { value: "packs", label: "Packs Only" },
            { value: "agents", label: "Agents Only" }
          ]}
        />
        <Input
          placeholder="Search servers, packs, and agents..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: "grid", gap: "var(--rku-space-3)", gridTemplateColumns: selectedItem ? "2fr 1fr" : "1fr" }}>
        {/* Items Grid */}
        <div>
          <h2 style={{ marginBottom: "var(--rku-space-2)" }}>
            {filter === "all" ? "All Items" : filter === "servers" ? "MCP Servers" : filter === "agents" ? "Registered Agents" : "MCP Packs"} 
            ({filteredItems().length})
          </h2>
          <div style={{ 
            display: "grid", 
            gap: "var(--rku-space-3)", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" 
          }}>
            {filteredItems().map(renderItemCard)}
          </div>
        </div>

        {/* Item Details */}
        {selectedItem && (
          <Card title={`${'namespace' in selectedItem ? 'Pack' : 'owners' in selectedItem ? 'Agent' : 'Server'} Details`}>
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              {'namespace' in selectedItem ? (
                // Pack Details
                <>
                  <div><strong>Name:</strong> {(selectedItem as Pack).namespace}</div>
                  <div><strong>Namespace:</strong> {(selectedItem as Pack).namespace}</div>
                  <div><strong>Version:</strong> {(selectedItem as Pack).version}</div>
                  <div><strong>Tools:</strong> {(selectedItem as Pack).intents?.length || 0}</div>
                  <div><strong>Used by Servers:</strong> {(selectedItem as Pack).consumingServers?.length || 0}</div>
                  {(selectedItem as Pack).description && (
                    <div><strong>Description:</strong> {(selectedItem as Pack).description}</div>
                  )}
                  
                  <div>
                    <strong>Available Tools:</strong>
                    <div style={{ marginTop: "8px", maxHeight: "200px", overflow: "auto" }}>
                      {(selectedItem as Pack).intents?.map((intent: any, index: number) => (
                        <div key={index} style={{
                          padding: "4px 8px",
                          background: "#f9fafb",
                          borderRadius: "4px",
                          margin: "2px 0",
                          fontSize: "12px"
                        }}>
                          <strong>{intent.name || intent.intent}</strong>
                          {intent.description && (
                            <div style={{ color: "#6b7280" }}>{intent.description}</div>
                          )}
                          {intent.method && intent.path && (
                            <div style={{ color: "#6b7280" }}>{intent.method} {intent.path}</div>
                          )}
                        </div>
                      )) || "No tools defined"}
                    </div>
                  </div>

                  <div style={{ marginTop: "var(--rku-space-2)" }}>
                    <Button 
                      onClick={() => handlePackToServer(selectedItem as Pack)}
                      style={{ background: "#3b82f6", color: "white" }}
                    >
                      Create Server from This Pack
                    </Button>
                  </div>
                </>
              ) : 'owners' in selectedItem ? (
                // Agent Details
                <>
                  <div><strong>Name:</strong> {(selectedItem as Agent).name}</div>
                  {(selectedItem as Agent).description && (
                    <div><strong>Description:</strong> {(selectedItem as Agent).description}</div>
                  )}
                  {(selectedItem as Agent).url && (
                    <div><strong>URL:</strong> {(selectedItem as Agent).url}</div>
                  )}
                  <div><strong>Status:</strong> {(selectedItem as Agent).isActive ? "Active" : "Inactive"}</div>
                  <div><strong>Owners:</strong> {(selectedItem as Agent).owners.join(", ")}</div>
                  <div><strong>Tags:</strong> {(selectedItem as Agent).tags.join(", ") || "None"}</div>
                  {(selectedItem as Agent).quotasRps && (
                    <div><strong>Rate Limit:</strong> {(selectedItem as Agent).quotasRps} RPS</div>
                  )}
                  <div><strong>Last Used:</strong> {(selectedItem as Agent).lastUsedAt ? new Date((selectedItem as Agent).lastUsedAt!).toLocaleDateString() : "Never"}</div>
                  <div><strong>Created:</strong> {new Date((selectedItem as Agent).createdAt).toLocaleDateString()}</div>
                </>
              ) : (
                // Server Details
                <>
                  <div><strong>Name:</strong> {selectedItem.name}</div>
                  <div><strong>Type:</strong> {(selectedItem as Server).type === "raku-created" ? "RAKU Created" : "Third Party"}</div>
                  {(selectedItem as Server).version && (
                    <div><strong>Version:</strong> {(selectedItem as Server).version}</div>
                  )}
                  <div><strong>Status:</strong> {(selectedItem as Server).status || "unknown"}</div>
                  {(selectedItem as Server).endpointBaseUrl && (
                    <div><strong>Endpoint:</strong> {(selectedItem as Server).endpointBaseUrl}</div>
                  )}
                  {(selectedItem as Server).namespace && (
                    <div><strong>K8s Namespace:</strong> {(selectedItem as Server).namespace}</div>
                  )}
                  {(selectedItem as Server).landingZone && (
                    <div><strong>Landing Zone:</strong> {(selectedItem as Server).landingZone?.name}</div>
                  )}
                  <div><strong>Packs:</strong> {(selectedItem as Server).packs?.length || 0}</div>

                  <div>
                    <strong>Connection Instructions:</strong>
                    <div style={{ 
                      marginTop: "8px", 
                      padding: "12px", 
                      background: "#f8fafc", 
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}>
                      <div><strong>1. Authentication:</strong></div>
                      <div style={{ marginLeft: "16px", marginBottom: "8px" }}>
                        Add to your agent configuration:
                      </div>
                      <div style={{ 
                        background: "#1f2937", 
                        color: "#f9fafb", 
                        padding: "8px", 
                        borderRadius: "4px",
                        marginBottom: "8px"
                      }}>
                        {`{
  "mcpServers": {
    "raku-router": {
      "command": "npx",
      "args": ["@raku/router-client"],
      "env": {
        "RAKU_ROUTER_URL": "${(selectedItem as Server).endpointBaseUrl || 'http://localhost:8080'}",
        "RAKU_API_KEY": "your-api-key-here"
      }
    }
  }
}`}
                      </div>
                      
                      <div><strong>2. Usage Example:</strong></div>
                      <div style={{ 
                        background: "#1f2937", 
                        color: "#f9fafb", 
                        padding: "8px", 
                        borderRadius: "4px",
                        marginTop: "4px"
                      }}>
                        {`// Your agent can now use tools from this server
await agent.executeIntent({
  intent: "user-management.create-user",
  parameters: {
    email: "user@example.com",
    name: "John Doe"
  }
});`}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "var(--rku-space-2)" }}>
                    <Button onClick={() => setSelectedItem(null)}>
                      Close Details
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Server Creation Form */}
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
          <Card title="Create Server from Pack" style={{ width: "600px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <form onSubmit={handleServerFormSubmit} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <Input
                label="Server Name"
                value={serverFormData.serverName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServerFormData({ ...serverFormData, serverName: e.target.value })}
                placeholder="e.g., my-mcp-server"
                required
              />

              <Select
                label="Landing Zone"
                value={serverFormData.landingZoneId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServerFormData({ ...serverFormData, landingZoneId: e.target.value })}
                options={[
                  { value: "", label: "Select a landing zone" },
                  ...landingZones.filter(zone => zone.isActive).map(zone => ({
                    value: zone.id,
                    label: `${zone.name} (${zone.clusterUrl})`
                  }))
                ]}
                required
              />

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Selected Packs
                </label>
                <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px" }}>
                  {packs.filter(pack => serverFormData.selectedPackIds.includes(pack.id)).map(pack => (
                    <div key={pack.id} style={{
                      padding: "8px",
                      background: "#f3f4f6",
                      borderRadius: "4px",
                      margin: "4px 0",
                      fontSize: "14px"
                    }}>
                      {pack.namespace} (v{pack.version}) - {pack.intents?.length || 0} tools
                    </div>
                  ))}
                  {serverFormData.selectedPackIds.length === 0 && (
                    <div style={{ color: "#9ca3af", textAlign: "center", padding: "16px" }}>
                      No packs selected
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--rku-space-2)" }}>
                <Input
                  label="CPU Resources"
                  value={serverFormData.resources.cpu}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServerFormData({ 
                    ...serverFormData, 
                    resources: { ...serverFormData.resources, cpu: e.target.value }
                  })}
                  placeholder="100m"
                />
                <Input
                  label="Memory Resources"
                  value={serverFormData.resources.memory}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServerFormData({ 
                    ...serverFormData, 
                    resources: { ...serverFormData.resources, memory: e.target.value }
                  })}
                  placeholder="128Mi"
                />
              </div>

              <Input
                label="Replicas"
                type="number"
                value={serverFormData.replicas}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServerFormData({ ...serverFormData, replicas: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
              />

              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button type="submit" disabled={serverFormData.selectedPackIds.length === 0}>
                  Create Server
                </Button>
                <Button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}