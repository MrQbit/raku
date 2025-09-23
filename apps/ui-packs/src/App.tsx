import React, { useState, useEffect } from "react";
import { Button, Card, Table, Input, Textarea, Select } from "@raku/ui-foundation";
import "@raku/ui-foundation/dist/tokens.css";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8080";

interface Pack {
  id: string;
  namespace: string;
  version: string;
  description?: string;
  // Legacy support
  intents: any[];
  // New hybrid pack resources
  tools?: any[];
  databases?: any[];
  files?: any[];
  knowledge?: any[];
  streams?: any[];
  prompts?: any[];
  contextSchema?: any;
  capabilities?: any[];
  relationships?: any[];
  workflows?: any[];
  createdAt: string;
  updatedAt: string;
  consumingServers?: string[];
  lastUpdated?: string;
}

interface ApiEndpoint {
  url: string;
  methods: string[];
  description?: string;
}

interface ApiTool {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  parameters?: any[];
  response?: any;
}

interface Server {
  id: string;
  name: string;
  type: "third-party" | "raku-created";
  packs?: string[];
}

export default function App() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Pack creation form data
  const [formData, setFormData] = useState({
    packName: "",
    version: "1.0.0",
    description: "",
    // Hybrid pack resources
    tools: [] as any[],
    databases: [] as any[],
    files: [] as any[],
    knowledge: [] as any[],
    streams: [] as any[],
    prompts: [] as any[],
    contextSchema: {} as any,
    capabilities: [] as any[],
    relationships: [] as any[],
    workflows: [] as any[]
  });

  // API discovery form data
  const [apiFormData, setApiFormData] = useState({
    apiUrl: "",
    authType: "none",
    authToken: "",
    discoveredTools: [] as ApiTool[],
    selectedTools: [] as string[]
  });

  // Multi-API pack creation
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [currentApiUrl, setCurrentApiUrl] = useState("");
  
  // Hybrid pack resource management
  const [activeResourceTab, setActiveResourceTab] = useState<"tools" | "databases" | "files" | "knowledge" | "streams" | "prompts" | "context" | "capabilities">("tools");
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [currentResource, setCurrentResource] = useState<any>({});
  const [discoveredTools, setDiscoveredTools] = useState<ApiTool[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch packs and servers to determine consumption
      const [packsRes, serversRes, deploymentsRes] = await Promise.all([
        fetch(`${API_BASE}/v1/packs`),
        fetch(`${API_BASE}/v1/servers`),
        fetch(`${API_BASE}/v1/deployments`)
      ]);

      const [packsData, serversData, deploymentsData] = await Promise.all([
        packsRes.json(),
        serversRes.json(),
        deploymentsRes.json()
      ]);

      // Transform servers to include pack consumption
      const transformedServers = [
        ...serversData.map((server: any) => ({ ...server, type: "third-party" as const })),
        ...deploymentsData.map((deployment: any) => ({
          id: deployment.id,
          name: deployment.serverName,
          type: "raku-created" as const,
          packs: deployment.configJson?.packs?.map((p: any) => p.id) || []
        }))
      ];

      // Enhance packs with consumption data
      const enhancedPacks = packsData.map((pack: Pack) => {
        const consumingServers = transformedServers
          .filter(server => server.packs?.includes(pack.id))
          .map(server => server.name);
        
        return {
          ...pack,
          consumingServers,
          lastUpdated: pack.updatedAt
        };
      });

      setPacks(enhancedPacks);
      setServers(transformedServers);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackSelect = (pack: Pack) => {
    setSelectedPack(pack);
  };

  const discoverApiTools = async (apiUrl: string) => {
    try {
      // Simulate API discovery - in a real implementation, this would:
      // 1. Fetch OpenAPI/Swagger spec from the endpoint
      // 2. Parse available endpoints and their methods
      // 3. Generate tool definitions for each endpoint
      
      console.log(`Discovering tools from API: ${apiUrl}`);
      
      // Simulated discovery results
      const mockTools: ApiTool[] = [
        {
          id: "create-user",
          name: "Create User",
          description: "Create a new user account",
          method: "POST",
          path: "/users",
          parameters: [
            { name: "email", type: "string", required: true },
            { name: "name", type: "string", required: true },
            { name: "role", type: "string", required: false }
          ],
          response: { id: "string", email: "string", name: "string" }
        },
        {
          id: "get-users",
          name: "Get Users",
          description: "Retrieve list of users",
          method: "GET",
          path: "/users",
          parameters: [
            { name: "limit", type: "number", required: false },
            { name: "offset", type: "number", required: false }
          ],
          response: { users: "array", total: "number" }
        },
        {
          id: "update-user",
          name: "Update User",
          description: "Update user information",
          method: "PUT",
          path: "/users/{id}",
          parameters: [
            { name: "id", type: "string", required: true },
            { name: "email", type: "string", required: false },
            { name: "name", type: "string", required: false }
          ],
          response: { id: "string", email: "string", name: "string" }
        }
      ];

      setDiscoveredTools(mockTools);
      
    } catch (error) {
      console.error("Failed to discover API tools:", error);
    }
  };

  const handleApiDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentApiUrl) {
      await discoverApiTools(currentApiUrl);
    }
  };

  const handleToolSelection = (toolId: string, selected: boolean) => {
    if (selected) {
      setApiFormData(prev => ({
        ...prev,
        selectedTools: [...prev.selectedTools, toolId]
      }));
    } else {
      setApiFormData(prev => ({
        ...prev,
        selectedTools: prev.selectedTools.filter(id => id !== toolId)
      }));
    }
  };

  const addApiEndpoint = () => {
    if (currentApiUrl && discoveredTools.length > 0) {
      setApiEndpoints(prev => [...prev, {
        url: currentApiUrl,
        methods: [...new Set(discoveredTools.map(tool => tool.method))],
        description: `API with ${discoveredTools.length} tools`
      }]);
      setCurrentApiUrl("");
      setDiscoveredTools([]);
    }
  };

  const handlePackCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate intents from selected tools across all API endpoints
      const selectedTools = apiEndpoints.flatMap(endpoint => 
        discoveredTools.filter(tool => apiFormData.selectedTools.includes(tool.id))
      );

      const intents = selectedTools.map(tool => ({
        name: `${formData.packName}.${tool.id}`,
        description: tool.description,
        method: tool.method,
        path: tool.path,
        parameters: tool.parameters || [],
        apiUrl: apiEndpoints.find(ep => discoveredTools.includes(tool))?.url || ""
      }));

      const response = await fetch(`${API_BASE}/v1/packs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace: formData.packName,
          version: formData.version,
          description: formData.description,
          // Legacy support
          intentsJson: intents,
          // New hybrid pack resources
          tools: formData.tools,
          databases: formData.databases,
          files: formData.files,
          knowledge: formData.knowledge,
          streams: formData.streams,
          prompts: formData.prompts,
          contextSchema: formData.contextSchema,
          capabilities: formData.capabilities,
          relationships: formData.relationships,
          workflows: formData.workflows
        })
      });

      if (response.ok) {
        await fetchAllData(); // Refresh data
        setShowForm(false);
        setFormData({ 
          packName: "", 
          version: "1.0.0", 
          description: "",
          tools: [],
          databases: [],
          files: [],
          knowledge: [],
          streams: [],
          prompts: [],
          contextSchema: {},
          capabilities: [],
          relationships: [],
          workflows: []
        });
        setApiEndpoints([]);
        setApiFormData({
          apiUrl: "",
          authType: "none",
          authToken: "",
          discoveredTools: [],
          selectedTools: []
        });
      }
    } catch (error) {
      console.error("Failed to create pack:", error);
    }
  };

  const columns = [
    { 
      key: "namespace", 
      label: "Pack Name",
      render: (namespace: string, pack: Pack) => (
        <div>
          <div style={{ fontWeight: "500" }}>{namespace}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            v{pack.version} • {pack.intents?.length || 0} tools
          </div>
        </div>
      )
    },
    { 
      key: "consumingServers", 
      label: "Used By Servers",
      render: (servers: string[]) => (
        <div>
          {servers && servers.length > 0 ? (
            <div style={{ fontSize: "14px" }}>
              {servers.map(server => (
                <span key={server} style={{
                  display: "inline-block",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  margin: "1px 2px"
                }}>
                  {server}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Not used</span>
          )}
        </div>
      )
    },
    { 
      key: "lastUpdated", 
      label: "Last Updated",
      render: (date: string) => (
        <div style={{ fontSize: "14px" }}>
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "id",
      label: "Actions",
      render: (id: string, pack: Pack) => (
        <Button
          size="sm"
          onClick={() => handlePackSelect(pack)}
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
        <h1>MCP Pack Library</h1>
        <p>Loading packs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--rku-space-3)" }}>
        <div>
          <h1>MCP Pack Library</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Create intelligent packs by discovering APIs and combining tools into reusable flows
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Create Pack from API
        </Button>
      </div>

      <div style={{ display: "grid", gap: "var(--rku-space-3)", gridTemplateColumns: selectedPack ? "1fr 400px" : "1fr" }}>
        <Card title={`Available Packs (${packs.length})`}>
          <Table data={packs} columns={columns} emptyMessage="No packs found. Create your first pack from an API to get started." />
        </Card>

        {selectedPack && (
          <Card title="Pack Details">
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              <div>
                <strong>Name:</strong> {selectedPack.namespace}
              </div>
              <div>
                <strong>Version:</strong> {selectedPack.version}
              </div>
              <div>
                <strong>Resources:</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                  {selectedPack.intents && selectedPack.intents.length > 0 && (
                    <span style={{ background: "#e0f2fe", color: "#026aa2", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.intents.length} tools
                    </span>
                  )}
                  {selectedPack.tools && selectedPack.tools.length > 0 && (
                    <span style={{ background: "#f0fdf4", color: "#166534", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.tools.length} tools
                    </span>
                  )}
                  {selectedPack.databases && selectedPack.databases.length > 0 && (
                    <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.databases.length} databases
                    </span>
                  )}
                  {selectedPack.files && selectedPack.files.length > 0 && (
                    <span style={{ background: "#fce7f3", color: "#be185d", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.files.length} files
                    </span>
                  )}
                  {selectedPack.knowledge && selectedPack.knowledge.length > 0 && (
                    <span style={{ background: "#f3e8ff", color: "#7c3aed", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.knowledge.length} knowledge
                    </span>
                  )}
                  {selectedPack.streams && selectedPack.streams.length > 0 && (
                    <span style={{ background: "#ecfdf5", color: "#059669", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.streams.length} streams
                    </span>
                  )}
                  {selectedPack.prompts && selectedPack.prompts.length > 0 && (
                    <span style={{ background: "#fef2f2", color: "#dc2626", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.prompts.length} prompts
                    </span>
                  )}
                  {selectedPack.capabilities && selectedPack.capabilities.length > 0 && (
                    <span style={{ background: "#e5e7eb", color: "#374151", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {selectedPack.capabilities.length} capabilities
                    </span>
                  )}
                </div>
              </div>
              <div>
                <strong>Used by Servers:</strong> {selectedPack.consumingServers?.length || 0}
              </div>
              <div>
                <strong>Last Updated:</strong> {new Date(selectedPack.lastUpdated || selectedPack.updatedAt).toLocaleString()}
              </div>
              {selectedPack.consumingServers && selectedPack.consumingServers.length > 0 && (
                <div>
                  <strong>Consuming Servers:</strong>
                  <div style={{ marginTop: "4px" }}>
                    {selectedPack.consumingServers.map(server => (
                      <div key={server} style={{
                        background: "#f3f4f6",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        margin: "2px 0"
                      }}>
                        {server}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <strong>Available Tools:</strong>
                <div style={{ marginTop: "4px", maxHeight: "200px", overflow: "auto" }}>
                  {selectedPack.intents?.map((intent: any, index: number) => (
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
                <Button onClick={() => setSelectedPack(null)}>
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
          <Card title="Create Pack from API Discovery" style={{ width: "800px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <form onSubmit={handlePackCreation} style={{ display: "grid", gap: "var(--rku-space-3)" }}>
              {/* Pack Basic Info */}
              <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <h3 style={{ margin: 0, color: "#374151" }}>Pack Information</h3>
                <Input
                  label="Pack Name"
                  value={formData.packName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, packName: e.target.value })}
                  placeholder="e.g., user-management"
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
                  label="Description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this pack does..."
                  rows={3}
                />
              </div>

              {/* API Discovery */}
              <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <h3 style={{ margin: 0, color: "#374151" }}>Discover API Tools</h3>
                <div style={{ display: "flex", gap: "var(--rku-space-2)" }}>
                  <Input
                    label="API Endpoint URL"
                    value={currentApiUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentApiUrl(e.target.value)}
                    placeholder="https://api.example.com"
                    style={{ flex: 1 }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleApiDiscovery}
                    disabled={!currentApiUrl}
                    style={{ alignSelf: "end" }}
                  >
                    Discover
                  </Button>
                </div>
                
                {discoveredTools.length > 0 && (
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                      Select Tools to Include in Pack
                    </label>
                    <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px" }}>
                      {discoveredTools.map(tool => (
                        <div key={tool.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <input
                            type="checkbox"
                            id={tool.id}
                            checked={apiFormData.selectedTools.includes(tool.id)}
                            onChange={(e) => handleToolSelection(tool.id, e.target.checked)}
                          />
                          <label htmlFor={tool.id} style={{ flex: 1, fontSize: "14px" }}>
                            <strong>{tool.name}</strong> ({tool.method} {tool.path})
                            <div style={{ color: "#6b7280", fontSize: "12px" }}>{tool.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <Button 
                      type="button" 
                      onClick={addApiEndpoint}
                      disabled={apiFormData.selectedTools.length === 0}
                      style={{ marginTop: "8px" }}
                    >
                      Add API to Pack
                    </Button>
                  </div>
                )}
              </div>

              {/* Added APIs Summary */}
              {apiEndpoints.length > 0 && (
                <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                  <h3 style={{ margin: 0, color: "#374151" }}>APIs in This Pack</h3>
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} style={{
                      padding: "8px 12px",
                      background: "#f3f4f6",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}>
                      <strong>{endpoint.url}</strong>
                      <div style={{ color: "#6b7280", fontSize: "12px" }}>{endpoint.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hybrid Pack Resources */}
              <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <h3 style={{ margin: 0, color: "#374151" }}>Hybrid Pack Resources</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => { setActiveResourceTab("tools"); setShowResourceForm(true); }}
                    style={{ background: "#f0fdf4", color: "#166534" }}
                  >
                    + Add Tools
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => { setActiveResourceTab("databases"); setShowResourceForm(true); }}
                    style={{ background: "#fef3c7", color: "#92400e" }}
                  >
                    + Add Databases
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => { setActiveResourceTab("files"); setShowResourceForm(true); }}
                    style={{ background: "#fce7f3", color: "#be185d" }}
                  >
                    + Add Files
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => { setActiveResourceTab("knowledge"); setShowResourceForm(true); }}
                    style={{ background: "#f3e8ff", color: "#7c3aed" }}
                  >
                    + Add Knowledge
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => { setActiveResourceTab("prompts"); setShowResourceForm(true); }}
                    style={{ background: "#fef2f2", color: "#dc2626" }}
                  >
                    + Add Prompts
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => { setActiveResourceTab("context"); setShowResourceForm(true); }}
                    style={{ background: "#e5e7eb", color: "#374151" }}
                  >
                    + Add Context
                  </Button>
                </div>
                
                {/* Resource Summary */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {formData.tools.length > 0 && (
                    <span style={{ background: "#f0fdf4", color: "#166534", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {formData.tools.length} tools
                    </span>
                  )}
                  {formData.databases.length > 0 && (
                    <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {formData.databases.length} databases
                    </span>
                  )}
                  {formData.files.length > 0 && (
                    <span style={{ background: "#fce7f3", color: "#be185d", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {formData.files.length} files
                    </span>
                  )}
                  {formData.knowledge.length > 0 && (
                    <span style={{ background: "#f3e8ff", color: "#7c3aed", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {formData.knowledge.length} knowledge
                    </span>
                  )}
                  {formData.prompts.length > 0 && (
                    <span style={{ background: "#fef2f2", color: "#dc2626", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      {formData.prompts.length} prompts
                    </span>
                  )}
                  {Object.keys(formData.contextSchema).length > 0 && (
                    <span style={{ background: "#e5e7eb", color: "#374151", padding: "2px 6px", borderRadius: "12px", fontSize: "11px" }}>
                      context schema
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button 
                  type="submit" 
                  disabled={apiEndpoints.length === 0 || !formData.packName}
                >
                  Create Pack
                </Button>
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Resource Form Modal */}
      {showResourceForm && (
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
          zIndex: 1001
        }}>
          <Card title={`Add ${activeResourceTab.charAt(0).toUpperCase() + activeResourceTab.slice(1)}`} style={{ width: "500px", maxWidth: "90vw" }}>
            <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
              {activeResourceTab === "tools" && (
                <>
                  <Input
                    label="Tool Name"
                    value={currentResource.name || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, name: e.target.value })}
                    placeholder="e.g., create_user"
                  />
                  <Input
                    label="Description"
                    value={currentResource.description || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, description: e.target.value })}
                    placeholder="What does this tool do?"
                  />
                  <Input
                    label="Endpoint"
                    value={currentResource.endpoint || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, endpoint: e.target.value })}
                    placeholder="/api/users"
                  />
                  <Input
                    label="Methods"
                    value={currentResource.methods || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, methods: e.target.value })}
                    placeholder="POST,GET,PUT"
                  />
                </>
              )}
              
              {activeResourceTab === "databases" && (
                <>
                  <Input
                    label="Table/View Name"
                    value={currentResource.name || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, name: e.target.value })}
                    placeholder="e.g., users"
                  />
                  <Input
                    label="Schema"
                    value={currentResource.schema || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, schema: e.target.value })}
                    placeholder="public"
                  />
                  <Input
                    label="Type"
                    value={currentResource.type || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, type: e.target.value })}
                    placeholder="table, view, function"
                  />
                  <Textarea
                    label="Description"
                    value={currentResource.description || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, description: e.target.value })}
                    placeholder="What data does this contain?"
                    rows={2}
                  />
                </>
              )}

              {activeResourceTab === "files" && (
                <>
                  <Input
                    label="File/Directory Name"
                    value={currentResource.name || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, name: e.target.value })}
                    placeholder="e.g., documents, uploads"
                  />
                  <Input
                    label="Path"
                    value={currentResource.path || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, path: e.target.value })}
                    placeholder="/uploads/documents"
                  />
                  <Input
                    label="Type"
                    value={currentResource.type || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, type: e.target.value })}
                    placeholder="directory, file, image"
                  />
                  <Textarea
                    label="Description"
                    value={currentResource.description || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, description: e.target.value })}
                    placeholder="What files are stored here?"
                    rows={2}
                  />
                </>
              )}

              {activeResourceTab === "knowledge" && (
                <>
                  <Input
                    label="Knowledge Base Name"
                    value={currentResource.name || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, name: e.target.value })}
                    placeholder="e.g., FAQ, documentation"
                  />
                  <Input
                    label="Type"
                    value={currentResource.type || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, type: e.target.value })}
                    placeholder="searchable, indexed, vector"
                  />
                  <Textarea
                    label="Description"
                    value={currentResource.description || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, description: e.target.value })}
                    placeholder="What knowledge is available?"
                    rows={3}
                  />
                </>
              )}

              {activeResourceTab === "prompts" && (
                <>
                  <Input
                    label="Prompt Name"
                    value={currentResource.name || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, name: e.target.value })}
                    placeholder="e.g., ticket_response"
                  />
                  <Input
                    label="Type"
                    value={currentResource.type || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, type: e.target.value })}
                    placeholder="template, instruction, system"
                  />
                  <Textarea
                    label="Content"
                    value={currentResource.content || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, content: e.target.value })}
                    placeholder="Enter the prompt template with {{variables}}"
                    rows={4}
                  />
                </>
              )}

              {activeResourceTab === "context" && (
                <>
                  <Input
                    label="Context Field"
                    value={currentResource.field || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, field: e.target.value })}
                    placeholder="e.g., userId, sessionId"
                  />
                  <Input
                    label="Type"
                    value={currentResource.type || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, type: e.target.value })}
                    placeholder="string, number, object"
                  />
                  <Textarea
                    label="Description"
                    value={currentResource.description || ""}
                    onChange={(e) => setCurrentResource({ ...currentResource, description: e.target.value })}
                    placeholder="What context does this field store?"
                    rows={2}
                  />
                </>
              )}

              <div style={{ display: "flex", gap: "var(--rku-space-2)", marginTop: "var(--rku-space-2)" }}>
                <Button 
                  onClick={() => {
                    const newResource = { ...currentResource, id: Date.now().toString() };
                    setFormData(prev => ({
                      ...prev,
                      [activeResourceTab]: [...(prev[activeResourceTab as keyof typeof prev] as any[]), newResource]
                    }));
                    setCurrentResource({});
                    setShowResourceForm(false);
                  }}
                  disabled={!currentResource.name}
                >
                  Add {activeResourceTab.slice(0, -1)}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setCurrentResource({});
                    setShowResourceForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}