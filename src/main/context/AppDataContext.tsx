import { createContext, type ReactNode, use } from 'react'

import { APP_SECTIONS, MENU_SECTIONS, type AppSection, type MenuSection } from '@src/main/content/sections'

type AppDataContextValue = {
    readonly appSections: readonly AppSection[]
    readonly menuSections: readonly MenuSection[]
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

type AppDataProviderProps = {
    readonly children: ReactNode
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
    return (
        <AppDataContext
            value={{
                appSections: APP_SECTIONS,
                menuSections: MENU_SECTIONS,
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
