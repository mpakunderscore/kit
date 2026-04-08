import { createContext, type ReactNode, use } from 'react'

import { APP_SECTIONS, MENU_SECTIONS, type AppSection, type MenuSection } from '@src/main/content/sections'
import { useSectionNavigation } from '@src/main/context/useSectionNavigation'

type MainContextValue = {
    readonly activeSectionId: string
    readonly appSections: readonly AppSection[]
    readonly menuSections: readonly MenuSection[]
    readonly scrollToSection: (sectionId: string) => void
}

const MainContext = createContext<MainContextValue | null>(null)

type MainProviderProps = {
    readonly children: ReactNode
}

export const MainProvider = ({ children }: MainProviderProps) => {
    const { activeSectionId, scrollToSection } = useSectionNavigation(MENU_SECTIONS)

    return (
        <MainContext
            value={{
                activeSectionId,
                appSections: APP_SECTIONS,
                menuSections: MENU_SECTIONS,
                scrollToSection,
            }}
        >
            {children}
        </MainContext>
    )
}

export const useMainContext = (): MainContextValue => {
    const context = use(MainContext)
    if (context === null) {
        throw new Error('useMainContext must be used inside MainProvider')
    }
    return context
}
