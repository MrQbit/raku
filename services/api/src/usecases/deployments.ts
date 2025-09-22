import prisma from "../db/client";

export async function listDeployments(landingZoneId?: string) {
  const where = landingZoneId ? { landingZoneId } : {};
  
  const deployments = await prisma.mcpServerDeployment.findMany({
    where,
    include: {
      landingZone: {
        select: {
          id: true,
          name: true,
          clusterUrl: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return deployments.map(deployment => ({
    id: deployment.id,
    serverName: deployment.serverName,
    landingZone: {
      id: deployment.landingZone.id,
      name: deployment.landingZone.name,
      clusterUrl: deployment.landingZone.clusterUrl
    },
    namespace: deployment.namespace,
    imageUrl: deployment.imageUrl,
    status: deployment.status,
    config: deployment.configJson,
    deployedAt: deployment.deployedAt,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt
  }));
}

export async function getDeployment(deploymentId: string) {
  const deployment = await prisma.mcpServerDeployment.findUnique({
    where: { id: deploymentId },
    include: {
      landingZone: {
        select: {
          id: true,
          name: true,
          clusterUrl: true,
          registryUrl: true,
          namespacePrefix: true
        }
      }
    }
  });

  if (!deployment) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  return {
    id: deployment.id,
    serverName: deployment.serverName,
    landingZone: {
      id: deployment.landingZone.id,
      name: deployment.landingZone.name,
      clusterUrl: deployment.landingZone.clusterUrl,
      registryUrl: deployment.landingZone.registryUrl,
      namespacePrefix: deployment.landingZone.namespacePrefix
    },
    namespace: deployment.namespace,
    imageUrl: deployment.imageUrl,
    status: deployment.status,
    config: deployment.configJson,
    deployedAt: deployment.deployedAt,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt
  };
}

export async function createDeployment(data: {
  serverName: string;
  landingZoneId: string;
  namespace: string;
  imageUrl: string;
  config?: any;
}) {
  // Check if landing zone exists
  const landingZone = await prisma.landingZone.findUnique({
    where: { id: data.landingZoneId }
  });

  if (!landingZone) {
    throw new Error(`Landing zone not found: ${data.landingZoneId}`);
  }

  // Check if deployment with same name already exists in this namespace
  const existing = await prisma.mcpServerDeployment.findFirst({
    where: {
      serverName: data.serverName,
      namespace: data.namespace,
      landingZoneId: data.landingZoneId
    }
  });

  if (existing) {
    throw new Error(`Deployment '${data.serverName}' already exists in namespace '${data.namespace}'`);
  }

  const deployment = await prisma.mcpServerDeployment.create({
    data: {
      serverName: data.serverName,
      landingZoneId: data.landingZoneId,
      namespace: data.namespace,
      imageUrl: data.imageUrl,
      configJson: data.config,
      status: "pending"
    },
    include: {
      landingZone: {
        select: {
          id: true,
          name: true,
          clusterUrl: true
        }
      }
    }
  });

  return {
    id: deployment.id,
    serverName: deployment.serverName,
    landingZone: {
      id: deployment.landingZone.id,
      name: deployment.landingZone.name,
      clusterUrl: deployment.landingZone.clusterUrl
    },
    namespace: deployment.namespace,
    imageUrl: deployment.imageUrl,
    status: deployment.status,
    config: deployment.configJson,
    createdAt: deployment.createdAt
  };
}

export async function updateDeploymentStatus(deploymentId: string, updates: {
  status?: string;
  deployedAt?: Date;
}) {
  const deployment = await prisma.mcpServerDeployment.update({
    where: { id: deploymentId },
    data: {
      ...updates,
      updatedAt: new Date()
    },
    include: {
      landingZone: {
        select: {
          id: true,
          name: true,
          clusterUrl: true
        }
      }
    }
  });

  return {
    id: deployment.id,
    serverName: deployment.serverName,
    landingZone: {
      id: deployment.landingZone.id,
      name: deployment.landingZone.name,
      clusterUrl: deployment.landingZone.clusterUrl
    },
    namespace: deployment.namespace,
    imageUrl: deployment.imageUrl,
    status: deployment.status,
    config: deployment.configJson,
    deployedAt: deployment.deployedAt,
    updatedAt: deployment.updatedAt
  };
}

export async function deleteDeployment(deploymentId: string) {
  const deployment = await prisma.mcpServerDeployment.findUnique({
    where: { id: deploymentId },
    select: { status: true }
  });

  if (!deployment) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  if (deployment.status === "running") {
    throw new Error("Cannot delete running deployment. Stop the deployment first.");
  }

  await prisma.mcpServerDeployment.delete({
    where: { id: deploymentId }
  });

  return { success: true };
}
