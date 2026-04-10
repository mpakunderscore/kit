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

export type AppSectionsPatcher = (appSections: readonly AppSection[]) => readonly AppSection[]

export const loadBrowserSectionPatcher = async (): Promise<AppSectionsPatcher> => {
    const browserDataValues = await collectBrowserDataValues()

    return (currentAppSections) => applyBrowserDataToSections(currentAppSections, browserDataValues)
}

export const loadUserSectionPatcher = async (): Promise<AppSectionsPatcher | undefined> => {
    try {
        const user = await requestUser()
        return (currentAppSections) => applyUserToSections(currentAppSections, user)
    } catch {
        return undefined
    }
}

export const loadNetworkSectionPatcher = async (): Promise<AppSectionsPatcher> => {
    try {
        const networkMetrics = await requestNetworkMetrics()
        return (currentAppSections) =>
            applyNetworkMetricsToSections(currentAppSections, networkMetrics)
    } catch {
        return (currentAppSections) => applyNetworkFallbackToSections(currentAppSections)
    }
}

export const loadProjectSectionPatcher = async (): Promise<AppSectionsPatcher> => {
    try {
        const projectInfo = await requestProjectInfo()
        return (currentAppSections) => applyProjectInfoToSections(currentAppSections, projectInfo)
    } catch {
        return (currentAppSections) => applyProjectFallbackToSections(currentAppSections)
    }
}
