import type { Express } from 'express'

import { resolveUserPayload } from '@server/modules/user/service'
import { ApiEndpoint } from '@src/shared/contracts/api'

export const registerUserRoutes = (app: Express): void => {
    app.get(ApiEndpoint.User, async (_request, response, next) => {
        try {
            const payload = await resolveUserPayload()
            response.json(payload)
        } catch (error) {
            next(error)
        }
    })
}
