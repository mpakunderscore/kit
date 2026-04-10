import type { ErrorRequestHandler } from 'express'

import { logger } from '@server/lib/logger'

export const apiErrorHandler: ErrorRequestHandler = (error, request, response, next) => {
    if (response.headersSent) {
        next(error)
        return
    }

    logger.error('Request failed', {
        method: request.method,
        path: request.path,
        error,
    })

    response.status(500).json({
        error: 'Internal Server Error',
    })
}
