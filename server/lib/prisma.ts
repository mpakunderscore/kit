import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'

type GlobalWithPrisma = typeof globalThis & {
    prismaClientSingleton?: PrismaClient
}

const globalWithPrisma = globalThis as GlobalWithPrisma
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    throw new Error('DATABASE_URL is required')
}

const sqliteAdapter = new PrismaBetterSqlite3({
    url: databaseUrl,
})

export const prisma =
    globalWithPrisma.prismaClientSingleton ??
    new PrismaClient({
        adapter: sqliteAdapter,
        log: ['error', 'warn'],
    })

if (process.env.NODE_ENV !== 'production') {
    globalWithPrisma.prismaClientSingleton = prisma
}
