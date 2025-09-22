import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Select } from "@raku/ui-foundation";
import "@raku/ui-foundation/dist/tokens.css";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

interface Server {
  id: string;
  name: string;
  env: string;
  status: string;
  version: string;
  endpointBaseUrl?: string;
}

export default function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    env: "dev",
    endpointBaseUrl: ""
  });

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/servers`);
      const data = await response.json();
      setServers(data);
    } catch (error) {
      console.error("Failed to fetch servers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServerSelect = async (serverId: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/servers/${serverId}`);
      const data = await response.json();
      setSelectedServer(data);
    } catch (error) {
      console.error("Failed to fetch server details:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Note: Server creation would require additional API endpoint
    console.log("Server creation not yet implemented:", formData);
    setShowForm(false);
    setFormData({ name: "", env: "dev", endpointBaseUrl: "" });
  };

  const columns = [
    { key: "name", label: "Name" },
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
          background: status === "healthy" ? "#dcfce7" : status === "degraded" ? "#fef3c7" : "#fee2e2",
          color: status === "healthy" ? "#166534" : status === "degraded" ? "#92400e" : "#dc2626"
        }}>
          {status}
        </span>
      )
    },
    { key: "version", label: "Version" },
    {
      key: "id",
      label: "Actions",
      render: (id: string) => (
        <Button
          size="sm"
          onClick={() => handleServerSelect(id)}
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
        <h1>Server Management</h1>
        <p>Loading servers...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <h1>Server Management</h1>
        <Button onClick={() => setShowForm(true)}>
          Add Server
        </Button>
      </div>

      <div style={{ display: "grid", gap: "var(--rku-space-3)", gridTemplateColumns: selectedServer ? "1fr 400px" : "1fr" }}>
        <Card title="Servers">
          <Table data={servers} columns={columns} emptyMessage="No servers found" />
        </Card>

        {selectedServer && (
          <Card title="Server Details">
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <div>
                <strong>Name:</strong> {selectedServer.name}
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
              <div style={{ marginTop: "var(--rku-space-2)" }}>
                <Button onClick={() => setSelectedServer(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

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
          <Card title="Add New Server" style={{ width: "400px", maxWidth: "90vw" }}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <Input
                label="Server Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Select
                label="Environment"
                value={formData.env}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, env: e.target.value })}
                options={[
                  { value: "dev", label: "Development" },
                  { value: "staging", label: "Staging" },
                  { value: "prod", label: "Production" }
                ]}
              />
              <Input
                label="Endpoint Base URL"
                value={formData.endpointBaseUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endpointBaseUrl: e.target.value })}
                placeholder="https://api.example.com"
              />
              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button type="submit">Create Server</Button>
                <Button type="button" onClick={() => setShowForm(false)}>
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
