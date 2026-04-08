import { MenuItem } from '@src/main/components/header/menu/MenuItem'
import { TEXTS } from '@src/main/content/texts'
import { useAppDataContext } from '@src/main/context/AppDataContext'

export const Menu = () => {
    const { menuSections } = useAppDataContext()
    const texts = TEXTS.header

    return (
        <nav aria-label={texts.menuAriaLabel} className={'menu'}>
            {menuSections.map((section) => {
                return <MenuItem key={section.id} section={section} />
            })}
        </nav>
    )
}
