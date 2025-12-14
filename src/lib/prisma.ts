import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton pattern for Prisma Client in serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (import.meta.env.PROD) {
  // In production, create a new instance each time
  const adapter = new PrismaPg({
    connectionString: import.meta.env.DATABASE_URL,
  });

  prisma = new PrismaClient({
    adapter,
    log: ["error"],
  });
} else {
  // In development, use a global variable to prevent multiple instances
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({
      connectionString: import.meta.env.DATABASE_URL,
    });

    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ["query", "error", "warn"],
    });
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
