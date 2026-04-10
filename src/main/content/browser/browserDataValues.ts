import type { BrowserDataKey } from '@src/main/content/browser/browserDataKeys'

const NOT_AVAILABLE_VALUE = 'Not available'

type BrowserConnection = {
    readonly downlink?: number
    readonly effectiveType?: string
    readonly rtt?: number
    readonly saveData?: boolean
    readonly type?: string
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

const createFallbackValues = (): BrowserDataValues => {
    return {
        'navigator.language': NOT_AVAILABLE_VALUE,
        'navigator.languages': NOT_AVAILABLE_VALUE,
        'navigator.userAgent': NOT_AVAILABLE_VALUE,
        'navigator.platform': NOT_AVAILABLE_VALUE,
        'navigator.vendor': NOT_AVAILABLE_VALUE,
        'navigator.cookieEnabled': NOT_AVAILABLE_VALUE,
        'navigator.hardwareConcurrency': NOT_AVAILABLE_VALUE,
        'navigator.maxTouchPoints': NOT_AVAILABLE_VALUE,
        'navigator.deviceMemory': NOT_AVAILABLE_VALUE,
        'navigator.doNotTrack': NOT_AVAILABLE_VALUE,
        'navigator.webdriver': NOT_AVAILABLE_VALUE,
        'navigator.pdfViewerEnabled': NOT_AVAILABLE_VALUE,
        'Intl.DateTimeFormat().resolvedOptions().timeZone': NOT_AVAILABLE_VALUE,
        'window.devicePixelRatio': NOT_AVAILABLE_VALUE,
        'screen.width': NOT_AVAILABLE_VALUE,
        'screen.height': NOT_AVAILABLE_VALUE,
        'screen.availWidth': NOT_AVAILABLE_VALUE,
        'screen.availHeight': NOT_AVAILABLE_VALUE,
        'screen.colorDepth': NOT_AVAILABLE_VALUE,
        'screen.pixelDepth': NOT_AVAILABLE_VALUE,
        'document.characterSet': NOT_AVAILABLE_VALUE,
        'location.hostname': NOT_AVAILABLE_VALUE,
        'window.innerWidth': NOT_AVAILABLE_VALUE,
        'window.innerHeight': NOT_AVAILABLE_VALUE,
        'location.href': NOT_AVAILABLE_VALUE,
        'location.origin': NOT_AVAILABLE_VALUE,
        'location.pathname': NOT_AVAILABLE_VALUE,
        'document.referrer': NOT_AVAILABLE_VALUE,
        'document.visibilityState': NOT_AVAILABLE_VALUE,
        'document.readyState': NOT_AVAILABLE_VALUE,
        'history.length': NOT_AVAILABLE_VALUE,
        'performance.timeOrigin': NOT_AVAILABLE_VALUE,
        'performance.now': NOT_AVAILABLE_VALUE,
        'navigator.connection.rtt': NOT_AVAILABLE_VALUE,
        'navigator.connection.downlink': NOT_AVAILABLE_VALUE,
        'navigator.storage.estimate().usage': NOT_AVAILABLE_VALUE,
        'navigator.storage.estimate().quota': NOT_AVAILABLE_VALUE,
    }
}

export const collectBrowserDataValues = async (): Promise<BrowserDataValues> => {
    if (typeof window === 'undefined') {
        return createFallbackValues()
    }

    const nav = navigator as Navigator & {
        readonly connection?: BrowserConnection
        readonly deviceMemory?: number
        readonly pdfViewerEnabled?: boolean
        readonly storage?: {
            estimate?: () => Promise<{
                usage?: number
                quota?: number
            }>
        }
    }

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

    return {
        'navigator.language': formatBrowserDataValue(safeRead(() => navigator.language)),
        'navigator.languages': formatBrowserDataValue(safeRead(() => navigator.languages)),
        'navigator.userAgent': formatBrowserDataValue(safeRead(() => navigator.userAgent)),
        'navigator.platform': formatBrowserDataValue(safeRead(() => navigator.platform)),
        'navigator.vendor': formatBrowserDataValue(safeRead(() => navigator.vendor)),
        'navigator.cookieEnabled': formatBrowserDataValue(safeRead(() => navigator.cookieEnabled)),
        'navigator.hardwareConcurrency': formatBrowserDataValue(
            safeRead(() => navigator.hardwareConcurrency)
        ),
        'navigator.maxTouchPoints': formatBrowserDataValue(
            safeRead(() => navigator.maxTouchPoints)
        ),
        'navigator.deviceMemory': formatBrowserDataValue(safeRead(() => nav.deviceMemory)),
        'navigator.doNotTrack': formatBrowserDataValue(safeRead(() => navigator.doNotTrack)),
        'navigator.webdriver': formatBrowserDataValue(safeRead(() => navigator.webdriver)),
        'navigator.pdfViewerEnabled': formatBrowserDataValue(safeRead(() => nav.pdfViewerEnabled)),
        'Intl.DateTimeFormat().resolvedOptions().timeZone': formatBrowserDataValue(
            safeRead(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
        ),
        'window.devicePixelRatio': formatBrowserDataValue(safeRead(() => window.devicePixelRatio)),
        'screen.width': formatBrowserDataValue(safeRead(() => screen.width)),
        'screen.height': formatBrowserDataValue(safeRead(() => screen.height)),
        'screen.availWidth': formatBrowserDataValue(safeRead(() => screen.availWidth)),
        'screen.availHeight': formatBrowserDataValue(safeRead(() => screen.availHeight)),
        'screen.colorDepth': formatBrowserDataValue(safeRead(() => screen.colorDepth)),
        'screen.pixelDepth': formatBrowserDataValue(safeRead(() => screen.pixelDepth)),
        'document.characterSet': formatBrowserDataValue(safeRead(() => document.characterSet)),
        'location.hostname': formatBrowserDataValue(safeRead(() => location.hostname)),
        'window.innerWidth': formatBrowserDataValue(safeRead(() => window.innerWidth)),
        'window.innerHeight': formatBrowserDataValue(safeRead(() => window.innerHeight)),
        'location.href': formatBrowserDataValue(safeRead(() => location.href)),
        'location.origin': formatBrowserDataValue(safeRead(() => location.origin)),
        'location.pathname': formatBrowserDataValue(safeRead(() => location.pathname)),
        'document.referrer': formatBrowserDataValue(safeRead(() => document.referrer)),
        'document.visibilityState': formatBrowserDataValue(
            safeRead(() => document.visibilityState)
        ),
        'document.readyState': formatBrowserDataValue(safeRead(() => document.readyState)),
        'history.length': formatBrowserDataValue(safeRead(() => history.length)),
        'performance.timeOrigin': formatBrowserDataValue(safeRead(() => performance.timeOrigin)),
        'performance.now': formatBrowserDataValue(
            safeRead(() => Number(performance.now().toFixed(2)))
        ),
        'navigator.connection.rtt': formatBrowserDataValue(safeRead(() => nav.connection?.rtt)),
        'navigator.connection.downlink': formatBrowserDataValue(
            safeRead(() => nav.connection?.downlink)
        ),
        'navigator.storage.estimate().usage': formatBrowserDataValue(storageUsage),
        'navigator.storage.estimate().quota': formatBrowserDataValue(storageQuota),
    }
}
