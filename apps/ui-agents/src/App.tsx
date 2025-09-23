import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Textarea, Modal } from "@raku/ui-foundation";
import "@raku/ui-foundation/dist/tokens.css";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

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
  usageStats?: any;
  createdAt: string;
  updatedAt: string;
}

interface NewAgent {
  name: string;
  description: string;
  url: string;
  owners: string[];
  tags: string[];
  quotasRps: number;
}

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const [newAgent, setNewAgent] = useState<NewAgent>({
    name: "",
    description: "",
    url: "",
    owners: [],
    tags: [],
    quotasRps: 100
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/agents`);
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name.trim()) {
      alert("Agent name is required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgent),
      });

      if (!response.ok) throw new Error("Failed to register agent");
      
      const result = await response.json();
      setGeneratedApiKey(result.apiKey);
      setShowRegistrationForm(false);
      setShowApiKeyModal(true);
      
      // Reset form
      setNewAgent({
        name: "",
        description: "",
        url: "",
        owners: [],
        tags: [],
        quotasRps: 100
      });
      
      // Refresh agents list
      await fetchAgents();
    } catch (error) {
      console.error("Error registering agent:", error);
      alert("Error registering agent. See console for details.");
    }
  };

  const handleRegenerateApiKey = async (agentId: string) => {
    if (!confirm("Are you sure you want to regenerate the API key? The old key will no longer work.")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/agents/${agentId}/regenerate-key`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to regenerate API key");
      
      const result = await response.json();
      setGeneratedApiKey(result.apiKey);
      setShowApiKeyModal(true);
    } catch (error) {
      console.error("Error regenerating API key:", error);
      alert("Error regenerating API key. See console for details.");
    }
  };

  const handleToggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/v1/agents/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update agent status");
      
      await fetchAgents();
    } catch (error) {
      console.error("Error updating agent status:", error);
      alert("Error updating agent status. See console for details.");
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`Are you sure you want to delete agent "${agentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete agent");
      
      await fetchAgents();
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert("Error deleting agent. See console for details.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Agent Name",
      render: (name: string, agent: Agent) => (
        <div>
          <div style={{ fontWeight: "500" }}>{name}</div>
          {agent.description && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {agent.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "url",
      label: "URL",
      render: (url: string) => (
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {url || "Not specified"}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (isActive: boolean, agent: Agent) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: isActive ? "#10b981" : "#ef4444",
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
          <Button
            size="sm"
            onClick={() => handleToggleAgentStatus(agent.id, isActive)}
            style={{
              background: isActive ? "#ef4444" : "#10b981",
              color: "white",
              fontSize: "11px",
              padding: "2px 8px",
            }}
          >
            {isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
    {
      key: "lastUsedAt",
      label: "Last Used",
      render: (lastUsedAt: string) => (
        <span style={{ fontSize: "12px", color: "#6b7280" }}>
          {lastUsedAt ? new Date(lastUsedAt).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (id: string, agent: Agent) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <Button
            size="sm"
            onClick={() => handleRegenerateApiKey(agent.id)}
            style={{ background: "#3b82f6", color: "white", fontSize: "11px" }}
          >
            New Key
          </Button>
          <Button
            size="sm"
            onClick={() => handleDeleteAgent(agent.id, agent.name)}
            style={{ background: "#ef4444", color: "white", fontSize: "11px" }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div style={{ padding: "var(--rku-space-3)" }}>Loading agents...</div>;
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <h1>Agent Management</h1>
        <Button onClick={() => setShowRegistrationForm(true)} size="sm">
          Register New Agent
        </Button>
      </div>

      <Card title="Registered Agents">
        <Table data={agents} columns={columns} emptyMessage="No agents registered" />
      </Card>

      {/* Agent Registration Form */}
      {showRegistrationForm && (
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
          <Card title="Register New Agent" style={{ width: "600px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <form onSubmit={handleRegisterAgent} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <Input
                label="Agent Name *"
                value={newAgent.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="e.g., My AI Assistant"
                required
              />
              
              <Textarea
                label="Description"
                value={newAgent.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewAgent({ ...newAgent, description: e.target.value })}
                placeholder="Brief description of what this agent does"
                rows={3}
              />
              
              <Input
                label="URL (Optional)"
                value={newAgent.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAgent({ ...newAgent, url: e.target.value })}
                placeholder="https://my-agent.example.com"
              />
              
              <Input
                label="Rate Limit (requests per second)"
                type="number"
                value={newAgent.quotasRps}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAgent({ ...newAgent, quotasRps: parseInt(e.target.value) || 100 })}
                min="1"
              />

              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button type="submit">
                  Register Agent
                </Button>
                <Button type="button" onClick={() => setShowRegistrationForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* API Key Display Modal */}
      {showApiKeyModal && (
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
          <Card title="🔑 Your API Key" style={{ width: "600px", maxWidth: "90vw" }}>
            <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
              <div style={{ 
                background: "#f8fafc", 
                padding: "var(--rku-space-2)", 
                borderRadius: "6px",
                border: "1px solid #e2e8f0"
              }}>
                <p style={{ margin: "0 0 var(--rku-space-2) 0", fontWeight: "500" }}>
                  ⚠️ Important: Copy this API key now! It won't be shown again.
                </p>
                <div style={{ 
                  background: "#1f2937", 
                  color: "#f9fafb", 
                  padding: "var(--rku-space-2)", 
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all"
                }}>
                  {generatedApiKey}
                </div>
                <Button
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(generatedApiKey)}
                  style={{ marginTop: "var(--rku-space-2)", background: "#10b981", color: "white" }}
                >
                  📋 Copy to Clipboard
                </Button>
              </div>

              <div style={{ 
                background: "#eff6ff", 
                padding: "var(--rku-space-2)", 
                borderRadius: "6px",
                border: "1px solid #bfdbfe"
              }}>
                <h4 style={{ margin: "0 0 var(--rku-space-2) 0" }}>How to Use Your API Key</h4>
                <div style={{ fontSize: "14px", color: "#1e40af" }}>
                  <p style={{ margin: "0 0 var(--rku-space-1) 0" }}>
                    <strong>Bearer Token:</strong>
                  </p>
                  <div style={{ 
                    background: "#1f2937", 
                    color: "#f9fafb", 
                    padding: "8px", 
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    marginBottom: "var(--rku-space-1)"
                  }}>
                    Authorization: Bearer {generatedApiKey}
                  </div>
                  
                  <p style={{ margin: "0 0 var(--rku-space-1) 0" }}>
                    <strong>X-API-Key Header:</strong>
                  </p>
                  <div style={{ 
                    background: "#1f2937", 
                    color: "#f9fafb", 
                    padding: "8px", 
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "12px"
                  }}>
                    X-API-Key: {generatedApiKey}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button onClick={() => setShowApiKeyModal(false)}>
                  I've Copied the Key
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

