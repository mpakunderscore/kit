import type { Express } from 'express'

import { resolveUserPayload } from '@server/modules/user/service'
import { API_BASE_PATH, ApiEndpoint } from '@src/shared/contracts/api'

export const registerUserRoutes = (app: Express): void => {
    app.get(`${API_BASE_PATH}${ApiEndpoint.User}`, async (_request, response, next) => {
        try {
            const payload = await resolveUserPayload()
            response.json(payload)
        } catch (error) {
            next(error)
        }
    })
}
