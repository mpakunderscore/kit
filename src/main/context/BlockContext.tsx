import { createContext, type ReactNode, use } from 'react'

import type { SectionBlock } from '@src/main/content/sections'

const BlockContext = createContext<SectionBlock | null>(null)

type BlockProviderProps = {
    readonly block: SectionBlock
    readonly children: ReactNode
}

export const BlockProvider = ({ block, children }: BlockProviderProps) => {
    return <BlockContext value={block}>{children}</BlockContext>
}

export const useBlockContext = (): SectionBlock => {
    const context = use(BlockContext)
    if (context === null) {
        throw new Error('useBlockContext must be used inside BlockProvider')
    }
    return context
}
