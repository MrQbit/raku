import { PrismaClient } from "@prisma/client";
// Reuse Prisma client in dev to avoid exhausting connection limits
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.PRISMA_LOG?.split(",")
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
export default prisma;
