import { collectBrowserDataValues } from '@src/main/content/browser/browserDataValues'
import type { AppSection } from '@src/main/content/sections'
import {
    applyBrowserDataToSections,
    applyNetworkFallbackToSections,
    applyNetworkMetricsToSections,
    applyProjectFallbackToSections,
    applyProjectInfoToSections,
    applyUserToSections,
} from '@src/main/context/appDataPatchers'
import { requestNetworkMetrics, requestProjectInfo, requestUser } from '@src/main/network/httpApi'
import { createLogger } from '@src/utils/logger'

const log = createLogger({ scope: 'appData' })

export type AppSectionsPatcher = (appSections: readonly AppSection[]) => readonly AppSection[]

export const loadBrowserSectionPatcher = async (): Promise<AppSectionsPatcher> => {
    const browserDataValues = await collectBrowserDataValues()

    return (currentAppSections) => applyBrowserDataToSections(currentAppSections, browserDataValues)
}

export const loadUserSectionPatcher = async (): Promise<AppSectionsPatcher | undefined> => {
    try {
        const user = await requestUser()
        return (currentAppSections) => applyUserToSections(currentAppSections, user)
    } catch (error: unknown) {
        log.warn('User section data unavailable, using fallback', error)
        return undefined
    }
}

export const loadNetworkSectionPatcher = async (): Promise<AppSectionsPatcher> => {
    try {
        const networkMetrics = await requestNetworkMetrics()
        return (currentAppSections) =>
            applyNetworkMetricsToSections(currentAppSections, networkMetrics)
    } catch (error: unknown) {
        log.warn('Network section data unavailable, using fallback', error)
        return (currentAppSections) => applyNetworkFallbackToSections(currentAppSections)
    }
}

export const loadProjectSectionPatcher = async (): Promise<AppSectionsPatcher> => {
    try {
        const projectInfo = await requestProjectInfo()
        return (currentAppSections) => applyProjectInfoToSections(currentAppSections, projectInfo)
    } catch (error: unknown) {
        log.warn('Project section data unavailable, using fallback', error)
        return (currentAppSections) => applyProjectFallbackToSections(currentAppSections)
    }
}
