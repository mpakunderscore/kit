import http from 'node:http'

import 'dotenv/config'
import express from 'express'

// Import { startDatabase } from '@server/data/startup'
import { logger } from '@server/lib/logger'

const port = Number(process.env.PORT) || 4000

const startServer = async (): Promise<void> => {
    // Await startDatabase()

    const app = express()
    const server = http.createServer(app)

    // ConfigureApp(app, __dirname)

    server.listen(port, () => {
        logger.info(`Server listening on port ${port}`)
    })
}

void startServer().catch((error) => {
    logger.error('Failed to start server', { error })
    process.exit(1)
})
