import express, { type Express } from 'express'

import { AppStaticPaths } from '@server/app/paths'

export const registerWebRoutes = (app: Express, paths: AppStaticPaths): void => {
    app.use('/', express.static(paths.distDir))
}
