import express, { type Express } from 'express'

import type { AppStaticPaths } from '@server/app/paths'
import { registerNetworkRoutes } from '@server/modules/network/routes'
import { registerProjectRoutes } from '@server/modules/project/routes'
import { registerUserRoutes } from '@server/modules/user/routes'

export const registerWebRoutes = (app: Express, paths: AppStaticPaths): void => {
    registerUserRoutes(app)
    registerNetworkRoutes(app)
    registerProjectRoutes(app)

    app.use('/', express.static(paths.distDir))
}
