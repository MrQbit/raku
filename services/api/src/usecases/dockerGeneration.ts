import { exec } from "child_process";
import { promisify } from "util";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import prisma from "../db/client";

const execAsync = promisify(exec);

export interface PackInfo {
  id: string;
  namespace: string;
  version: string;
  intents: any[];
}

export interface DockerBuildConfig {
  serverName: string;
  packs: PackInfo[];
  registryUrl: string;
  baseImage?: string;
  nodeVersion?: string;
  port?: number;
  resources?: {
    cpu?: string;
    memory?: string;
  };
}

export async function generateDockerfile(config: DockerBuildConfig): Promise<string> {
  const { serverName, packs, baseImage = "node:18-alpine", nodeVersion = "18", port = 3000 } = config;
  
  const packNamespaces = packs.map(p => p.namespace).join(", ");
  const totalIntents = packs.reduce((sum, pack) => sum + pack.intents.length, 0);

  const dockerfile = `# RAKU Generated MCP Server: ${serverName}
FROM ${baseImage}

# Metadata
LABEL raku.server.name="${serverName}"
LABEL raku.server.packs="${packNamespaces}"
LABEL raku.server.intents="${totalIntents}"

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S raku -u 1001
USER raku

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Expose port
EXPOSE ${port}

# Start the server
CMD ["node", "server.js"]
`;

  return dockerfile;
}

export async function generatePackageJson(config: DockerBuildConfig): Promise<any> {
  const { serverName, packs } = config;
  
  const packageJson = {
    name: `@raku/mcp-${serverName.toLowerCase()}`,
    version: "1.0.0",
    description: `RAKU Generated MCP Server for ${serverName}`,
    main: "server.js",
    scripts: {
      start: "node server.js",
      dev: "node server.js"
    },
    dependencies: {
      "@modelcontextprotocol/sdk": "^0.4.0",
      "fastify": "^4.24.3",
      "zod": "^3.22.4",
      "dotenv": "^16.3.1"
    },
    keywords: ["mcp", "raku", "server"],
    author: "RAKU Factory",
    license: "MIT"
  };

  return packageJson;
}

export async function generateServerCode(config: DockerBuildConfig): Promise<string> {
  const { serverName, packs, port = 3000 } = config;
  
  // Generate intents from all packs
  const allIntents = packs.flatMap(pack => 
    pack.intents.map(intent => ({
      name: intent.name || `${pack.namespace}.${intent.intent}`,
      description: intent.description || `Generated from ${pack.namespace} pack`,
      inputSchema: intent.inputSchema || { type: "object", properties: {} }
    }))
  );

  const serverCode = `// RAKU Generated MCP Server: ${serverName}
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Fastify from "fastify";

const server = new Server(
  {
    name: "${serverName}",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Generated intents from packs
const intents = ${JSON.stringify(allIntents, null, 2)};

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: intents.map(intent => ({
      name: intent.name,
      description: intent.description,
      inputSchema: intent.inputSchema
    }))
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const intent = intents.find(i => i.name === name);
  if (!intent) {
    throw new Error(\`Unknown tool: \${name}\`);
  }

  // TODO: Implement actual tool logic based on pack definitions
  // This is a placeholder implementation
  return {
    content: [
      {
        type: "text",
        text: \`Tool '\${name}' called with args: \${JSON.stringify(args, null, 2)}\`
      }
    ]
  };
});

// Health check endpoint
const fastify = Fastify({ logger: true });

fastify.get('/health', async (request, reply) => {
  return { status: 'healthy', server: '${serverName}', timestamp: new Date().toISOString() };
});

// Start servers
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  try {
    await fastify.listen({ port: ${port}, host: '0.0.0.0' });
    console.log(\`MCP Server \${server.name} listening on port ${port}\`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
`;

  return serverCode;
}

export async function buildDockerImage(config: DockerBuildConfig): Promise<string> {
  const { serverName, registryUrl } = config;
  const imageTag = `${registryUrl}/mcp/${serverName.toLowerCase()}:latest`;
  
  // Create temporary directory for build context
  const buildDir = join(tmpdir(), `raku-build-${Date.now()}`);
  mkdirSync(buildDir, { recursive: true });

  try {
    // Generate files
    const dockerfile = await generateDockerfile(config);
    const packageJson = await generatePackageJson(config);
    const serverCode = await generateServerCode(config);

    // Write files to build directory
    writeFileSync(join(buildDir, "Dockerfile"), dockerfile);
    writeFileSync(join(buildDir, "package.json"), JSON.stringify(packageJson, null, 2));
    writeFileSync(join(buildDir, "server.js"), serverCode);

    // Build Docker image
    console.log(`Building Docker image: ${imageTag}`);
    const { stdout, stderr } = await execAsync(`docker build -t ${imageTag} ${buildDir}`);
    
    if (stderr && !stderr.includes("Successfully built")) {
      throw new Error(`Docker build failed: ${stderr}`);
    }

    console.log(`Docker image built successfully: ${imageTag}`);
    return imageTag;

  } finally {
    // Cleanup build directory
    rmSync(buildDir, { recursive: true, force: true });
  }
}

export async function pushDockerImage(imageTag: string): Promise<void> {
  console.log(`Pushing Docker image: ${imageTag}`);
  const { stdout, stderr } = await execAsync(`docker push ${imageTag}`);
  
  if (stderr && !stderr.includes("pushed")) {
    throw new Error(`Docker push failed: ${stderr}`);
  }

  console.log(`Docker image pushed successfully: ${imageTag}`);
}

export async function deployMcpServer(data: {
  serverName: string;
  landingZoneId: string;
  packIds: string[];
  config?: any;
}): Promise<string> {
  // Get landing zone
  const landingZone = await prisma.landingZone.findUnique({
    where: { id: data.landingZoneId }
  });

  if (!landingZone) {
    throw new Error(`Landing zone not found: ${data.landingZoneId}`);
  }

  // Get packs
  const packs = await prisma.pack.findMany({
    where: { id: { in: data.packIds } }
  });

  if (packs.length !== data.packIds.length) {
    throw new Error("Some packs not found");
  }

  // Generate namespace
  const namespace = `${landingZone.namespacePrefix}-${data.serverName.toLowerCase()}`;

  // Create deployment record
  const deployment = await prisma.mcpServerDeployment.create({
    data: {
      serverName: data.serverName,
      landingZoneId: data.landingZoneId,
      namespace: namespace,
      imageUrl: "pending", // Will be updated after build
      status: "building",
      configJson: data.config
    }
  });

  try {
    // Prepare build config
    const buildConfig: DockerBuildConfig = {
      serverName: data.serverName,
      packs: packs.map(pack => ({
        id: pack.id,
        namespace: pack.namespace,
        version: pack.version,
        intents: Array.isArray(pack.intentsJson) ? pack.intentsJson : []
      })),
      registryUrl: landingZone.registryUrl,
      ...data.config
    };

    // Build Docker image
    const imageTag = await buildDockerImage(buildConfig);

    // Push Docker image
    await pushDockerImage(imageTag);

    // Update deployment with image URL
    await prisma.mcpServerDeployment.update({
      where: { id: deployment.id },
      data: {
        imageUrl: imageTag,
        status: "deploying"
      }
    });

    return deployment.id;

  } catch (error) {
    // Update deployment status to failed
    await prisma.mcpServerDeployment.update({
      where: { id: deployment.id },
      data: {
        status: "failed",
        configJson: {
          ...data.config,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });

    throw error;
  }
}
