import type { LucideIcon } from 'lucide-react'
import { Folder, Globe, Puzzle, Shield, User, Wifi } from 'lucide-react'

import { SectionId } from '@src/main/content/sectionIds'
import type { MenuSection } from '@src/main/content/sections'
import { useNavigationContext } from '@src/main/context/NavigationContext'

type MenuItemProps = {
    readonly section: MenuSection
}

const MENU_ICONS: Readonly<Record<SectionId, LucideIcon>> = {
    [SectionId.User]: User,
    [SectionId.WebApiPermissions]: Shield,
    [SectionId.WebApiAvailability]: Puzzle,
    [SectionId.Browser]: Globe,
    [SectionId.Network]: Wifi,
    [SectionId.Project]: Folder,
}

export const MenuItem = ({ section }: MenuItemProps) => {
    const { activeSectionId, scrollToSection } = useNavigationContext()
    const { id, label } = section
    const isActive = activeSectionId === id
    const linkClassName = isActive ? 'menu_link menu_link_active' : 'menu_link'
    const MenuIcon = MENU_ICONS[id]

    return (
        <button
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            className={linkClassName}
            onClick={() => scrollToSection(id)}
            type={'button'}
        >
            <span aria-hidden={'true'} className={'menu_link_icon'}>
                <MenuIcon size={20} strokeWidth={2} />
            </span>
            <span className={'menu_link_label'}>{label}</span>
        </button>
    )
}
