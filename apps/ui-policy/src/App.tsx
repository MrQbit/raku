import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Textarea } from "@raku/ui-foundation";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

interface Policy {
  id: string;
  name: string;
  description?: string;
  rbac?: any;
  abac?: any;
  approvals?: any;
}

export default function App() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rbac: "",
    abac: "",
    approvals: ""
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/policies`);
      const data = await response.json();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = (policy: Policy) => {
    setSelectedPolicy(policy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        rbac: formData.rbac ? JSON.parse(formData.rbac) : undefined,
        abac: formData.abac ? JSON.parse(formData.abac) : undefined,
        approvals: formData.approvals ? JSON.parse(formData.approvals) : undefined
      };

      const response = await fetch(`${API_BASE}/v1/policies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchPolicies();
        setShowForm(false);
        setFormData({ name: "", description: "", rbac: "", abac: "", approvals: "" });
      } else {
        console.error("Failed to create policy");
      }
    } catch (error) {
      console.error("Error creating policy:", error);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { 
      key: "description", 
      label: "Description",
      render: (description: string) => (
        <span style={{ fontSize: "12px", color: "#6b7280" }}>
          {description || "No description"}
        </span>
      )
    },
    {
      key: "id",
      label: "Actions",
      render: (id: string, policy: Policy) => (
        <Button
          size="sm"
          onClick={() => handlePolicySelect(policy)}
          style={{ fontSize: "12px", padding: "4px 8px" }}
        >
          View Details
        </Button>
      )
    }
  ];

  const defaultRbacExample = {
    roles: ["admin", "user"],
    grants: [
      {
        role: "admin",
        intentPattern: "*",
        actions: ["execute", "discover"]
      },
      {
        role: "user",
        intentPattern: "billing.*",
        actions: ["execute"]
      }
    ]
  };

  const defaultAbacExample = {
    constraints: [
      {
        key: "env",
        op: "in",
        value: ["dev", "staging"]
      }
    ]
  };

  if (loading) {
    return (
      <div style={{ padding: "var(--rku-space-3)" }}>
        <h1>Policy Management</h1>
        <p>Loading policies...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <h1>Policy Management</h1>
        <Button onClick={() => setShowForm(true)}>
          Create Policy
        </Button>
      </div>

      <div style={{ display: "grid", gap: "var(--rku-space-3)", gridTemplateColumns: selectedPolicy ? "1fr 400px" : "1fr" }}>
        <Card title="Policies">
          <Table data={policies} columns={columns} emptyMessage="No policies found" />
        </Card>

        {selectedPolicy && (
          <Card title="Policy Details">
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <div>
                <strong>Name:</strong> {selectedPolicy.name}
              </div>
              <div>
                <strong>Description:</strong> {selectedPolicy.description || "No description"}
              </div>
              
              {selectedPolicy.rbac && (
                <div>
                  <strong>RBAC Rules:</strong>
                  <pre style={{
                    marginTop: "4px",
                    padding: "8px",
                    background: "#f3f4f6",
                    borderRadius: "4px",
                    fontSize: "11px",
                    overflow: "auto",
                    maxHeight: "150px"
                  }}>
                    {JSON.stringify(selectedPolicy.rbac, null, 2)}
                  </pre>
                </div>
              )}

              {selectedPolicy.abac && (
                <div>
                  <strong>ABAC Constraints:</strong>
                  <pre style={{
                    marginTop: "4px",
                    padding: "8px",
                    background: "#f3f4f6",
                    borderRadius: "4px",
                    fontSize: "11px",
                    overflow: "auto",
                    maxHeight: "150px"
                  }}>
                    {JSON.stringify(selectedPolicy.abac, null, 2)}
                  </pre>
                </div>
              )}

              {selectedPolicy.approvals && (
                <div>
                  <strong>Approval Rules:</strong>
                  <pre style={{
                    marginTop: "4px",
                    padding: "8px",
                    background: "#f3f4f6",
                    borderRadius: "4px",
                    fontSize: "11px",
                    overflow: "auto",
                    maxHeight: "150px"
                  }}>
                    {JSON.stringify(selectedPolicy.approvals, null, 2)}
                  </pre>
                </div>
              )}

              <div style={{ marginTop: "var(--rku-space-2)" }}>
                <Button onClick={() => setSelectedPolicy(null)}>
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
          <Card title="Create New Policy" style={{ width: "600px", maxWidth: "90vw" }}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <Input
                label="Policy Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Default Access Policy"
                required
              />
              <Input
                label="Description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this policy"
              />
              <Textarea
                label="RBAC Rules (JSON)"
                value={formData.rbac}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, rbac: e.target.value })}
                placeholder={JSON.stringify(defaultRbacExample, null, 2)}
                rows={6}
              />
              <Textarea
                label="ABAC Constraints (JSON, optional)"
                value={formData.abac}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, abac: e.target.value })}
                placeholder={JSON.stringify(defaultAbacExample, null, 2)}
                rows={4}
              />
              <Textarea
                label="Approval Rules (JSON, optional)"
                value={formData.approvals}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, approvals: e.target.value })}
                placeholder='[{"intentPattern": "billing.*", "approverGroup": "finance-team"}]'
                rows={3}
              />
              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button type="submit">Create Policy</Button>
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
