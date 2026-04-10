import { createContext, type ReactNode, use } from 'react'

import type { SectionId } from '@src/main/content/sectionIds'
import { useAppDataContext } from '@src/main/context/AppDataContext'
import { useSectionNavigation } from '@src/main/context/useSectionNavigation'

type NavigationContextValue = {
    readonly activeSectionId: SectionId | ''
    readonly scrollToSection: (sectionId: SectionId) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

type NavigationProviderProps = {
    readonly children: ReactNode
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
    const { menuSections } = useAppDataContext()
    const { activeSectionId, scrollToSection } = useSectionNavigation(menuSections)

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
