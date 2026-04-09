import type { LucideIcon } from 'lucide-react'
import { Circle, Globe, Puzzle, Shield, User, Wifi } from 'lucide-react'
import type { MenuSection } from '@src/main/content/sections'
import { useNavigationContext } from '@src/main/context/NavigationContext'

type MenuItemProps = {
    readonly section: MenuSection
}

const MENU_ICONS: Readonly<Record<string, LucideIcon>> = {
    user_section: User,
    web_api_permissions_section: Shield,
    web_api_availability_section: Puzzle,
    browser_section: Globe,
    network_section: Wifi,
}

export const MenuItem = ({ section }: MenuItemProps) => {
    const { activeSectionId, scrollToSection } = useNavigationContext()
    const { id, label } = section
    const isActive = activeSectionId === id
    const linkClassName = isActive ? 'menu_link menu_link_active' : 'menu_link'
    const MenuIcon = MENU_ICONS[id] ?? Circle

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
