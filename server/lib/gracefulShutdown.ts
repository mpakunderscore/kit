import type http from 'node:http'

import { logger } from '@server/lib/logger'

export type GracefulShutdownDeps = {
    readonly scanService: { stop(): void }
    readonly wsHub: { close(): Promise<void> }
    readonly runtimeStateService: { stop(): void }
    readonly server: http.Server
    readonly prisma: { $disconnect(): Promise<void> }
}

export function registerGracefulShutdown(deps: GracefulShutdownDeps): void {
    let shuttingDown = false

    const gracefulShutdown = async (signal: string): Promise<void> => {
        if (shuttingDown) {
            return
        }
        shuttingDown = true

        logger.info(`Received ${signal}, shutting down`)

        deps.runtimeStateService.stop()
        deps.scanService.stop()
        await deps.wsHub.close().catch((error) => {
            logger.warn('Failed to close WebSocket server', { error })
        })

        if (typeof deps.server.closeAllConnections === 'function') {
            deps.server.closeAllConnections()
        }

        await new Promise<void>((resolve) => {
            deps.server.close(() => resolve())
        })

        await deps.prisma.$disconnect()
        process.exit(0)
    }

    process.on('SIGINT', () => {
        void gracefulShutdown('SIGINT')
    })

    process.on('SIGTERM', () => {
        void gracefulShutdown('SIGTERM')
    })
}
