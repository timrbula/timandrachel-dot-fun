import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Singleton pattern for Prisma Client in serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

let prisma: PrismaClient;

if (import.meta.env.PROD) {
  // In production (serverless), create a new instance each time
  // Use connection pooling URL from Supabase (port 6543)
  const pool = new pg.Pool({
    connectionString: import.meta.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({
    adapter,
    log: ["error"],
  });
} else {
  // In development, use a global variable to prevent multiple instances
  if (!globalForPrisma.prisma) {
    if (!globalForPrisma.pool) {
      globalForPrisma.pool = new pg.Pool({
        connectionString: import.meta.env.DATABASE_URL,
      });
    }
    const adapter = new PrismaPg(globalForPrisma.pool);

    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ["query", "error", "warn"],
    });
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
