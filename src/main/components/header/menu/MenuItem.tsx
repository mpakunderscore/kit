import { useMainContext } from '@src/main/context/MainContext'
import { useMenuItemContext } from '@src/main/context/MenuItemContext'

export const MenuItem = () => {
    const { activeSectionId, scrollToSection } = useMainContext()
    const { id, label } = useMenuItemContext()
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
