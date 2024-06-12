import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined; // This prevents TypeScript errors on the global prisma object
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable so the client instance is not recreated across hot-reloads
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export const db = prisma;
