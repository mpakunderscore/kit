import type { MenuSection } from '@src/main/content/sections'
import { useNavigationContext } from '@src/main/context/NavigationContext'

type MenuItemProps = {
    readonly section: MenuSection
}

export const MenuItem = ({ section }: MenuItemProps) => {
    const { activeSectionId, scrollToSection } = useNavigationContext()
    const { id, label } = section
    const isActive = activeSectionId === id
    const linkClassName = isActive ? 'menu_link menu_link_active' : 'menu_link'

    return (
        <button
            aria-current={isActive ? 'page' : undefined}
            className={linkClassName}
            onClick={() => scrollToSection(id)}
            type={'button'}
        >
            {label}
        </button>
    )
}
