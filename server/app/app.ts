import path from 'node:path'
import { fileURLToPath } from 'node:url'

import cors from 'cors'
import express, { type Express } from 'express'

import { resolveAppStaticPaths } from '@server/app/paths'
import { isDev } from '@server/app/runtime'
import { registerWebRoutes } from '@server/app/web'

const fileName = fileURLToPath(import.meta.url)
const dirName = path.dirname(fileName)

export const configureApp = (app: Express): void => {
    if (isDev) {
        app.use(cors())
    }
    app.use(express.json())
    const staticPaths = resolveAppStaticPaths(dirName)
    registerWebRoutes(app, staticPaths)
}
