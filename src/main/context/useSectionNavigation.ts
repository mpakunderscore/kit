import { useCallback, useEffect, useRef, useState } from 'react'

import type { SectionId } from '@src/main/content/sectionIds'
import type { MenuSection } from '@src/main/content/sections'
import { getSectionFromPathname } from '@src/shared/contracts/sectionRoutes'

const SMOOTH_SCROLL_FALLBACK_MS = 800

const resolveActiveSectionId = (
    menuSections: readonly MenuSection[],
    currentPosition: number
): SectionId | '' => {
    let nextActiveSectionId: SectionId | '' = menuSections[0]?.id ?? ''
    const activationPosition = currentPosition + window.innerHeight / 2

    for (const section of menuSections) {
        const sectionElement = document.getElementById(section.id)
        if (!sectionElement) continue

        if (sectionElement.offsetTop <= activationPosition) {
            nextActiveSectionId = section.id
        }
    }

    return nextActiveSectionId
}

const getInitialActiveSectionId = (menuSections: readonly MenuSection[]): SectionId | '' => {
    if (menuSections.length === 0) {
        return ''
    }
    if (typeof window === 'undefined') {
        return menuSections[0]?.id ?? ''
    }

    const fromPath = getSectionFromPathname(window.location.pathname)
    if (fromPath !== null) {
        return fromPath
    }

    return resolveActiveSectionId(menuSections, window.scrollY)
}

type UseSectionNavigationValue = {
    readonly activeSectionId: SectionId | ''
    readonly scrollToSection: (sectionId: SectionId, options?: ScrollToSectionOptions) => boolean
}

type ScrollToSectionOptions = {
    readonly behavior?: ScrollBehavior
    readonly syncActiveSection?: boolean
}

export const useSectionNavigation = (
    menuSections: readonly MenuSection[]
): UseSectionNavigationValue => {
    const [activeSectionId, setActiveSectionId] = useState<SectionId | ''>(() =>
        getInitialActiveSectionId(menuSections)
    )

    const programmaticScrollTargetRef = useRef<SectionId | null>(null)
    const smoothScrollFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearSmoothScrollFallbackTimer = useCallback(() => {
        if (smoothScrollFallbackTimerRef.current !== null) {
            clearTimeout(smoothScrollFallbackTimerRef.current)
            smoothScrollFallbackTimerRef.current = null
        }
    }, [])

    const endProgrammaticScroll = useCallback(() => {
        programmaticScrollTargetRef.current = null
        clearSmoothScrollFallbackTimer()
    }, [clearSmoothScrollFallbackTimer])

    const updateActiveSectionFromViewport = useCallback(() => {
        if (menuSections.length === 0) {
            return
        }

        const currentPosition = window.scrollY
        const nextActiveSectionId = resolveActiveSectionId(menuSections, currentPosition)

        setActiveSectionId(nextActiveSectionId)
    }, [menuSections])

    const scrollToSection = useCallback(
        (sectionId: SectionId, options?: ScrollToSectionOptions): boolean => {
            const behavior = options?.behavior ?? 'smooth'
            const syncActiveSection = options?.syncActiveSection ?? true
            const targetElement = document.getElementById(sectionId)
            if (!targetElement) {
                return false
            }

            endProgrammaticScroll()
            programmaticScrollTargetRef.current = sectionId

            const targetTop = targetElement.getBoundingClientRect().top + window.scrollY

            window.scrollTo({
                behavior,
                top: Math.max(targetTop, 0),
            })

            if (syncActiveSection) {
                setActiveSectionId(sectionId)
            }

            if (behavior === 'smooth') {
                clearSmoothScrollFallbackTimer()
                smoothScrollFallbackTimerRef.current = setTimeout(() => {
                    smoothScrollFallbackTimerRef.current = null
                    endProgrammaticScroll()
                }, SMOOTH_SCROLL_FALLBACK_MS)
            } else {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        endProgrammaticScroll()
                    })
                })
            }

            return true
        },
        [clearSmoothScrollFallbackTimer, endProgrammaticScroll]
    )

    useEffect(() => {
        const handleScroll = () => {
            if (programmaticScrollTargetRef.current !== null) {
                return
            }
            updateActiveSectionFromViewport()
        }

        const handleResize = () => {
            endProgrammaticScroll()
            updateActiveSectionFromViewport()
        }

        const handleScrollEnd = () => {
            if (programmaticScrollTargetRef.current === null) {
                return
            }
            endProgrammaticScroll()
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleResize)
        window.addEventListener('scrollend', handleScrollEnd, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scrollend', handleScrollEnd)
        }
    }, [endProgrammaticScroll, updateActiveSectionFromViewport])

    return {
        activeSectionId,
        scrollToSection,
    }
}
