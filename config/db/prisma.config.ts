import 'dotenv/config'

import { resolve } from 'node:path'

import { defineConfig, env } from 'prisma/config'

const databaseUrl = env('DATABASE_URL')
const databasePath = databaseUrl.slice('file:'.length)
const normalizedDatabaseUrl =
    databaseUrl.startsWith('file:') &&
    databasePath &&
    !databasePath.startsWith('/') &&
    !databasePath.startsWith(':')
        ? `file:${resolve(process.cwd(), databasePath)}`
        : databaseUrl

export default defineConfig({
    schema: '../../prisma/main.prisma',
    datasource: {
        url: normalizedDatabaseUrl,
    },
})
