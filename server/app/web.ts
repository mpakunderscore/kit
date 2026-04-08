import express, { type Express } from 'express'

import { AppStaticPaths } from '@server/app/paths'

// Import type { AppStaticPaths } from '@server/app/config/paths'

export const registerWebRoutes = (app: Express, paths: AppStaticPaths): void => {
    app.get('/', (_request, response) => {
        response.sendFile(paths.appIndexFile)
    })
    app.use('/', express.static(paths.distDir))
}
