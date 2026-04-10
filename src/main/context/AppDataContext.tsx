import { createContext, type ReactNode, use, useEffect, useMemo, useState } from 'react'

import { APP_SECTIONS, type AppSection, type MenuSection } from '@src/main/content/sections'
import {
    type AppSectionsPatcher,
    loadBrowserSectionPatcher,
    loadNetworkSectionPatcher,
    loadProjectSectionPatcher,
    loadUserSectionPatcher,
} from '@src/main/context/appDataLoaders'

type AppDataContextValue = {
    readonly appSections: readonly AppSection[]
    readonly menuSections: readonly MenuSection[]
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

type AppDataProviderProps = {
    readonly children: ReactNode
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
    const [appSections, setAppSections] = useState<readonly AppSection[]>(APP_SECTIONS)

    useEffect(() => {
        let isDisposed = false

        void (async () => {
            const [browserPatcher, userPatcher, networkPatcher, projectPatcher] = await Promise.all(
                [
                    loadBrowserSectionPatcher(),
                    loadUserSectionPatcher(),
                    loadNetworkSectionPatcher(),
                    loadProjectSectionPatcher(),
                ]
            )

            if (isDisposed) return

            const patchers: AppSectionsPatcher[] = [
                browserPatcher,
                userPatcher,
                networkPatcher,
                projectPatcher,
            ].filter((patcher): patcher is AppSectionsPatcher => patcher !== undefined)

            setAppSections((sections) => patchers.reduce((acc, patch) => patch(acc), sections))
        })()

        return () => {
            isDisposed = true
        }
    }, [])

    const menuSections = useMemo<readonly MenuSection[]>(() => {
        return appSections.map(({ id, label }) => ({ id, label }))
    }, [appSections])

    return (
        <AppDataContext
            value={{
                appSections,
                menuSections,
            }}
        >
            {children}
        </AppDataContext>
    )
}

export const useAppDataContext = (): AppDataContextValue => {
    const context = use(AppDataContext)
    if (context === null) {
        throw new Error('useAppDataContext must be used inside AppDataProvider')
    }
    return context
}
