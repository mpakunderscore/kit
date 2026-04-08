import { createContext, type ReactNode, use } from 'react'

import type { MenuSection } from '@src/main/content/sections'

const MenuItemContext = createContext<MenuSection | null>(null)

type MenuItemProviderProps = {
    readonly children: ReactNode
    readonly section: MenuSection
}

export const MenuItemProvider = ({ children, section }: MenuItemProviderProps) => {
    return <MenuItemContext value={section}>{children}</MenuItemContext>
}

export const useMenuItemContext = (): MenuSection => {
    const context = use(MenuItemContext)
    if (context === null) {
        throw new Error('useMenuItemContext must be used inside MenuItemProvider')
    }
    return context
}
