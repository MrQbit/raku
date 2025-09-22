import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Textarea, Select } from "@raku/ui-foundation";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

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
  description?: string;
  isActive: boolean;
  deploymentCount: number;
}

interface Deployment {
  id: string;
  serverName: string;
  landingZone: {
    id: string;
    name: string;
    clusterUrl: string;
  };
  namespace: string;
  imageUrl: string;
  status: string;
  deployedAt?: string;
  createdAt: string;
}

export default function App() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [landingZones, setLandingZones] = useState<LandingZone[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"packs" | "deployments">("packs");
  const [formData, setFormData] = useState({
    namespace: "",
    version: "1.0.0",
    intents: ""
  });
  const [deployFormData, setDeployFormData] = useState({
    serverName: "",
    landingZoneId: "",
    selectedPackIds: [] as string[],
    replicas: 2,
    resources: {
      cpu: "100m",
      memory: "128Mi"
    }
  });

  useEffect(() => {
    fetchPacks();
    fetchLandingZones();
    fetchDeployments();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/packs`);
      const data = await response.json();
      setPacks(data);
    } catch (error) {
      console.error("Failed to fetch packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLandingZones = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/landing-zones`);
      const data = await response.json();
      setLandingZones(data);
    } catch (error) {
      console.error("Failed to fetch landing zones:", error);
    }
  };

  const fetchDeployments = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/deployments`);
      const data = await response.json();
      setDeployments(data);
    } catch (error) {
      console.error("Failed to fetch deployments:", error);
    }
  };

  const handlePackSelect = async (packId: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/packs/${packId}`);
      const data = await response.json();
      setSelectedPack(data);
    } catch (error) {
      console.error("Failed to fetch pack details:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const intentsArray = formData.intents ? JSON.parse(formData.intents) : [];
      const payload = {
        namespace: formData.namespace,
        version: formData.version,
        intents: intentsArray
      };

      const response = await fetch(`${API_BASE}/v1/packs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchPacks();
        setShowForm(false);
        setFormData({ namespace: "", version: "1.0.0", intents: "" });
      } else {
        console.error("Failed to create pack");
      }
    } catch (error) {
      console.error("Error creating pack:", error);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/v1/servers/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverName: deployFormData.serverName,
          landingZoneId: deployFormData.landingZoneId,
          packIds: deployFormData.selectedPackIds,
          config: {
            replicas: deployFormData.replicas,
            resources: deployFormData.resources
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Deployment started:", result);
        await fetchDeployments();
        setShowDeployForm(false);
        setDeployFormData({
          serverName: "",
          landingZoneId: "",
          selectedPackIds: [],
          replicas: 2,
          resources: { cpu: "100m", memory: "128Mi" }
        });
        alert(`Deployment started! ID: ${result.deploymentId}`);
      }
    } catch (error) {
      console.error("Failed to deploy MCP server:", error);
    }
  };

  const handlePackSelection = (packId: string, checked: boolean) => {
    setDeployFormData(prev => ({
      ...prev,
      selectedPackIds: checked 
        ? [...prev.selectedPackIds, packId]
        : prev.selectedPackIds.filter(id => id !== packId)
    }));
  };

  const columns = [
    { key: "namespace", label: "Namespace" },
    { key: "version", label: "Version" },
    { 
      key: "intents", 
      label: "Intents",
      render: (intents: any[]) => (
        <span style={{ fontSize: "12px", color: "#6b7280" }}>
          {intents?.length || 0} intent{intents?.length !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      key: "id",
      label: "Actions",
      render: (id: string) => (
        <Button
          size="sm"
          onClick={() => handlePackSelect(id)}
          style={{ fontSize: "12px", padding: "4px 8px" }}
        >
          View Details
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: "var(--rku-space-3)" }}>
        <h1>Pack Management</h1>
        <p>Loading packs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <h1>MCP Factory</h1>
        <div style={{ display: "flex", gap: "var(--rku-space-2)" }}>
          <Button onClick={() => setShowDeployForm(true)} size="sm">
            Deploy MCP Server
          </Button>
          <Button onClick={() => setShowForm(true)} size="sm">
            Create Pack
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "var(--rku-space-2)", marginBottom: "var(--rku-space-3)" }}>
        <Button 
          onClick={() => setActiveTab("packs")} 
          style={{ 
            background: activeTab === "packs" ? "#3b82f6" : "#f3f4f6",
            color: activeTab === "packs" ? "white" : "black"
          }}
        >
          Pack Library
        </Button>
        <Button 
          onClick={() => setActiveTab("deployments")} 
          style={{ 
            background: activeTab === "deployments" ? "#3b82f6" : "#f3f4f6",
            color: activeTab === "deployments" ? "white" : "black"
          }}
        >
          Deployments
        </Button>
      </div>

      {/* Pack Library Tab */}
      {activeTab === "packs" && (
        <div style={{ display: "grid", gap: "var(--rku-space-3)", gridTemplateColumns: selectedPack ? "1fr 400px" : "1fr" }}>
          <Card title="MCP Packs">
            <Table data={packs} columns={columns} emptyMessage="No packs found" />
          </Card>

        {selectedPack && (
          <Card title="Pack Details">
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <div>
                <strong>Namespace:</strong> {selectedPack.namespace}
              </div>
              <div>
                <strong>Version:</strong> {selectedPack.version}
              </div>
              <div>
                <strong>Intents:</strong>
                <div style={{ marginTop: "4px", maxHeight: "200px", overflow: "auto" }}>
                  {selectedPack.intents?.map((intent: any, index: number) => (
                    <div key={index} style={{
                      padding: "4px 8px",
                      background: "#f3f4f6",
                      borderRadius: "4px",
                      margin: "2px 0",
                      fontSize: "12px"
                    }}>
                      <strong>{intent.name || intent.intent}</strong>
                      {intent.description && (
                        <div style={{ color: "#6b7280" }}>{intent.description}</div>
                      )}
                      {intent.verbs && (
                        <div style={{ color: "#6b7280" }}>Verbs: {intent.verbs.join(", ")}</div>
                      )}
                    </div>
                  )) || "No intents defined"}
                </div>
              </div>
              <div style={{ marginTop: "var(--rku-space-2)" }}>
                <Button onClick={() => setSelectedPack(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        )}
        </div>
      )}

      {/* Deployments Tab */}
      {activeTab === "deployments" && (
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <Card title="MCP Server Deployments">
            <Table 
              data={deployments} 
              columns={[
                { key: "serverName", label: "Server Name" },
                { key: "landingZone.name", label: "Landing Zone" },
                { key: "namespace", label: "Namespace" },
                { key: "status", label: "Status" },
                { key: "deployedAt", label: "Deployed At" },
                { key: "actions", label: "Actions", render: (id: string) => (
                  <Button size="sm" onClick={() => {
                    // TODO: Add deployment details view
                    console.log("View deployment:", id);
                  }}>
                    View Details
                  </Button>
                )}
              ]} 
              emptyMessage="No deployments found" 
            />
          </Card>
        </div>
      )}

      {showForm && (
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
          <Card title="Create New Pack" style={{ width: "500px", maxWidth: "90vw" }}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <Input
                label="Namespace"
                value={formData.namespace}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, namespace: e.target.value })}
                placeholder="e.g., billing.invoice"
                required
              />
              <Input
                label="Version"
                value={formData.version}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0.0"
                required
              />
              <Textarea
                label="Intents (JSON)"
                value={formData.intents}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, intents: e.target.value })}
                placeholder='[{"name": "billing.create_invoice", "verbs": ["create"], "description": "Create a new invoice"}]'
                rows={8}
              />
              <div style={{ 
                padding: "8px 12px", 
                background: "#f9fafb", 
                borderRadius: "6px", 
                fontSize: "12px",
                color: "#6b7280"
              }}>
                <strong>Intents Format:</strong> JSON array of intent objects with name, verbs, and description fields.
              </div>
              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button type="submit">Create Pack</Button>
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showDeployForm && (
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
          <Card title="Deploy MCP Server" style={{ width: "600px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <form onSubmit={handleDeploy} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <Input
                label="Server Name"
                value={deployFormData.serverName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeployFormData({ ...deployFormData, serverName: e.target.value })}
                placeholder="e.g., billing-mcp-server"
                required
              />

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Landing Zone
                </label>
                <Select
                  value={deployFormData.landingZoneId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeployFormData({ ...deployFormData, landingZoneId: e.target.value })}
                  required
                >
                  <option value="">Select a landing zone</option>
                  {landingZones.filter(zone => zone.isActive).map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.clusterUrl})
                    </option>
                  ))}
                </Select>
              </div>

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
                        checked={deployFormData.selectedPackIds.includes(pack.id)}
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
                  value={deployFormData.resources.cpu}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeployFormData({ 
                    ...deployFormData, 
                    resources: { ...deployFormData.resources, cpu: e.target.value }
                  })}
                  placeholder="100m"
                />
                <Input
                  label="Memory Resources"
                  value={deployFormData.resources.memory}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeployFormData({ 
                    ...deployFormData, 
                    resources: { ...deployFormData.resources, memory: e.target.value }
                  })}
                  placeholder="128Mi"
                />
              </div>

              <Input
                label="Replicas"
                type="number"
                value={deployFormData.replicas}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeployFormData({ ...deployFormData, replicas: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
              />

              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button type="submit" disabled={deployFormData.selectedPackIds.length === 0}>
                  Deploy MCP Server
                </Button>
                <Button type="button" onClick={() => setShowDeployForm(false)}>
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
