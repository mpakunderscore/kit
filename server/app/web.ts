import express, { type Express } from 'express'

import type { AppStaticPaths } from '@server/app/paths'
import { registerNetworkRoutes } from '@server/modules/network/routes'
import { registerProjectRoutes } from '@server/modules/project/routes'
import { registerUserRoutes } from '@server/modules/user/routes'
import { APP_SECTION_PATHNAMES } from '@src/shared/contracts/sectionRoutes'

export const registerWebRoutes = (app: Express, paths: AppStaticPaths): void => {
    registerUserRoutes(app)
    registerNetworkRoutes(app)
    registerProjectRoutes(app)

    const appSectionPathnames: string[] = [...APP_SECTION_PATHNAMES]
    app.get(appSectionPathnames, (_request, response) => {
        response.sendFile(paths.appIndexFile)
    })

    app.use('/', express.static(paths.distDir))
}
