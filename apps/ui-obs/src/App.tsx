import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Select } from "@raku/ui-foundation";
import "@raku/ui-foundation/dist/tokens.css";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

interface Trace {
  id: string;
  agentId: string;
  intent: string;
  status: string;
  latencyMs: number;
}

export default function App() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<any>(null);
  const [filters, setFilters] = useState({
    intent: "",
    status: "",
    agentId: ""
  });

  useEffect(() => {
    fetchTraces();
  }, []);

  const fetchTraces = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.intent) params.append("intent", filters.intent);
      if (filters.status) params.append("status", filters.status);
      if (filters.agentId) params.append("agentId", filters.agentId);

      const response = await fetch(`${API_BASE}/v1/traces?${params}`);
      const data = await response.json();
      setTraces(data);
    } catch (error) {
      console.error("Failed to fetch traces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTraceSelect = async (traceId: string) => {
    try {
      // Note: We'd need a GET /v1/traces/:id endpoint for detailed trace view
      console.log("Detailed trace view not yet implemented:", traceId);
    } catch (error) {
      console.error("Failed to fetch trace details:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    fetchTraces();
  };

  const clearFilters = () => {
    setFilters({ intent: "", status: "", agentId: "" });
    setLoading(true);
    fetchTraces();
  };

  const columns = [
    { key: "agentId", label: "Agent ID" },
    { key: "intent", label: "Intent" },
    { 
      key: "status", 
      label: "Status",
      render: (status: string) => (
        <span style={{
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "500",
          background: status === "ok" ? "#dcfce7" : status === "error" ? "#fee2e2" : "#fef3c7",
          color: status === "ok" ? "#166534" : status === "error" ? "#dc2626" : "#92400e"
        }}>
          {status}
        </span>
      )
    },
    { 
      key: "latencyMs", 
      label: "Latency (ms)",
      render: (latency: number) => (
        <span style={{
          color: latency > 1000 ? "#dc2626" : latency > 500 ? "#d97706" : "#166534"
        }}>
          {latency}ms
        </span>
      )
    },
    {
      key: "id",
      label: "Actions",
      render: (id: string) => (
        <Button
          size="sm"
          onClick={() => handleTraceSelect(id)}
          style={{ fontSize: "12px", padding: "4px 8px" }}
        >
          View Details
        </Button>
      )
    }
  ];

  // Calculate metrics
  const totalTraces = traces.length;
  const successRate = totalTraces > 0 ? (traces.filter(t => t.status === "ok").length / totalTraces * 100).toFixed(1) : "0";
  const avgLatency = totalTraces > 0 ? Math.round(traces.reduce((sum, t) => sum + t.latencyMs, 0) / totalTraces) : 0;
  const errorCount = traces.filter(t => t.status === "error").length;

  if (loading) {
    return (
      <div style={{ padding: "var(--rku-space-3)" }}>
        <h1>Observability Dashboard</h1>
        <p>Loading traces...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1200px" }}>
      <h1 style={{ marginBottom: "var(--rku-space-3)" }}>Observability Dashboard</h1>

      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--rku-space-2)", marginBottom: "var(--rku-space-3)" }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>{totalTraces}</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Total Traces</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>{successRate}%</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Success Rate</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: avgLatency > 500 ? "#f59e0b" : "#10b981" }}>{avgLatency}ms</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Avg Latency</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: errorCount > 0 ? "#ef4444" : "#10b981" }}>{errorCount}</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Errors</div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Filters" style={{ marginBottom: "var(--rku-space-3)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--rku-space-2)" }}>
          <Input
            label="Intent Pattern"
            value={filters.intent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("intent", e.target.value)}
            placeholder="e.g., billing.*"
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange("status", e.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "ok", label: "Success" },
              { value: "error", label: "Error" },
              { value: "async", label: "Async" }
            ]}
          />
          <Input
            label="Agent ID"
            value={filters.agentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("agentId", e.target.value)}
            placeholder="Filter by agent"
          />
          <div style={{ display: "flex", gap: "var(--rku-space-2)", alignItems: "end" }}>
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button onClick={clearFilters}>Clear</Button>
          </div>
        </div>
      </Card>

      {/* Traces Table */}
      <Card title="Recent Traces">
        <Table data={traces} columns={columns} emptyMessage="No traces found" />
      </Card>

      {/* Trace Details Modal */}
      {selectedTrace && (
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
          <Card title="Trace Details" style={{ width: "600px", maxWidth: "90vw" }}>
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <div>
                <strong>Trace ID:</strong> {selectedTrace.id}
              </div>
              <div>
                <strong>Agent ID:</strong> {selectedTrace.agentId}
              </div>
              <div>
                <strong>Intent:</strong> {selectedTrace.intent}
              </div>
              <div>
                <strong>Status:</strong> {selectedTrace.status}
              </div>
              <div>
                <strong>Latency:</strong> {selectedTrace.latencyMs}ms
              </div>
              <div style={{ marginTop: "var(--rku-space-2)" }}>
                <Button onClick={() => setSelectedTrace(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
