import { useCallback, useEffect, useState } from 'react'

import type { MenuSection } from '@src/main/context/menuSections'

const getHeaderHeight = (): number => {
    const headerElement = document.querySelector('.header') as HTMLElement | null
    return headerElement?.offsetHeight ?? 0
}

const resolveActiveSectionId = (
    menuSections: readonly MenuSection[],
    currentPosition: number
): string => {
    let nextActiveSectionId = menuSections[0]?.id ?? ''

    for (const section of menuSections) {
        const sectionElement = document.getElementById(section.id)
        if (!sectionElement) continue

        if (sectionElement.offsetTop <= currentPosition) {
            nextActiveSectionId = section.id
        }
    }

    return nextActiveSectionId
}

type UseSectionNavigationValue = {
    readonly activeSectionId: string
    readonly scrollToSection: (sectionId: string) => void
}

export const useSectionNavigation = (
    menuSections: readonly MenuSection[]
): UseSectionNavigationValue => {
    const [activeSectionId, setActiveSectionId] = useState<string>(menuSections[0]?.id ?? '')

    const updateActiveSection = useCallback(() => {
        if (menuSections.length === 0) return

        const headerHeight = getHeaderHeight()
        const currentPosition = window.scrollY + headerHeight
        const nextActiveSectionId = resolveActiveSectionId(menuSections, currentPosition)

        setActiveSectionId(nextActiveSectionId)
    }, [menuSections])

    const scrollToSection = useCallback((sectionId: string) => {
        const targetElement = document.getElementById(sectionId)
        if (!targetElement) return

        const headerHeight = getHeaderHeight()
        const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight

        window.scrollTo({
            behavior: 'smooth',
            top: Math.max(targetTop, 0),
        })
    }, [])

    useEffect(() => {
        updateActiveSection()
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
