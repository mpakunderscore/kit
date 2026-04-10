import type { RequestHandler } from 'express'

import { logger } from '@server/lib/logger'
import { API_BASE_PATH } from '@src/shared/contracts/api'

const httpLog = logger.withContext({ scope: 'http' })

export const apiRequestLoggingMiddleware: RequestHandler = (request, response, next) => {
    if (!request.path.startsWith(API_BASE_PATH)) {
        next()
        return
    }

    const startedAt = Date.now()
    response.on('finish', () => {
        httpLog.info('Request', {
            method: request.method,
            path: request.path,
            status: response.statusCode,
            ms: Date.now() - startedAt,
        })
    })
    next()
}
