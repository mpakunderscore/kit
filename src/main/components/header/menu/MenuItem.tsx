import type { KeyboardEvent } from 'react'

type MenuItemProps = {
    readonly isActive: boolean
    readonly label: string
    readonly onClick: () => void
}

export const MenuItem = ({ isActive, label, onClick }: MenuItemProps) => {
    const linkClassName = isActive ? 'menu_link menu_link_active' : 'menu_link'
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onClick()
    }

    return (
        <div
            className={linkClassName}
            onKeyDown={handleKeyDown}
            onClick={onClick}
            role={'button'}
            tabIndex={0}
        >
            {label}
        </div>
    )
}
