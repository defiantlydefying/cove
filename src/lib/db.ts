import { PrismaClient } from "@prisma/client";
import { configureRuntimeDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const runtimeDatabaseUrl = configureRuntimeDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    runtimeDatabaseUrl
      ? { datasources: { db: { url: runtimeDatabaseUrl } } }
      : undefined
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
