import http from 'node:http'

import 'dotenv/config'
import express from 'express'

import { configureApp } from '@server/app/app'
import { logger } from '@server/lib/logger'

const port = Number(process.env.PORT) || 4000

const startServer = async (): Promise<void> => {
    const app = express()
    configureApp(app)
    const server = http.createServer(app)

    server.listen(port, () => {
        logger.info(`Server listening on port ${port}`)
    })
}

void startServer().catch((error) => {
    logger.error('Failed to start server', { error })
    process.exit(1)
})
