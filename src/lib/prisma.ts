import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const SCHEMA_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: number | undefined;
};

const adapter = new PrismaPg({
  connectionString,
});

function createClient() {
  return new PrismaClient({
    adapter,
  });
}

export const prisma =
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaVersion === SCHEMA_VERSION
    ? globalForPrisma.prisma
    : createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = SCHEMA_VERSION;
}