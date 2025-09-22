-- CreateTable
CREATE TABLE "LandingZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clusterUrl" TEXT NOT NULL,
    "tokenEncrypted" TEXT NOT NULL,
    "registryUrl" TEXT NOT NULL,
    "namespacePrefix" TEXT NOT NULL DEFAULT 'mcp',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpServerDeployment" (
    "id" TEXT NOT NULL,
    "serverName" TEXT NOT NULL,
    "landingZoneId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "configJson" JSONB,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McpServerDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LandingZone_name_key" ON "LandingZone"("name");

-- AddForeignKey
ALTER TABLE "McpServerDeployment" ADD CONSTRAINT "McpServerDeployment_landingZoneId_fkey" FOREIGN KEY ("landingZoneId") REFERENCES "LandingZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
