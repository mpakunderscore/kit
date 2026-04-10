import type { Express } from 'express'

import { resolveProjectPayload } from '@server/modules/project/service'
import { API_BASE_PATH, ApiEndpoint } from '@src/shared/contracts/api'

export const registerProjectRoutes = (app: Express): void => {
    app.get(`${API_BASE_PATH}${ApiEndpoint.Project}`, async (_request, response, next) => {
        try {
            const payload = await resolveProjectPayload()
            response.json(payload)
        } catch (error) {
            next(error)
        }
    })
}
