import http from 'node:http'

import 'dotenv/config'
import express from 'express'

import { configureApp } from '@server/app/app'
import { serverPort } from '@server/app/config'
import { logger } from '@server/lib/logger'

const startServer = async (): Promise<void> => {
    const app = express()
    configureApp(app)
    const server = http.createServer(app)

    server.listen(serverPort, () => {
        logger.info(`Server listening on port ${serverPort}`)
    })
}

void startServer().catch((error) => {
    logger.error('Failed to start server', { error })
    process.exit(1)
})
