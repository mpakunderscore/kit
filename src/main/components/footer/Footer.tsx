import { useEffect, useState } from 'react'
import { FOOTER_VALUES } from '@src/main/components/footer/footerValues'

const DEBUG_BACKGROUND_STYLE_ID = 'debug_background_style'
const DEBUG_BACKGROUND_RULE = `* {
    background: rgb(255 255 255 / 0.02);
}`

export const Footer = () => {
    const [isDebugBackgroundEnabled, setIsDebugBackgroundEnabled] = useState(false)
    const footerValues = FOOTER_VALUES.filter((item) => item.value.length > 0)

    useEffect(() => {
        if (isDebugBackgroundEnabled === false) {
            document.getElementById(DEBUG_BACKGROUND_STYLE_ID)?.remove()
            return
        }

        const styleElement = document.createElement('style')
        styleElement.id = DEBUG_BACKGROUND_STYLE_ID
        styleElement.textContent = DEBUG_BACKGROUND_RULE
        document.head.append(styleElement)

        return () => {
            styleElement.remove()
        }
    }, [isDebugBackgroundEnabled])

    return (
        <footer className={'footer'}>
            {footerValues.map((item) => {
                return (
                    <span className={'footer_value'} key={item.id}>
                        {item.value}
                    </span>
                )
            })}
            <button
                type={'button'}
                className={'footer_toggle'}
                aria-pressed={isDebugBackgroundEnabled}
                onClick={() => {
                    setIsDebugBackgroundEnabled((value) => !value)
                }}
            >
                фон
            </button>
        </footer>
    )
}
