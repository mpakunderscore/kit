import { MenuItem } from '@src/main/components/header/menu/MenuItem'
import { TEXTS } from '@src/main/content/texts'
import { MenuItemProvider } from '@src/main/context/MenuItemContext'
import { useMainContext } from '@src/main/context/MainContext'

export const Menu = () => {
    const { menuSections } = useMainContext()
    const texts = TEXTS.header

    return (
        <nav aria-label={texts.menuAriaLabel} className={'menu'}>
            {menuSections.map((section) => {
                return (
                    <MenuItemProvider key={section.id} section={section}>
                        <MenuItem />
                    </MenuItemProvider>
                )
            })}
        </nav>
    )
}
