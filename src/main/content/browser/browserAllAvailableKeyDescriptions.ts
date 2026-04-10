import { BROWSER_ALL_AVAILABLE_KEYS } from '@src/main/content/browser/browserDataKeys'

type BrowserAllAvailableKey = (typeof BROWSER_ALL_AVAILABLE_KEYS)[number]

const BROWSER_ALL_AVAILABLE_KEY_DESCRIPTIONS: Readonly<
    Record<BrowserAllAvailableKey, string>
> = {
    globalThis: 'Global reference to the current JavaScript execution context.',
    window: 'Main browser window object for DOM and Web API access.',
    self: 'Reference to the current global scope (window in main thread).',
    document: 'Root DOM document object for the current page.',
    'document.documentElement': 'Top-level <html> element of the current document.',
    'document.body': 'Main <body> element that contains page content.',
    'document.head': 'Head element containing metadata, links, and scripts.',
    'document.cookie': 'Accessor for document cookies as a semicolon-separated string.',
    'document.fonts': 'FontFaceSet with information about available and loaded fonts.',
    'document.timeline': 'Document-linked animation timeline for Web Animations.',
    'document.visibilityState': 'Current visibility state of the page tab.',
    'document.readyState': 'Current document loading state (loading, interactive, complete).',
    'document.referrer': 'URL of the document that linked to this page.',
    'document.characterSet': 'Character encoding used by the current document.',
    navigator: 'Browser and device capability information object.',
    'navigator.userAgent': 'User agent identification string reported by the browser.',
    'navigator.userAgentData': 'Structured user agent data (if supported).',
    'navigator.languages': 'Preferred user languages in priority order.',
    'navigator.platform': 'Platform identifier for the current client environment.',
    'navigator.vendor': 'Browser vendor string.',
    'navigator.cookieEnabled': 'Whether cookies are enabled in the browser.',
    'navigator.hardwareConcurrency': 'Number of logical processor cores available.',
    'navigator.maxTouchPoints': 'Maximum simultaneous touch contacts supported.',
    'navigator.deviceMemory': 'Approximate device memory in gigabytes (if exposed).',
    'navigator.doNotTrack': 'User Do Not Track preference value.',
    'navigator.webdriver': 'Whether the browser is controlled by WebDriver automation.',
    'navigator.pdfViewerEnabled': 'Whether built-in PDF viewing is available.',
    'navigator.connection': 'NetworkInformation object for connection metrics.',
    'navigator.storage': 'StorageManager API for quota and persistence info.',
    'navigator.permissions': 'Permissions API entry point for querying permission states.',
    'navigator.mediaDevices': 'MediaDevices API for audio/video input and output devices.',
    'navigator.geolocation': 'Geolocation API for location access.',
    'navigator.clipboard': 'Clipboard API for reading and writing clipboard data.',
    'navigator.serviceWorker': 'Service Worker registration and controller interface.',
    'navigator.bluetooth': 'Web Bluetooth API entry point.',
    'navigator.usb': 'WebUSB API entry point.',
    'navigator.serial': 'Web Serial API entry point.',
    'navigator.hid': 'WebHID API entry point.',
    'navigator.credentials': 'Credential Management API entry point.',
    'navigator.keyboard': 'Keyboard API entry point for layout and lock operations.',
    'navigator.locks': 'Web Locks API for coordinating async resource access.',
    'navigator.mediaSession': 'Media Session API for playback metadata and actions.',
    screen: 'Screen object with display and pixel characteristics.',
    'screen.orientation': 'ScreenOrientation object with type and angle.',
    visualViewport: 'Visual viewport metrics for zoomed and on-screen area.',
    location: 'URL location object for current document address.',
    history: 'Session history object for navigation entries.',
    performance: 'Performance API entry point for timing and metrics.',
    'performance.navigation': 'Legacy navigation timing information object.',
    'performance.timing': 'Legacy detailed timing metrics for page load events.',
    'performance.memory': 'Non-standard JS heap memory metrics (browser-dependent).',
    localStorage: 'Persistent origin-scoped key/value storage.',
    sessionStorage: 'Per-tab origin-scoped key/value storage.',
    indexedDB: 'IndexedDB API entry point for client-side databases.',
    caches: 'Cache Storage API for service worker and request/response caching.',
    cookieStore: 'Cookie Store API for async cookie reads and writes.',
    crypto: 'Web Crypto API namespace.',
    'crypto.subtle': 'SubtleCrypto interface for cryptographic primitives.',
    trustedTypes: 'Trusted Types API entry point for DOM XSS hardening policies.',
    scheduler: 'Scheduling API namespace for task prioritization (if supported).',
    customElements: 'Custom Elements registry for defining web components.',
    matchMedia: 'Function returning MediaQueryList for CSS media query checks.',
    requestAnimationFrame: 'Schedules callback before the next repaint.',
    requestIdleCallback: 'Schedules callback for browser idle periods (if supported).',
    speechSynthesis: 'Speech synthesis interface for text-to-speech output.',
}

export const getBrowserAllAvailableKeyDescription = (key: string): string => {
    if (key in BROWSER_ALL_AVAILABLE_KEY_DESCRIPTIONS) {
        return BROWSER_ALL_AVAILABLE_KEY_DESCRIPTIONS[
            key as keyof typeof BROWSER_ALL_AVAILABLE_KEY_DESCRIPTIONS
        ]
    }

    return `${key} browser key.`
}
