export const BROWSER_ENVIRONMENT_KEYS = [
    { key: 'navigator.language', value: 'Browser Language' },
    { key: 'navigator.languages', value: 'Preferred Languages' },
    { key: 'navigator.userAgent', value: 'User Agent' },
    { key: 'navigator.platform', value: 'Platform' },
    { key: 'navigator.vendor', value: 'Browser Vendor' },
    { key: 'navigator.cookieEnabled', value: 'Cookies Enabled' },
    { key: 'navigator.hardwareConcurrency', value: 'Logical CPU Cores' },
    { key: 'navigator.maxTouchPoints', value: 'Max Touch Points' },
    { key: 'navigator.deviceMemory', value: 'Device Memory (GB)' },
    { key: 'navigator.doNotTrack', value: 'Do Not Track Preference' },
    { key: 'navigator.webdriver', value: 'WebDriver Controlled' },
    { key: 'navigator.pdfViewerEnabled', value: 'Built-in PDF Viewer Enabled' },
    {
        key: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
        value: 'Resolved Time Zone',
    },
    { key: 'window.devicePixelRatio', value: 'Device Pixel Ratio' },
    { key: 'screen.width', value: 'Screen Width' },
    { key: 'screen.height', value: 'Screen Height' },
    { key: 'screen.availWidth', value: 'Available Screen Width' },
    { key: 'screen.availHeight', value: 'Available Screen Height' },
    { key: 'screen.colorDepth', value: 'Screen Color Depth' },
    { key: 'screen.pixelDepth', value: 'Screen Pixel Depth' },
    { key: 'document.characterSet', value: 'Document Character Set' },
] as const

export const BROWSER_SESSION_STATE_KEYS = [
    { key: 'navigator.onLine', value: 'Online Status' },
    { key: 'window.innerWidth', value: 'Viewport Width' },
    { key: 'window.innerHeight', value: 'Viewport Height' },
    { key: 'location.href', value: 'Current URL' },
    { key: 'location.origin', value: 'Origin' },
    { key: 'location.pathname', value: 'Pathname' },
    { key: 'document.referrer', value: 'Referrer' },
    { key: 'document.visibilityState', value: 'Visibility State' },
    { key: 'document.readyState', value: 'Document Ready State' },
    { key: 'history.length', value: 'History Length' },
    { key: 'performance.timeOrigin', value: 'Performance Time Origin' },
    { key: 'performance.now', value: 'High Resolution Elapsed Time' },
    { key: 'navigator.connection.type', value: 'Connection Type' },
    { key: 'navigator.connection.effectiveType', value: 'Effective Connection Type' },
    { key: 'navigator.connection.rtt', value: 'Estimated RTT (ms)' },
    { key: 'navigator.connection.downlink', value: 'Estimated Downlink (Mbps)' },
    { key: 'navigator.connection.saveData', value: 'Data Saver Enabled' },
    { key: 'navigator.storage.estimate().usage', value: 'Estimated Storage Usage (bytes)' },
    { key: 'navigator.storage.estimate().quota', value: 'Estimated Storage Quota (bytes)' },
] as const

export type BrowserDataKeyItem = {
    readonly key: string
    readonly value: string
}

export type BrowserDataKey =
    | (typeof BROWSER_ENVIRONMENT_KEYS)[number]['key']
    | (typeof BROWSER_SESSION_STATE_KEYS)[number]['key']
