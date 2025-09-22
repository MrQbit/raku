-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "env" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "endpointBaseUrl" TEXT NOT NULL,
    "owners" TEXT[],
    "quotasRps" INTEGER,
    "quotasConcurrency" INTEGER,
    "secretsRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pack" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "intentsJson" JSONB NOT NULL,
    "errorModel" TEXT[],
    "policies" TEXT[],
    "scoreLatencyP95Ms" INTEGER,
    "scoreErrorRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerPack" (
    "serverId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,

    CONSTRAINT "ServerPack_pkey" PRIMARY KEY ("serverId","packId")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rbacJson" JSONB NOT NULL,
    "abacJson" JSONB,
    "approvalsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "agentId" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "routeJson" JSONB NOT NULL,
    "inputRedacted" JSONB,
    "outputRedacted" JSONB,
    "latencyMs" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsyncJob" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER,
    "resultRef" TEXT,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThirdPartyMcp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseUrl" TEXT NOT NULL,
    "authType" TEXT NOT NULL,
    "authHeader" TEXT,
    "secretRef" TEXT,
    "healthEndpoint" TEXT,
    "capabilities" JSONB NOT NULL,
    "owners" TEXT[],
    "env" TEXT NOT NULL DEFAULT 'dev',
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdPartyMcp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServerPack" ADD CONSTRAINT "ServerPack_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerPack" ADD CONSTRAINT "ServerPack_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
