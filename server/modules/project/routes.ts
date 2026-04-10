import type { Express } from 'express'

import { ApiEndpoint } from '../../../src/shared/contracts/api'

import { resolveProjectPayload } from '@server/modules/project/service'

export const registerProjectRoutes = (app: Express): void => {
    app.get(ApiEndpoint.Project, async (_request, response, next) => {
        try {
            const payload = await resolveProjectPayload()
            response.json(payload)
        } catch (error) {
            next(error)
        }
    })
}
