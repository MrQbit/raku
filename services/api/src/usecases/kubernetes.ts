import { exec } from "child_process";
import { promisify } from "util";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import prisma from "../db/client";
import { getLandingZoneToken } from "./landingZones";

const execAsync = promisify(exec);

export interface KubernetesConfig {
  replicas?: number;
  resources?: {
    requests?: {
      cpu?: string;
      memory?: string;
    };
    limits?: {
      cpu?: string;
      memory?: string;
    };
  };
  service?: {
    type?: string;
    port?: number;
    targetPort?: number;
  };
  healthCheck?: {
    enabled?: boolean;
    path?: string;
    initialDelaySeconds?: number;
    periodSeconds?: number;
  };
}

export async function generateKubernetesManifests(
  deploymentId: string,
  config: KubernetesConfig = {}
): Promise<{
  namespace: string;
  deployment: string;
  service: string;
}> {
  const deployment = await prisma.mcpServerDeployment.findUnique({
    where: { id: deploymentId },
    include: {
      landingZone: true
    }
  });

  if (!deployment) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  const {
    serverName,
    namespace,
    imageUrl,
    landingZone
  } = deployment;

  const {
    replicas = 2,
    resources = {
      requests: { cpu: "100m", memory: "128Mi" },
      limits: { cpu: "500m", memory: "512Mi" }
    },
    service = { type: "ClusterIP", port: 80, targetPort: 3000 },
    healthCheck = { enabled: true, path: "/health", initialDelaySeconds: 30, periodSeconds: 10 }
  } = config;

  // Generate Namespace manifest
  const namespaceManifest = `apiVersion: v1
kind: Namespace
metadata:
  name: ${namespace}
  labels:
    app: raku-mcp
    server: ${serverName}
    managed-by: raku
`;

  // Generate Deployment manifest
  const deploymentManifest = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${serverName}
  namespace: ${namespace}
  labels:
    app: raku-mcp
    server: ${serverName}
    managed-by: raku
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: raku-mcp
      server: ${serverName}
  template:
    metadata:
      labels:
        app: raku-mcp
        server: ${serverName}
        managed-by: raku
    spec:
      containers:
      - name: mcp-server
        image: ${imageUrl}
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: "${resources.requests?.cpu || "100m"}"
            memory: "${resources.requests?.memory || "128Mi"}"
          limits:
            cpu: "${resources.limits?.cpu || "500m"}"
            memory: "${resources.limits?.memory || "512Mi"}"
        ${healthCheck.enabled ? `livenessProbe:
          httpGet:
            path: ${healthCheck.path || "/health"}
            port: 3000
          initialDelaySeconds: ${healthCheck.initialDelaySeconds || 30}
          periodSeconds: ${healthCheck.periodSeconds || 10}
        readinessProbe:
          httpGet:
            path: ${healthCheck.path || "/health"}
            port: 3000
          initialDelaySeconds: ${healthCheck.initialDelaySeconds || 30}
          periodSeconds: ${healthCheck.periodSeconds || 10}` : ""}
        env:
        - name: NODE_ENV
          value: "production"
        - name: SERVER_NAME
          value: "${serverName}"
        - name: NAMESPACE
          value: "${namespace}"
      restartPolicy: Always
`;

  // Generate Service manifest
  const serviceManifest = `apiVersion: v1
kind: Service
metadata:
  name: ${serverName}-service
  namespace: ${namespace}
  labels:
    app: raku-mcp
    server: ${serverName}
    managed-by: raku
spec:
  type: ${service.type || "ClusterIP"}
  ports:
  - port: ${service.port || 80}
    targetPort: ${service.targetPort || 3000}
    protocol: TCP
    name: http
  selector:
    app: raku-mcp
    server: ${serverName}
`;

  return {
    namespace: namespaceManifest,
    deployment: deploymentManifest,
    service: serviceManifest
  };
}

export async function deployToKubernetes(deploymentId: string): Promise<void> {
  const deployment = await prisma.mcpServerDeployment.findUnique({
    where: { id: deploymentId },
    include: {
      landingZone: true
    }
  });

  if (!deployment) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  if (deployment.status !== "deploying") {
    throw new Error(`Deployment is not in deploying status: ${deployment.status}`);
  }

  const { landingZone } = deployment;

  try {
    // Get cluster token
    const clusterToken = await getLandingZoneToken(landingZone.id);

    // Create temporary directory for manifests
    const manifestsDir = join(tmpdir(), `raku-k8s-${Date.now()}`);
    mkdirSync(manifestsDir, { recursive: true });

    try {
      // Generate manifests
      const manifests = await generateKubernetesManifests(deploymentId);
      
      // Write manifest files
      writeFileSync(join(manifestsDir, "namespace.yaml"), manifests.namespace);
      writeFileSync(join(manifestsDir, "deployment.yaml"), manifests.deployment);
      writeFileSync(join(manifestsDir, "service.yaml"), manifests.service);

      // Apply manifests to Kubernetes cluster
      console.log(`Deploying to cluster: ${landingZone.clusterUrl}`);
      
      // Set kubectl context (this would need to be configured based on cluster type)
      await execAsync(`kubectl config set-cluster raku-cluster --server=${landingZone.clusterUrl}`);
      await execAsync(`kubectl config set-credentials raku-user --token=${clusterToken}`);
      await execAsync(`kubectl config set-context raku-context --cluster=raku-cluster --user=raku-user`);
      await execAsync(`kubectl config use-context raku-context`);

      // Apply manifests
      await execAsync(`kubectl apply -f ${manifestsDir}`);

      // Wait for deployment to be ready
      await execAsync(`kubectl rollout status deployment/${deployment.serverName} -n ${deployment.namespace} --timeout=300s`);

      // Update deployment status
      await prisma.mcpServerDeployment.update({
        where: { id: deploymentId },
        data: {
          status: "running",
          deployedAt: new Date()
        }
      });

      console.log(`Deployment ${deploymentId} is now running`);

    } finally {
      // Cleanup manifests directory
      rmSync(manifestsDir, { recursive: true, force: true });
    }

  } catch (error) {
    // Update deployment status to failed
    await prisma.mcpServerDeployment.update({
      where: { id: deploymentId },
      data: {
        status: "failed",
        configJson: {
          ...deployment.configJson as any,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });

    throw error;
  }
}

export async function getDeploymentStatus(deploymentId: string): Promise<{
  status: string;
  replicas: number;
  readyReplicas: number;
  availableReplicas: number;
  pods: Array<{
    name: string;
    status: string;
    ready: boolean;
    restarts: number;
  }>;
}> {
  const deployment = await prisma.mcpServerDeployment.findUnique({
    where: { id: deploymentId },
    include: {
      landingZone: true
    }
  });

  if (!deployment) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  try {
    // Set kubectl context
    const clusterToken = await getLandingZoneToken(deployment.landingZone.id);
    await execAsync(`kubectl config set-cluster raku-cluster --server=${deployment.landingZone.clusterUrl}`);
    await execAsync(`kubectl config set-credentials raku-user --token=${clusterToken}`);
    await execAsync(`kubectl config set-context raku-context --cluster=raku-cluster --user=raku-user`);
    await execAsync(`kubectl config use-context raku-context`);

    // Get deployment status
    const { stdout: deploymentStatus } = await execAsync(
      `kubectl get deployment ${deployment.serverName} -n ${deployment.namespace} -o json`
    );

    const deploymentData = JSON.parse(deploymentStatus);
    const status = deploymentData.status;

    // Get pods
    const { stdout: podsStatus } = await execAsync(
      `kubectl get pods -l app=raku-mcp,server=${deployment.serverName} -n ${deployment.namespace} -o json`
    );

    const podsData = JSON.parse(podsStatus);
    const pods = podsData.items.map((pod: any) => ({
      name: pod.metadata.name,
      status: pod.status.phase,
      ready: pod.status.conditions?.find((c: any) => c.type === "Ready")?.status === "True",
      restarts: pod.status.containerStatuses?.[0]?.restartCount || 0
    }));

    return {
      status: status.conditions?.find((c: any) => c.type === "Available")?.status === "True" ? "running" : "deploying",
      replicas: status.replicas || 0,
      readyReplicas: status.readyReplicas || 0,
      availableReplicas: status.availableReplicas || 0,
      pods
    };

  } catch (error) {
    console.error("Error getting deployment status:", error);
    return {
      status: "unknown",
      replicas: 0,
      readyReplicas: 0,
      availableReplicas: 0,
      pods: []
    };
  }
}

export async function scaleDeployment(deploymentId: string, replicas: number): Promise<void> {
  const deployment = await prisma.mcpServerDeployment.findUnique({
    where: { id: deploymentId },
    include: {
      landingZone: true
    }
  });

  if (!deployment) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  try {
    // Set kubectl context
    const clusterToken = await getLandingZoneToken(deployment.landingZone.id);
    await execAsync(`kubectl config set-cluster raku-cluster --server=${deployment.landingZone.clusterUrl}`);
    await execAsync(`kubectl config set-credentials raku-user --token=${clusterToken}`);
    await execAsync(`kubectl config set-context raku-context --cluster=raku-cluster --user=raku-user`);
    await execAsync(`kubectl config use-context raku-context`);

    // Scale deployment
    await execAsync(`kubectl scale deployment ${deployment.serverName} --replicas=${replicas} -n ${deployment.namespace}`);

    console.log(`Scaled deployment ${deploymentId} to ${replicas} replicas`);

  } catch (error) {
    throw new Error(`Failed to scale deployment: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteKubernetesDeployment(deploymentId: string): Promise<void> {
  const deployment = await prisma.mcpServerDeployment.findUnique({
    where: { id: deploymentId },
    include: {
      landingZone: true
    }
  });

  if (!deployment) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  try {
    // Set kubectl context
    const clusterToken = await getLandingZoneToken(deployment.landingZone.id);
    await execAsync(`kubectl config set-cluster raku-cluster --server=${deployment.landingZone.clusterUrl}`);
    await execAsync(`kubectl config set-credentials raku-user --token=${clusterToken}`);
    await execAsync(`kubectl config set-context raku-context --cluster=raku-cluster --user=raku-user`);
    await execAsync(`kubectl config use-context raku-context`);

    // Delete resources
    await execAsync(`kubectl delete deployment ${deployment.serverName} -n ${deployment.namespace}`);
    await execAsync(`kubectl delete service ${deployment.serverName}-service -n ${deployment.namespace}`);
    await execAsync(`kubectl delete namespace ${deployment.namespace}`);

    console.log(`Deleted Kubernetes deployment for ${deploymentId}`);

  } catch (error) {
    throw new Error(`Failed to delete Kubernetes deployment: ${error instanceof Error ? error.message : String(error)}`);
  }
}
