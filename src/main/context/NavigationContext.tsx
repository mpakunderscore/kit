import { createContext, type ReactNode, use } from 'react'

import { MENU_SECTIONS } from '@src/main/content/sections'
import { useSectionNavigation } from '@src/main/context/useSectionNavigation'

type NavigationContextValue = {
    readonly activeSectionId: string
    readonly scrollToSection: (sectionId: string) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

type NavigationProviderProps = {
    readonly children: ReactNode
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
    const { activeSectionId, scrollToSection } = useSectionNavigation(MENU_SECTIONS)

    return (
        <NavigationContext value={{ activeSectionId, scrollToSection }}>
            {children}
        </NavigationContext>
    )
}

export const useNavigationContext = (): NavigationContextValue => {
    const context = use(NavigationContext)
    if (context === null) {
        throw new Error('useNavigationContext must be used inside NavigationProvider')
    }
    return context
}
