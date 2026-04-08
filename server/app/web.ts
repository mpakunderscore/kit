import express, { type Express } from 'express'

import type { AppStaticPaths } from '@server/app/paths'
import { prisma } from '@server/lib/prisma'

type UserPayload = {
    readonly uuid: string
    readonly createdAt: string
    readonly updatedAt: string
}

const resolveUserPayload = async (): Promise<UserPayload> => {
    const existingUser = await prisma.user.findFirst({
        orderBy: {
            id: 'asc',
        },
    })
    const user =
        existingUser ??
        (await prisma.user.create({
            data: {},
        }))

    return {
        uuid: user.uuid,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }
}

export const registerWebRoutes = (app: Express, paths: AppStaticPaths): void => {
    app.get('/api/user', async (_request, response, next) => {
        try {
            const payload = await resolveUserPayload()
            response.json(payload)
        } catch (error) {
            next(error)
        }
    })

    app.use('/', express.static(paths.distDir))
}
