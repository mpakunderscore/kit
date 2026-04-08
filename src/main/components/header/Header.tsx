import type { KeyboardEvent } from 'react'

import { Menu } from '@src/main/components/header/menu/Menu'
import { TEXTS } from '@src/main/content/texts'
import { useMainContext } from '@src/main/context/MainContext'

export const Header = () => {
    const { menuSections, scrollToSection } = useMainContext()
    const texts = TEXTS.header
    const firstSectionId = menuSections[0]?.id ?? ''

    const handleBrandClick = () => {
        if (firstSectionId === '') return
        scrollToSection(firstSectionId)
    }

    const handleBrandKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        handleBrandClick()
    }

    return (
        <header className={'header'}>
            <div
                aria-label={texts.brandAriaLabel}
                className={'header_brand'}
                onClick={handleBrandClick}
                onKeyDown={handleBrandKeyDown}
                role={'button'}
                tabIndex={0}
            >
                <img alt={''} className={'header_logo'} src={'/icons/icon-192.png'} />
            </div>
            <Menu />
        </header>
    )
}
