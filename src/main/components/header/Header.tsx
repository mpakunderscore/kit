import { Menu } from '@src/main/components/header/menu/Menu'
import { TEXTS } from '@src/main/content/texts'
import { useAppDataContext } from '@src/main/context/AppDataContext'
import { useNavigationContext } from '@src/main/context/NavigationContext'

export const Header = () => {
    const { menuSections } = useAppDataContext()
    const { scrollToSection } = useNavigationContext()
    const texts = TEXTS.header
    const firstSection = menuSections[0]

    const handleBrandClick = () => {
        if (firstSection === undefined) return
        scrollToSection(firstSection.id)
    }

    return (
        <header className={'header'}>
            <button
                aria-label={texts.brandAriaLabel}
                className={'header_brand'}
                onClick={handleBrandClick}
                type={'button'}
            >
                <img alt={''} className={'header_logo'} src={'/icons/icon-192.png'} />
            </button>
            <Menu />
        </header>
    )
}
