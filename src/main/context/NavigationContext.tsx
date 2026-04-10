import { createContext, type ReactNode, use, useCallback, useEffect, useRef } from 'react'

import type { SectionId } from '@src/main/content/sectionIds'
import { useAppDataContext } from '@src/main/context/AppDataContext'
import { useSectionNavigation } from '@src/main/context/useSectionNavigation'
import {
    getPathnameForSection,
    getSectionFromPathname,
    normalizePathname,
} from '@src/shared/contracts/sectionRoutes'

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
    const { activeSectionId, scrollToSection: scrollToSectionById } =
        useSectionNavigation(menuSections)
    const isPathSyncReadyRef = useRef(false)
    const firstSectionId = menuSections[0]?.id ?? null

    const syncFromPathname = useCallback(
        (pathname: string, behavior: ScrollBehavior = 'auto') => {
            if (firstSectionId === null) {
                return
            }

            const nextSectionId = getSectionFromPathname(pathname) ?? firstSectionId
            const didScroll = scrollToSectionById(nextSectionId, {
                behavior,
                syncActiveSection: true,
            })
            if (!didScroll) {
                return
            }

            const targetPathname = getPathnameForSection(nextSectionId)
            const currentPathname = normalizePathname(pathname).toLowerCase()
            if (currentPathname !== targetPathname) {
                window.history.replaceState(null, '', targetPathname)
            }
        },
        [firstSectionId, scrollToSectionById]
    )

    const scrollToSection = useCallback(
        (sectionId: SectionId) => {
            const didScroll = scrollToSectionById(sectionId, {
                behavior: 'smooth',
                syncActiveSection: true,
            })
            if (!didScroll) {
                return
            }

            const targetPathname = getPathnameForSection(sectionId)
            const currentPathname = normalizePathname(window.location.pathname).toLowerCase()
            if (currentPathname !== targetPathname) {
                window.history.pushState(null, '', targetPathname)
            }
        },
        [scrollToSectionById]
    )

    useEffect(() => {
        if (firstSectionId === null) {
            return
        }

        syncFromPathname(window.location.pathname, 'auto')
        isPathSyncReadyRef.current = true
    }, [firstSectionId, syncFromPathname])

    useEffect(() => {
        if (!isPathSyncReadyRef.current) {
            return
        }

        const handlePopState = () => {
            syncFromPathname(window.location.pathname, 'auto')
        }

        window.addEventListener('popstate', handlePopState)
        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [syncFromPathname])

    useEffect(() => {
        if (!isPathSyncReadyRef.current || activeSectionId === '') {
            return
        }

        const targetPathname = getPathnameForSection(activeSectionId)
        const currentPathname = normalizePathname(window.location.pathname).toLowerCase()
        if (currentPathname !== targetPathname) {
            window.history.replaceState(null, '', targetPathname)
        }
    }, [activeSectionId])

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
