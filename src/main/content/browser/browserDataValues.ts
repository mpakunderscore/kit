import type { BrowserDataKey } from '@src/main/content/browser/browserDataKeys'

const NOT_AVAILABLE_VALUE = 'Not available'

type BrowserConnection = {
    readonly downlink?: number
    readonly effectiveType?: string
    readonly rtt?: number
    readonly saveData?: boolean
    readonly type?: string
}

type BrowserStorageEstimate = {
    readonly quota?: number
    readonly usage?: number
}

type NavigatorWithBrowserData = Navigator & {
    readonly connection?: BrowserConnection
    readonly deviceMemory?: number
    readonly pdfViewerEnabled?: boolean
    readonly storage?: {
        estimate?: () => Promise<BrowserStorageEstimate>
    }
}

type BrowserDataContext = {
    readonly nav: NavigatorWithBrowserData
    readonly storageQuota: unknown
    readonly storageUsage: unknown
}

type BrowserDataDescriptor = {
    readonly key: BrowserDataKey
    readonly read: (context: BrowserDataContext) => unknown
}

export type BrowserDataValues = Readonly<Record<BrowserDataKey, string>>

const formatBrowserDataValue = (value: unknown): string => {
    if (value === null || value === undefined) {
        return NOT_AVAILABLE_VALUE
    }

    if (typeof value === 'string') {
        return value.trim() === '' ? NOT_AVAILABLE_VALUE : value
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? String(value) : NOT_AVAILABLE_VALUE
    }

    if (typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value)
    }

    if (Array.isArray(value)) {
        const parts = value.map((item) => String(item).trim()).filter((item) => item !== '')
        return parts.length > 0 ? parts.join(', ') : NOT_AVAILABLE_VALUE
    }

    try {
        return JSON.stringify(value)
    } catch {
        return NOT_AVAILABLE_VALUE
    }
}

const safeRead = (reader: () => unknown): unknown => {
    try {
        return reader()
    } catch {
        return undefined
    }
}

const BROWSER_DATA_DESCRIPTORS: readonly BrowserDataDescriptor[] = [
    {
        key: 'navigator.language',
        read: () => navigator.language,
    },
    {
        key: 'navigator.languages',
        read: () => navigator.languages,
    },
    {
        key: 'navigator.userAgent',
        read: () => navigator.userAgent,
    },
    {
        key: 'navigator.platform',
        read: () => navigator.platform,
    },
    {
        key: 'navigator.vendor',
        read: () => navigator.vendor,
    },
    {
        key: 'navigator.cookieEnabled',
        read: () => navigator.cookieEnabled,
    },
    {
        key: 'navigator.hardwareConcurrency',
        read: () => navigator.hardwareConcurrency,
    },
    {
        key: 'navigator.maxTouchPoints',
        read: () => navigator.maxTouchPoints,
    },
    {
        key: 'navigator.deviceMemory',
        read: (context) => context.nav.deviceMemory,
    },
    {
        key: 'navigator.doNotTrack',
        read: () => navigator.doNotTrack,
    },
    {
        key: 'navigator.webdriver',
        read: () => navigator.webdriver,
    },
    {
        key: 'navigator.pdfViewerEnabled',
        read: (context) => context.nav.pdfViewerEnabled,
    },
    {
        key: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
        read: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
        key: 'window.devicePixelRatio',
        read: () => window.devicePixelRatio,
    },
    {
        key: 'screen.width',
        read: () => screen.width,
    },
    {
        key: 'screen.height',
        read: () => screen.height,
    },
    {
        key: 'screen.availWidth',
        read: () => screen.availWidth,
    },
    {
        key: 'screen.availHeight',
        read: () => screen.availHeight,
    },
    {
        key: 'screen.colorDepth',
        read: () => screen.colorDepth,
    },
    {
        key: 'screen.pixelDepth',
        read: () => screen.pixelDepth,
    },
    {
        key: 'document.characterSet',
        read: () => document.characterSet,
    },
    {
        key: 'location.hostname',
        read: () => location.hostname,
    },
    {
        key: 'window.innerWidth',
        read: () => window.innerWidth,
    },
    {
        key: 'window.innerHeight',
        read: () => window.innerHeight,
    },
    {
        key: 'location.href',
        read: () => location.href,
    },
    {
        key: 'location.origin',
        read: () => location.origin,
    },
    {
        key: 'location.pathname',
        read: () => location.pathname,
    },
    {
        key: 'document.referrer',
        read: () => document.referrer,
    },
    {
        key: 'document.visibilityState',
        read: () => document.visibilityState,
    },
    {
        key: 'document.readyState',
        read: () => document.readyState,
    },
    {
        key: 'history.length',
        read: () => history.length,
    },
    {
        key: 'performance.timeOrigin',
        read: () => performance.timeOrigin,
    },
    {
        key: 'performance.now',
        read: () => Number(performance.now().toFixed(2)),
    },
    {
        key: 'navigator.connection.rtt',
        read: (context) => context.nav.connection?.rtt,
    },
    {
        key: 'navigator.connection.downlink',
        read: (context) => context.nav.connection?.downlink,
    },
    {
        key: 'navigator.storage.estimate().usage',
        read: (context) => context.storageUsage,
    },
    {
        key: 'navigator.storage.estimate().quota',
        read: (context) => context.storageQuota,
    },
]

const buildBrowserDataValues = (
    resolver: (descriptor: BrowserDataDescriptor) => string
): BrowserDataValues => {
    return Object.fromEntries(
        BROWSER_DATA_DESCRIPTORS.map((descriptor) => [descriptor.key, resolver(descriptor)])
    ) as BrowserDataValues
}

const createFallbackValues = (): BrowserDataValues => {
    return buildBrowserDataValues(() => NOT_AVAILABLE_VALUE)
}

export const collectBrowserDataValues = async (): Promise<BrowserDataValues> => {
    if (typeof window === 'undefined') {
        return createFallbackValues()
    }

    const nav = navigator as NavigatorWithBrowserData

    let storageUsage: unknown
    let storageQuota: unknown
    try {
        const estimate = await nav.storage?.estimate?.()
        storageUsage = estimate?.usage
        storageQuota = estimate?.quota
    } catch {
        storageUsage = undefined
        storageQuota = undefined
    }

    const context: BrowserDataContext = {
        nav,
        storageUsage,
        storageQuota,
    }

    return buildBrowserDataValues((descriptor) => {
        return formatBrowserDataValue(safeRead(() => descriptor.read(context)))
    })
}
