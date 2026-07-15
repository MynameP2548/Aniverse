import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma v7 requires an explicit driver adapter — bare `new PrismaClient()` is no longer valid.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Prevent multiple instances of Prisma Client in development (Next.js hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
