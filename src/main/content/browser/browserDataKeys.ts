export const BROWSER_UNIQUE_VALUE_KEYS = [
    { key: 'navigator.languages', value: 'Preferred Languages' },
    { key: 'navigator.userAgent', value: 'User Agent' },
    { key: 'navigator.platform', value: 'Platform' },
    { key: 'navigator.vendor', value: 'Browser Vendor' },
    { key: 'navigator.cookieEnabled', value: 'Cookies Enabled' },
    {
        key: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
        value: 'Resolved Time Zone',
    },
    { key: 'window.devicePixelRatio', value: 'Device Pixel Ratio' },
    { key: 'screen.width', value: 'Screen Width' },
    { key: 'screen.height', value: 'Screen Height' },
    { key: 'screen.colorDepth', value: 'Screen Color Depth' },
    { key: 'document.characterSet', value: 'Document Character Set' },
    { key: 'document.referrer', value: 'Referrer' },
    { key: 'document.visibilityState', value: 'Visibility State' },
    { key: 'document.readyState', value: 'Document Ready State' },
    { key: 'history.length', value: 'History Length' },
    { key: 'performance.timeOrigin', value: 'Performance Time Origin' },
    { key: 'performance.now', value: 'High Resolution Elapsed Time' },
    { key: 'navigator.storage.estimate().usage', value: 'Estimated Storage Usage (bytes)' },
    { key: 'navigator.storage.estimate().quota', value: 'Estimated Storage Quota (bytes)' },
] as const

export const BROWSER_ALL_AVAILABLE_KEYS = [
    'globalThis',
    'window',
    'self',
    'document',
    'document.documentElement',
    'document.body',
    'document.head',
    'document.cookie',
    'document.fonts',
    'document.timeline',
    'document.visibilityState',
    'document.readyState',
    'document.referrer',
    'document.characterSet',
    'navigator',
    'navigator.userAgent',
    'navigator.userAgentData',
    'navigator.languages',
    'navigator.platform',
    'navigator.vendor',
    'navigator.cookieEnabled',
    'navigator.hardwareConcurrency',
    'navigator.maxTouchPoints',
    'navigator.deviceMemory',
    'navigator.doNotTrack',
    'navigator.webdriver',
    'navigator.pdfViewerEnabled',
    'navigator.connection',
    'navigator.storage',
    'navigator.permissions',
    'navigator.mediaDevices',
    'navigator.geolocation',
    'navigator.clipboard',
    'navigator.serviceWorker',
    'navigator.bluetooth',
    'navigator.usb',
    'navigator.serial',
    'navigator.hid',
    'navigator.credentials',
    'navigator.keyboard',
    'navigator.locks',
    'navigator.mediaSession',
    'screen',
    'screen.orientation',
    'visualViewport',
    'location',
    'history',
    'performance',
    'performance.navigation',
    'performance.timing',
    'performance.memory',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'caches',
    'cookieStore',
    'crypto',
    'crypto.subtle',
    'trustedTypes',
    'scheduler',
    'customElements',
    'matchMedia',
    'requestAnimationFrame',
    'requestIdleCallback',
    'speechSynthesis',
] as const

type BrowserHiddenDuplicateKey =
    | 'navigator.language'
    | 'navigator.hardwareConcurrency'
    | 'navigator.maxTouchPoints'
    | 'navigator.deviceMemory'
    | 'navigator.doNotTrack'
    | 'navigator.webdriver'
    | 'navigator.pdfViewerEnabled'
    | 'screen.availWidth'
    | 'screen.availHeight'
    | 'screen.pixelDepth'
    | 'window.innerWidth'
    | 'window.innerHeight'
    | 'location.href'
    | 'location.origin'
    | 'location.pathname'

export const BROWSER_NETWORK_KEYS = [
    { key: 'location.hostname', value: 'IP' },
    { key: 'navigator.connection.rtt', value: 'Ping' },
    { key: 'navigator.connection.downlink', value: 'Download Speed' },
] as const

export type BrowserDataKeyItem = {
    readonly key: string
    readonly value: string
}

export type BrowserDataKey =
    | (typeof BROWSER_UNIQUE_VALUE_KEYS)[number]['key']
    | BrowserHiddenDuplicateKey
    | (typeof BROWSER_NETWORK_KEYS)[number]['key']
