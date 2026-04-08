import { createContext, type ReactNode, use } from 'react'

import type { AppSection } from '@src/main/content/sections'

const SectionContext = createContext<AppSection | null>(null)

type SectionProviderProps = {
    readonly children: ReactNode
    readonly section: AppSection
}

export const SectionProvider = ({ children, section }: SectionProviderProps) => {
    return <SectionContext value={section}>{children}</SectionContext>
}

export const useSectionContext = (): AppSection => {
    const context = use(SectionContext)
    if (context === null) {
        throw new Error('useSectionContext must be used inside SectionProvider')
    }
    return context
}
