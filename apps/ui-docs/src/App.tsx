import React, { useState } from "react";
import { Button, Card } from "@raku/ui-foundation";
import "@raku/ui-foundation/dist/tokens.css";

export default function App() {
  const [activeTab, setActiveTab] = useState<"getting-started" | "api-docs" | "get-help">("getting-started");

  const GettingStarted = () => (
    <div style={{ display: "grid", gap: "var(--rku-space-4)" }}>
      <Card title="Welcome to RAKU - MCP Factory & Manager">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <p>
            RAKU is an enterprise-ready MCP (Model Context Protocol) Factory that automates the creation, 
            deployment, and management of MCP servers. Transform your existing APIs into intelligent, 
            agent-ready tools with just a few clicks.
          </p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--rku-space-3)" }}>
            <Card title="🚀 Quick Start">
              <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <div>
                  <strong>1. Create a Pack</strong>
                  <p>Go to the <strong>Packs</strong> tab and create your first pack by discovering APIs</p>
                </div>
                <div>
                  <strong>2. Deploy a Server</strong>
                  <p>Use the <strong>Servers</strong> tab to create and deploy MCP servers</p>
                </div>
                <div>
                  <strong>3. Connect Your Agent</strong>
                  <p>Use the connection instructions to integrate with your AI agent</p>
                </div>
              </div>
            </Card>

            <Card title="📚 Key Concepts">
              <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <div>
                  <strong>Packs</strong>
                  <p>Logical groupings of tools from one or more APIs</p>
                </div>
                <div>
                  <strong>Servers</strong>
                  <p>Deployed MCP instances that expose packs to agents</p>
                </div>
                <div>
                  <strong>Landing Zones</strong>
                  <p>Kubernetes clusters where servers are deployed</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <Card title="🔐 Authentication Setup">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <p>To connect your AI agent to RAKU, you'll need to configure authentication:</p>
          
          <div style={{ 
            background: "#f8fafc", 
            padding: "var(--rku-space-3)", 
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ margin: "0 0 var(--rku-space-2) 0" }}>Step 1: Get Your API Key</h4>
            <p style={{ margin: "0 0 var(--rku-space-2) 0" }}>
              Contact your RAKU administrator to get your API key, or if you're running locally:
            </p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              <div># Set your API key in environment variables</div>
              <div>export RAKU_API_KEY="your-api-key-here"</div>
            </div>
          </div>

          <div style={{ 
            background: "#f8fafc", 
            padding: "var(--rku-space-3)", 
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ margin: "0 0 var(--rku-space-2) 0" }}>Step 2: Configure Your Agent</h4>
            <p style={{ margin: "0 0 var(--rku-space-2) 0" }}>
              Add RAKU router to your agent configuration:
            </p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              overflow: "auto"
            }}>
              {`{
  "mcpServers": {
    "raku-router": {
      "command": "npx",
      "args": ["@raku/router-client"],
      "env": {
        "RAKU_ROUTER_URL": "http://localhost:8080",
        "RAKU_API_KEY": "raku-w1gjxjqpv6boxhcikfs8ng"
      }
    }
  }
}`}
            </div>
          </div>

          <div style={{ 
            background: "#f8fafc", 
            padding: "var(--rku-space-3)", 
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ margin: "0 0 var(--rku-space-2) 0" }}>Step 2: Get Your API Key</h4>
            <p style={{ margin: "0 0 var(--rku-space-2) 0" }}>
              Generate a valid API key for authentication:
            </p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              marginBottom: "var(--rku-space-2)"
            }}>
              <div>curl http://localhost:8080/v1/auth/generate-key</div>
            </div>
            <p style={{ margin: "0 0 var(--rku-space-2) 0", fontSize: "14px", color: "#6b7280" }}>
              This will return a JSON response with your API key and usage examples.
            </p>
          </div>

          <div style={{ 
            background: "#f8fafc", 
            padding: "var(--rku-space-3)", 
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ margin: "0 0 var(--rku-space-2) 0" }}>Step 3: Test Connection</h4>
            <p style={{ margin: "0 0 var(--rku-space-2) 0" }}>
              Verify your connection by making a test request:
            </p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              <div>curl -H "Authorization: Bearer raku-w1gjxjqpv6boxhcikfs8ng" \\</div>
              <div style={{ marginLeft: "2ch" }}>http://localhost:8080/v1/servers</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="🎯 Common Workflows">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <div>
            <h4>Creating Your First Pack</h4>
            <ol style={{ paddingLeft: "var(--rku-space-4)" }}>
              <li>Go to the <strong>Packs</strong> tab</li>
              <li>Click "Create Pack from API"</li>
              <li>Enter your API endpoint URL</li>
              <li>Select the tools you want to include</li>
              <li>Add additional APIs if needed</li>
              <li>Create the pack</li>
            </ol>
          </div>

          <div>
            <h4>Deploying a Server</h4>
            <ol style={{ paddingLeft: "var(--rku-space-4)" }}>
              <li>Go to the <strong>Servers</strong> tab</li>
              <li>Click "New Server"</li>
              <li>Choose "Create New Server from Packs"</li>
              <li>Select the packs to include</li>
              <li>Choose a landing zone</li>
              <li>Configure resources and deploy</li>
            </ol>
          </div>

          <div>
            <h4>Using Pack from Catalog</h4>
            <ol style={{ paddingLeft: "var(--rku-space-4)" }}>
              <li>Go to the <strong>Catalog</strong> tab</li>
              <li>Browse available packs</li>
              <li>Click on a pack to see details</li>
              <li>Click "Create Server from Pack"</li>
              <li>Configure and deploy</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );

  const ApiDocumentation = () => (
    <div style={{ display: "grid", gap: "var(--rku-space-4)" }}>
      <Card title="📡 RAKU API Documentation">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <p>
            The RAKU API provides comprehensive endpoints for managing packs, servers, deployments, 
            and landing zones. All endpoints require authentication via API key.
          </p>

          <div style={{ 
            background: "#f8fafc", 
            padding: "var(--rku-space-3)", 
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ margin: "0 0 var(--rku-space-2) 0" }}>Base URL</h4>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              http://localhost:8080/v1
            </div>
          </div>

          <div style={{ 
            background: "#f8fafc", 
            padding: "var(--rku-space-3)", 
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ margin: "0 0 var(--rku-space-2) 0" }}>Authentication</h4>
            <p style={{ margin: "0 0 var(--rku-space-2) 0" }}>
              Include your API key in the Authorization header:
            </p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              Authorization: Bearer your-api-key-here
            </div>
          </div>
        </div>
      </Card>

      <Card title="📦 Pack Management API">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <div>
            <h4>GET /v1/packs</h4>
            <p>List all available packs with consumption data</p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              curl -H "Authorization: Bearer your-key" http://localhost:8080/v1/packs
            </div>
          </div>

          <div>
            <h4>POST /v1/packs</h4>
            <p>Create a new pack from API discovery</p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              overflow: "auto"
            }}>
              {`curl -X POST -H "Authorization: Bearer your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "user-management",
    "version": "1.0.0",
    "description": "User management tools",
    "intentsJson": [...]
  }' \\
  http://localhost:8080/v1/packs`}
            </div>
          </div>

          <div>
            <h4>GET /v1/packs/:id</h4>
            <p>Get detailed information about a specific pack</p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              curl -H "Authorization: Bearer your-key" http://localhost:8080/v1/packs/pack-id
            </div>
          </div>
        </div>
      </Card>

      <Card title="🖥️ Server Management API">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <div>
            <h4>GET /v1/servers</h4>
            <p>List all MCP servers (third-party and RAKU-created)</p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              curl -H "Authorization: Bearer your-key" http://localhost:8080/v1/servers
            </div>
          </div>

          <div>
            <h4>POST /v1/servers/deploy</h4>
            <p>Deploy a new MCP server from packs</p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              overflow: "auto"
            }}>
              {`curl -X POST -H "Authorization: Bearer your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serverName": "my-mcp-server",
    "landingZoneId": "landing-zone-id",
    "packIds": ["pack-id-1", "pack-id-2"],
    "config": {
      "replicas": 2,
      "resources": {
        "cpu": "200m",
        "memory": "256Mi"
      }
    }
  }' \\
  http://localhost:8080/v1/servers/deploy`}
            </div>
          </div>

          <div>
            <h4>POST /v1/integrations/mcp</h4>
            <p>Register a third-party MCP server</p>
            <div style={{ 
              background: "#1f2937", 
              color: "#f9fafb", 
              padding: "var(--rku-space-2)", 
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              overflow: "auto"
            }}>
              {`curl -X POST -H "Authorization: Bearer your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "external-mcp",
    "baseUrl": "https://api.example.com",
    "authType": "bearer",
    "authHeader": "token-here",
    "description": "External MCP server"
  }' \\
  http://localhost:8080/v1/integrations/mcp`}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const GetHelp = () => (
    <div style={{ display: "grid", gap: "var(--rku-space-4)" }}>
      <Card title="🆘 Get Help">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <p>
            Need help with RAKU? Here are the resources available to get you unstuck:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--rku-space-3)" }}>
            <Card title="📖 Documentation">
              <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <div>
                  <strong>Getting Started Guide</strong>
                  <p>Complete walkthrough for new users</p>
                </div>
                <div>
                  <strong>API Reference</strong>
                  <p>Detailed API documentation with examples</p>
                </div>
                <div>
                  <strong>Architecture Guide</strong>
                  <p>Understanding RAKU's system architecture</p>
                </div>
              </div>
            </Card>

            <Card title="🔧 Troubleshooting">
              <div style={{ display: "grid", gap: "var(--rku-space-2)" }}>
                <div>
                  <strong>Common Issues</strong>
                  <p>Solutions to frequently encountered problems</p>
                </div>
                <div>
                  <strong>Connection Problems</strong>
                  <p>Debugging agent connectivity issues</p>
                </div>
                <div>
                  <strong>Deployment Errors</strong>
                  <p>Resolving Kubernetes deployment issues</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <Card title="🐛 Common Issues & Solutions">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <div>
            <h4>❌ "Connection Refused" Error</h4>
            <div style={{ 
              background: "#fef2f2", 
              padding: "var(--rku-space-3)", 
              borderRadius: "8px",
              border: "1px solid #fecaca"
            }}>
              <p><strong>Problem:</strong> Your agent can't connect to the RAKU router</p>
              <p><strong>Solutions:</strong></p>
              <ul style={{ paddingLeft: "var(--rku-space-4)" }}>
                <li>Verify the RAKU router is running on port 8080</li>
                <li>Check your API key is correct</li>
                <li>Ensure your agent configuration includes the right URL</li>
                <li>Test connectivity with: <code>curl http://localhost:8080/v1/servers</code></li>
              </ul>
            </div>
          </div>

          <div>
            <h4>❌ "Authentication Failed" Error</h4>
            <div style={{ 
              background: "#fef2f2", 
              padding: "var(--rku-space-3)", 
              borderRadius: "8px",
              border: "1px solid #fecaca"
            }}>
              <p><strong>Problem:</strong> Your API key is not being accepted</p>
              <p><strong>Solutions:</strong></p>
              <ul style={{ paddingLeft: "var(--rku-space-4)" }}>
                <li>Double-check your API key format</li>
                <li>Ensure the Authorization header is: <code>Bearer your-api-key</code></li>
                <li>Contact your administrator for a new API key</li>
                <li>Check if your key has expired</li>
              </ul>
            </div>
          </div>

          <div>
            <h4>❌ "Pack Creation Failed" Error</h4>
            <div style={{ 
              background: "#fef2f2", 
              padding: "var(--rku-space-3)", 
              borderRadius: "8px",
              border: "1px solid #fecaca"
            }}>
              <p><strong>Problem:</strong> Can't create a pack from your API</p>
              <p><strong>Solutions:</strong></p>
              <ul style={{ paddingLeft: "var(--rku-space-4)" }}>
                <li>Verify your API endpoint is accessible</li>
                <li>Check if your API has OpenAPI/Swagger documentation</li>
                <li>Ensure the API supports CORS if calling from browser</li>
                <li>Try with a public API first (like JSONPlaceholder)</li>
              </ul>
            </div>
          </div>

          <div>
            <h4>❌ "Deployment Failed" Error</h4>
            <div style={{ 
              background: "#fef2f2", 
              padding: "var(--rku-space-3)", 
              borderRadius: "8px",
              border: "1px solid #fecaca"
            }}>
              <p><strong>Problem:</strong> Server deployment to Kubernetes fails</p>
              <p><strong>Solutions:</strong></p>
              <ul style={{ paddingLeft: "var(--rku-space-4)" }}>
                <li>Verify your landing zone configuration</li>
                <li>Check Kubernetes cluster connectivity</li>
                <li>Ensure you have sufficient resources</li>
                <li>Check the deployment logs in the Observability tab</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card title="📞 Support Channels">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--rku-space-3)" }}>
            <div style={{ 
              background: "#f8fafc", 
              padding: "var(--rku-space-3)", 
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <h4>💬 Community Support</h4>
              <p>Join our community Discord for peer-to-peer help</p>
              <Button size="sm" style={{ background: "#5865f2", color: "white" }}>
                Join Discord
              </Button>
            </div>

            <div style={{ 
              background: "#f8fafc", 
              padding: "var(--rku-space-3)", 
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <h4>📧 Email Support</h4>
              <p>Get help from our support team</p>
              <Button size="sm" style={{ background: "#3b82f6", color: "white" }}>
                Contact Support
              </Button>
            </div>

            <div style={{ 
              background: "#f8fafc", 
              padding: "var(--rku-space-3)", 
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <h4>📋 Issue Tracker</h4>
              <p>Report bugs and request features</p>
              <Button size="sm" style={{ background: "#10b981", color: "white" }}>
                GitHub Issues
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="🎓 Learning Resources">
        <div style={{ display: "grid", gap: "var(--rku-space-3)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--rku-space-3)" }}>
            <div>
              <h4>📹 Video Tutorials</h4>
              <ul style={{ paddingLeft: "var(--rku-space-4)" }}>
                <li>Getting Started with RAKU</li>
                <li>Creating Your First Pack</li>
                <li>Deploying MCP Servers</li>
                <li>Agent Integration</li>
              </ul>
            </div>

            <div>
              <h4>📝 Blog Posts</h4>
              <ul style={{ paddingLeft: "var(--rku-space-4)" }}>
                <li>MCP Best Practices</li>
                <li>API Discovery Strategies</li>
                <li>Scaling MCP Deployments</li>
                <li>Security Considerations</li>
              </ul>
            </div>

            <div>
              <h4>🔧 Examples</h4>
              <ul style={{ paddingLeft: "var(--rku-space-4)" }}>
                <li>Sample Pack Configurations</li>
                <li>Agent Integration Examples</li>
                <li>Kubernetes Manifests</li>
                <li>CI/CD Pipelines</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: "var(--rku-space-3)", maxWidth: "1200px" }}>
      <div style={{ marginBottom: "var(--rku-space-4)" }}>
        <h1>RAKU Documentation</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Complete guide to using RAKU MCP Factory & Manager
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "var(--rku-space-2)", marginBottom: "var(--rku-space-4)" }}>
        <Button 
          onClick={() => setActiveTab("getting-started")} 
          style={{ 
            background: activeTab === "getting-started" ? "#3b82f6" : "#f3f4f6",
            color: activeTab === "getting-started" ? "white" : "black"
          }}
        >
          Getting Started
        </Button>
        <Button 
          onClick={() => setActiveTab("api-docs")} 
          style={{ 
            background: activeTab === "api-docs" ? "#3b82f6" : "#f3f4f6",
            color: activeTab === "api-docs" ? "white" : "black"
          }}
        >
          API Documentation
        </Button>
        <Button 
          onClick={() => setActiveTab("get-help")} 
          style={{ 
            background: activeTab === "get-help" ? "#3b82f6" : "#f3f4f6",
            color: activeTab === "get-help" ? "white" : "black"
          }}
        >
          Get Help
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "getting-started" && <GettingStarted />}
      {activeTab === "api-docs" && <ApiDocumentation />}
      {activeTab === "get-help" && <GetHelp />}
    </div>
  );
}
