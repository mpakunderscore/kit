import { useCallback, useEffect, useState } from 'react'

import type { SectionId } from '@src/main/content/sectionIds'
import type { MenuSection } from '@src/main/content/sections'

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
    if (menuSections.length === 0) return ''
    if (typeof window === 'undefined') return menuSections[0]?.id ?? ''

    const currentPosition = window.scrollY

    return resolveActiveSectionId(menuSections, currentPosition)
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

    const updateActiveSection = useCallback(() => {
        if (menuSections.length === 0) return

        const currentPosition = window.scrollY
        const nextActiveSectionId = resolveActiveSectionId(menuSections, currentPosition)

        setActiveSectionId(nextActiveSectionId)
    }, [menuSections])

    const scrollToSection = useCallback(
        (sectionId: SectionId, options?: ScrollToSectionOptions): boolean => {
            const behavior = options?.behavior ?? 'smooth'
            const syncActiveSection = options?.syncActiveSection ?? true
            const targetElement = document.getElementById(sectionId)
            if (!targetElement) return false

            const targetTop = targetElement.getBoundingClientRect().top + window.scrollY

            window.scrollTo({
                behavior,
                top: Math.max(targetTop, 0),
            })

            if (syncActiveSection) {
                setActiveSectionId(sectionId)
            }

            return true
        },
        []
    )

    useEffect(() => {
        window.addEventListener('scroll', updateActiveSection, { passive: true })
        window.addEventListener('resize', updateActiveSection)

        return () => {
            window.removeEventListener('scroll', updateActiveSection)
            window.removeEventListener('resize', updateActiveSection)
        }
    }, [updateActiveSection])

    return {
        activeSectionId,
        scrollToSection,
    }
}
