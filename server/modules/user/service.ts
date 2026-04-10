import type { UserPayload } from '../../../src/shared/contracts/api'

import { prisma } from '@server/lib/prisma'

export const resolveUserPayload = async (): Promise<UserPayload> => {
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
