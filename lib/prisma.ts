import { PrismaClient } from "@prisma/client";

/**
 * Prismaクライアントのグローバルインスタンス
 * 開発環境でのホットリロード時に複数のインスタンスが作成されるのを防ぐ
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
