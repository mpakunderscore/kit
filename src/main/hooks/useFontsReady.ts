import { useEffect, useState } from 'react'

const FONT_LOAD_REQUESTS = [
    '300 16px "Source Sans 3"',
    '400 16px "Source Sans 3"',
    '700 16px "Source Sans 3"',
] as const

const getInitialFontsReady = (): boolean => {
    if (typeof document === 'undefined') {
        return true
    }

    const fontsApi = document.fonts
    if (!fontsApi || typeof fontsApi.load !== 'function') {
        return true
    }

    return false
}

export const useFontsReady = () => {
    const [fontsReady, setFontsReady] = useState(getInitialFontsReady)

    useEffect(() => {
        if (typeof document === 'undefined') {
            return
        }

        const fontsApi = document.fonts
        if (!fontsApi || typeof fontsApi.load !== 'function') {
            document.documentElement.classList.remove('preload')
            return
        }

        let cancelled = false

        const loadFonts = async () => {
            try {
                await Promise.all(FONT_LOAD_REQUESTS.map((font) => fontsApi.load(font)))
                await fontsApi.ready
            } finally {
                if (!cancelled) {
                    document.documentElement.classList.remove('preload')
                    setFontsReady(true)
                }
            }
        }

        void loadFonts()

        return () => {
            cancelled = true
        }
    }, [])

    return fontsReady
}
