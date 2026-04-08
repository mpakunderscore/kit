type AvailabilityCheck = () => boolean

const hasGlobal = (key: string): boolean => {
    if (typeof window === 'undefined') return false
    return key in window
}

const hasNavigator = (key: string): boolean => {
    if (typeof navigator === 'undefined') return false
    return key in navigator
}

const hasDocument = (key: string): boolean => {
    if (typeof document === 'undefined') return false
    return key in document
}

const safeCheck = (check: AvailabilityCheck): boolean => {
    try {
        return check()
    } catch {
        return false
    }
}

const INFERRED_NAME_WORDS_IGNORED = new Set<string>([
    '2d',
    '3d',
    'and',
    'api',
    'apis',
    'css',
    'dom',
    'event',
    'events',
    'for',
    'graphics',
    'html',
    'interface',
    'interfaces',
    'model',
    'object',
    'the',
    'view',
    'web',
])

const cleanApiName = (apiName: string): string => {
    return apiName
        .replaceAll(/\([^)]*\)/g, ' ')
        .replaceAll(/[^a-zA-Z0-9\s]/g, ' ')
        .trim()
}

const buildInferredTokens = (apiName: string): readonly string[] => {
    const words = cleanApiName(apiName)
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word !== '')
        .filter((word) => !INFERRED_NAME_WORDS_IGNORED.has(word.toLowerCase()))

    if (words.length === 0) return []

    const pascalToken = words.map((word) => word[0].toUpperCase() + word.slice(1)).join('')
    const camelToken = pascalToken[0].toLowerCase() + pascalToken.slice(1)

    return [pascalToken, camelToken, ...words]
}

const hasInKnownScopes = (token: string): boolean => {
    if (token.trim() === '') return false

    const loweredToken = token.toLowerCase()
    const scopes = [window, navigator, document]

    for (const scope of scopes) {
        const ownKeys = Object.getOwnPropertyNames(scope)
        if (ownKeys.some((key) => key.toLowerCase() === loweredToken)) return true
        if (ownKeys.some((key) => key.toLowerCase().includes(loweredToken))) return true
    }

    return false
}

const WEB_API_AVAILABILITY_CHECKS: Readonly<Record<string, AvailabilityCheck>> = {
    'Background Synchronization': () => hasGlobal('SyncManager'),
    Badging: () => hasNavigator('setAppBadge'),
    Beacon: () => hasNavigator('sendBeacon'),
    'Broadcast Channel': () => hasGlobal('BroadcastChannel'),
    'CSS Font Loading': () => hasGlobal('FontFace'),
    'CSS Object Model (CSSOM)': () => hasGlobal('CSSStyleSheet'),
    Canvas: () => hasGlobal('HTMLCanvasElement'),
    'Channel Messaging': () => hasGlobal('MessageChannel'),
    'Compression Streams': () => hasGlobal('CompressionStream'),
    Console: () => hasGlobal('console'),
    'Cookie Store': () => hasGlobal('cookieStore'),
    'Credential Management': () => hasGlobal('Credential'),
    'Document Object Model (DOM)': () => hasGlobal('document'),
    'Document Picture-in-Picture': () => hasGlobal('documentPictureInPicture'),
    'Encoding': () => hasGlobal('TextEncoder') && hasGlobal('TextDecoder'),
    'Encrypted Media Extensions': () => hasGlobal('MediaKeys'),
    Fetch: () => hasGlobal('fetch'),
    File: () => hasGlobal('File') && hasGlobal('FileReader'),
    'File System': () => hasGlobal('showOpenFilePicker') || hasGlobal('FileSystemHandle'),
    Fullscreen: () => hasDocument('fullscreenEnabled'),
    Gamepad: () => hasNavigator('getGamepads'),
    'History': () => hasGlobal('history'),
    IndexedDB: () => hasGlobal('indexedDB'),
    'Intersection Observer': () => hasGlobal('IntersectionObserver'),
    'Media Capabilities': () => hasNavigator('mediaCapabilities'),
    'Media Source': () => hasGlobal('MediaSource'),
    Navigation: () => hasGlobal('navigation'),
    'Network Information': () => hasNavigator('connection'),
    'Page Visibility': () => hasDocument('visibilityState'),
    'Payment Request': () => hasGlobal('PaymentRequest'),
    'Permissions': () => hasNavigator('permissions'),
    'Picture-in-Picture': () => hasDocument('pictureInPictureEnabled'),
    'Pointer events': () => hasGlobal('PointerEvent'),
    'Pointer Lock': () => hasDocument('pointerLockElement'),
    Popover: () => hasGlobal('HTMLElement') && 'showPopover' in HTMLElement.prototype,
    Push: () => hasGlobal('PushManager'),
    'Resize Observer': () => hasGlobal('ResizeObserver'),
    SVG: () => hasGlobal('SVGElement'),
    'Screen Orientation': () => hasGlobal('screen') && 'orientation' in screen,
    'Screen Wake Lock': () => hasNavigator('wakeLock'),
    Selection: () => hasGlobal('Selection'),
    'Server-sent events': () => hasGlobal('EventSource'),
    'Service Worker': () => hasNavigator('serviceWorker'),
    Storage: () => hasGlobal('localStorage') && hasGlobal('sessionStorage'),
    Streams: () => hasGlobal('ReadableStream') && hasGlobal('WritableStream'),
    'Touch events': () => hasGlobal('TouchEvent') || hasNavigator('maxTouchPoints'),
    'Trusted Types': () => hasGlobal('trustedTypes'),
    'URL': () => hasGlobal('URL'),
    'URL Pattern': () => hasGlobal('URLPattern'),
    Vibration: () => hasNavigator('vibrate'),
    'View Transition': () => hasDocument('startViewTransition'),
    'Web Animations': () => hasGlobal('Animation'),
    'Web Audio': () => hasGlobal('AudioContext') || hasGlobal('webkitAudioContext'),
    'Web Authentication': () => hasNavigator('credentials') && hasGlobal('PublicKeyCredential'),
    'Web Components': () => hasGlobal('customElements'),
    'Web Crypto': () => hasGlobal('crypto') && 'subtle' in crypto,
    'Web Locks': () => hasNavigator('locks'),
    'Web Share': () => hasNavigator('share'),
    'Web Storage': () => hasGlobal('localStorage'),
    'Web Workers': () => hasGlobal('Worker'),
    WebCodecs: () => hasGlobal('VideoEncoder') || hasGlobal('AudioEncoder'),
    'WebGL: 2D and 3D graphics for the web': () => {
        const canvas = document.createElement('canvas')
        return canvas.getContext('webgl') !== null || canvas.getContext('webgl2') !== null
    },
    WebGPU: () => hasNavigator('gpu'),
    WebRTC: () => hasGlobal('RTCPeerConnection'),
    'WebSocket API (WebSockets)': () => hasGlobal('WebSocket'),
    WebTransport: () => hasGlobal('WebTransport'),
    WebVTT: () => hasGlobal('VTTCue'),
    XMLHttpRequest: () => hasGlobal('XMLHttpRequest'),
}

export const isWebApiAvailable = (apiName: string): boolean => {
    if (typeof window === 'undefined') return false

    const directCheck = WEB_API_AVAILABILITY_CHECKS[apiName]
    if (directCheck !== undefined) {
        return safeCheck(directCheck)
    }

    const inferredTokens = buildInferredTokens(apiName)
    return inferredTokens.some((token) => safeCheck(() => hasInKnownScopes(token)))
}
