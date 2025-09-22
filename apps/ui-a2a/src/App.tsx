import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Select, Textarea } from "@raku/ui-foundation";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

interface Job {
  jobId: string;
  status: string;
  progress?: number;
  result?: any;
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    owner: "",
    intent: "",
    inputs: "",
    context: ""
  });

  useEffect(() => {
    // Note: We'd need a GET /v1/jobs endpoint to list all jobs
    // For now, we'll show a placeholder
    setLoading(false);
  }, []);

  const handleJobSelect = async (jobId: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/jobs/${jobId}`);
      const data = await response.json();
      setSelectedJob(data);
    } catch (error) {
      console.error("Failed to fetch job details:", error);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        owner: formData.owner,
        payload: {
          intent: formData.intent,
          inputs: formData.inputs ? JSON.parse(formData.inputs) : {},
          context: formData.context ? JSON.parse(formData.context) : {}
        }
      };

      const response = await fetch(`${API_BASE}/v1/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [newJob, ...prev]);
        setShowCreateForm(false);
        setFormData({ owner: "", intent: "", inputs: "", context: "" });
      } else {
        console.error("Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  const handleUpdateJob = async (jobId: string, updates: any) => {
    try {
      const response = await fetch(`${API_BASE}/v1/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJobs(prev => prev.map(job => job.jobId === jobId ? updatedJob : job));
        if (selectedJob?.jobId === jobId) {
          setSelectedJob(updatedJob);
        }
      }
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  const columns = [
    { key: "jobId", label: "Job ID" },
    { key: "owner", label: "Owner" },
    { 
      key: "status", 
      label: "Status",
      render: (status: string) => (
        <span style={{
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "500",
          background: status === "done" ? "#dcfce7" : status === "pending" ? "#fef3c7" : status === "running" ? "#dbeafe" : "#fee2e2",
          color: status === "done" ? "#166534" : status === "pending" ? "#92400e" : status === "running" ? "#1e40af" : "#dc2626"
        }}>
          {status}
        </span>
      )
    },
    { 
      key: "progress", 
      label: "Progress",
      render: (progress: number) => progress !== undefined ? `${progress}%` : "-"
    },
    {
      key: "jobId",
      label: "Actions",
      render: (jobId: string, job: Job) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <Button
            size="sm"
            onClick={() => handleJobSelect(jobId)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            View
          </Button>
          {job.status === "pending" && (
            <Button
              size="sm"
              onClick={() => handleUpdateJob(jobId, { status: "running", progress: 0 })}
              style={{ fontSize: "12px", padding: "4px 8px", background: "#3b82f6" }}
            >
              Start
            </Button>
          )}
          {job.status === "running" && (
            <Button
              size="sm"
              onClick={() => handleUpdateJob(jobId, { status: "done", progress: 100 })}
              style={{ fontSize: "12px", padding: "4px 8px", background: "#10b981" }}
            >
              Complete
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: "var(--rku-space-3)" }}>
        <h1>Agent-to-Agent Console</h1>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <h1>Agent-to-Agent Console</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Job
        </Button>
      </div>

      <div style={{ display: "grid", gap: "var(--rku-space-3)", gridTemplateColumns: selectedJob ? "1fr 400px" : "1fr" }}>
        <Card title="Async Jobs">
          <Table data={jobs} columns={columns} emptyMessage="No jobs found" />
        </Card>

        {selectedJob && (
          <Card title="Job Details">
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <div>
                <strong>Job ID:</strong> {selectedJob.jobId}
              </div>
              <div>
                <strong>Owner:</strong> {selectedJob.owner}
              </div>
              <div>
                <strong>Status:</strong> {selectedJob.status}
              </div>
              {selectedJob.progress !== undefined && (
                <div>
                  <strong>Progress:</strong> {selectedJob.progress}%
                </div>
              )}
              {selectedJob.result && (
                <div>
                  <strong>Result:</strong>
                  <pre style={{
                    marginTop: "4px",
                    padding: "8px",
                    background: "#f3f4f6",
                    borderRadius: "4px",
                    fontSize: "11px",
                    overflow: "auto",
                    maxHeight: "150px"
                  }}>
                    {JSON.stringify(selectedJob.result, null, 2)}
                  </pre>
                </div>
              )}
              {selectedJob.createdAt && (
                <div>
                  <strong>Created:</strong> {new Date(selectedJob.createdAt).toLocaleString()}
                </div>
              )}
              {selectedJob.updatedAt && (
                <div>
                  <strong>Updated:</strong> {new Date(selectedJob.updatedAt).toLocaleString()}
                </div>
              )}
              <div style={{ marginTop: "var(--rku-space-2)" }}>
                <Button onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Create Job Modal */}
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
          <Card title="Create Async Job" style={{ width: "500px", maxWidth: "90vw" }}>
            <form onSubmit={handleCreateJob} style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <Input
                label="Owner"
                value={formData.owner}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="e.g., agent-123"
                required
              />
              <Input
                label="Intent"
                value={formData.intent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, intent: e.target.value })}
                placeholder="e.g., billing.create_invoice"
                required
              />
              <Textarea
                label="Inputs (JSON)"
                value={formData.inputs}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, inputs: e.target.value })}
                placeholder='{"amount": 100, "customer": "john@example.com"}'
                rows={4}
              />
              <Textarea
                label="Context (JSON, optional)"
                value={formData.context}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, context: e.target.value })}
                placeholder='{"env": "dev", "priority": "high"}'
                rows={3}
              />
              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button type="submit">Create Job</Button>
                <Button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card title="About Agent-to-Agent" style={{ marginTop: "var(--rku-space-3)" }}>
        <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
          <p>
            The Agent-to-Agent console allows you to manage asynchronous jobs and facilitate 
            communication between different agents in the RAKU ecosystem.
          </p>
          <div>
            <strong>Features:</strong>
            <ul style={{ marginTop: "4px", paddingLeft: "20px" }}>
              <li>Create and manage async jobs</li>
              <li>Track job progress and status</li>
              <li>Handle long-running operations</li>
              <li>Monitor agent interactions</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
