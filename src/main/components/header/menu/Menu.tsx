import { MenuItem } from '@src/main/components/header/menu/MenuItem'
import { TEXTS } from '@src/main/content/texts'
import { useMainContext } from '@src/main/context/MainContext'

export const Menu = () => {
    const { activeSectionId, menuSections, scrollToSection } = useMainContext()
    const texts = TEXTS.header

    return (
        <nav aria-label={texts.menuAriaLabel} className={'menu'}>
            {menuSections.map((section) => {
                return (
                    <MenuItem
                        isActive={activeSectionId === section.id}
                        key={section.id}
                        label={section.label}
                        onClick={() => scrollToSection(section.id)}
                    />
                )
            })}
        </nav>
    )
}
