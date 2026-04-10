import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import type { UserPayload } from '@src/shared/contracts/api'

import { PrismaClient } from '@electron/generated/prisma-app'

const DATABASE_FILENAME = 'app.sqlite'

type StorageOptions = {
    readonly userDataPath: string
}

export type ElectronStorage = {
    readonly getUser: () => Promise<UserPayload>
    readonly close: () => void
}

export const createElectronStorage = (options: StorageOptions): ElectronStorage => {
    mkdirSync(options.userDataPath, { recursive: true })

    const databasePath = path.resolve(options.userDataPath, DATABASE_FILENAME)

    const adapter = new PrismaBetterSqlite3({ url: databasePath })
    const prisma = new PrismaClient({ adapter })

    return {
        getUser: async (): Promise<UserPayload> => {
            const existing = await prisma.appUser.findUnique({ where: { id: 1 } })
            if (existing !== null) {
                return {
                    uuid: existing.uuid,
                    createdAt: existing.createdAt.toISOString(),
                    updatedAt: existing.updatedAt.toISOString(),
                }
            }

            const created = await prisma.appUser.create({
                data: { id: 1, uuid: randomUUID() },
            })

            return {
                uuid: created.uuid,
                createdAt: created.createdAt.toISOString(),
                updatedAt: created.updatedAt.toISOString(),
            }
        },
        close: () => {
            void prisma.$disconnect()
        },
    }
}
