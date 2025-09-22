import prisma from "../db/client";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-for-development-only";
const ALGORITHM = "aes-256-gcm";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function listLandingZones() {
  const zones = await prisma.landingZone.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { deployments: true }
      }
    }
  });

  return zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    clusterUrl: zone.clusterUrl,
    registryUrl: zone.registryUrl,
    namespacePrefix: zone.namespacePrefix,
    description: zone.description,
    isActive: zone.isActive,
    deploymentCount: zone._count.deployments,
    createdAt: zone.createdAt,
    updatedAt: zone.updatedAt
  }));
}

export async function getLandingZone(zoneId: string) {
  const zone = await prisma.landingZone.findUnique({
    where: { id: zoneId },
    include: {
      deployments: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!zone) {
    throw new Error(`Landing zone not found: ${zoneId}`);
  }

  return {
    id: zone.id,
    name: zone.name,
    clusterUrl: zone.clusterUrl,
    registryUrl: zone.registryUrl,
    namespacePrefix: zone.namespacePrefix,
    description: zone.description,
    isActive: zone.isActive,
    deployments: zone.deployments.map(deployment => ({
      id: deployment.id,
      serverName: deployment.serverName,
      namespace: deployment.namespace,
      imageUrl: deployment.imageUrl,
      status: deployment.status,
      deployedAt: deployment.deployedAt,
      createdAt: deployment.createdAt
    })),
    createdAt: zone.createdAt,
    updatedAt: zone.updatedAt
  };
}

export async function createLandingZone(data: {
  name: string;
  clusterUrl: string;
  token: string;
  registryUrl: string;
  namespacePrefix?: string;
  description?: string;
}) {
  // Check if name already exists
  const existing = await prisma.landingZone.findUnique({
    where: { name: data.name }
  });

  if (existing) {
    throw new Error(`Landing zone with name '${data.name}' already exists`);
  }

  const zone = await prisma.landingZone.create({
    data: {
      name: data.name,
      clusterUrl: data.clusterUrl,
      tokenEncrypted: encrypt(data.token),
      registryUrl: data.registryUrl,
      namespacePrefix: data.namespacePrefix || "mcp",
      description: data.description
    }
  });

  return {
    id: zone.id,
    name: zone.name,
    clusterUrl: zone.clusterUrl,
    registryUrl: zone.registryUrl,
    namespacePrefix: zone.namespacePrefix,
    description: zone.description,
    isActive: zone.isActive,
    createdAt: zone.createdAt
  };
}

export async function updateLandingZone(zoneId: string, data: {
  name?: string;
  clusterUrl?: string;
  token?: string;
  registryUrl?: string;
  namespacePrefix?: string;
  description?: string;
  isActive?: boolean;
}) {
  const updateData: any = { ...data };
  
  if (data.token) {
    updateData.tokenEncrypted = encrypt(data.token);
    delete updateData.token;
  }

  const zone = await prisma.landingZone.update({
    where: { id: zoneId },
    data: updateData
  });

  return {
    id: zone.id,
    name: zone.name,
    clusterUrl: zone.clusterUrl,
    registryUrl: zone.registryUrl,
    namespacePrefix: zone.namespacePrefix,
    description: zone.description,
    isActive: zone.isActive,
    updatedAt: zone.updatedAt
  };
}

export async function deleteLandingZone(zoneId: string) {
  // Check if there are any deployments
  const deploymentCount = await prisma.mcpServerDeployment.count({
    where: { landingZoneId: zoneId }
  });

  if (deploymentCount > 0) {
    throw new Error(`Cannot delete landing zone with ${deploymentCount} active deployments`);
  }

  await prisma.landingZone.delete({
    where: { id: zoneId }
  });

  return { success: true };
}

export async function getLandingZoneToken(zoneId: string): Promise<string> {
  const zone = await prisma.landingZone.findUnique({
    where: { id: zoneId },
    select: { tokenEncrypted: true }
  });

  if (!zone) {
    throw new Error(`Landing zone not found: ${zoneId}`);
  }

  return decrypt(zone.tokenEncrypted);
}
