import type { DesktopApi } from '@src/shared/contracts/desktop'

declare global {
    interface Window {
        readonly desktopApi?: DesktopApi
    }

    const VERSION: string
    const GIT: string
    const BRANCH: string
    const BUILD_TIME: string
    const NODE_ENV: string
    const PORT: string
}

declare module '*.css' {}

export {}
