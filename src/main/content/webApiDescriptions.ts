const WEB_API_DESCRIPTION_OVERRIDES: Readonly<Record<string, string>> = {
    'CSS Object Model (CSSOM)':
        'CSSOM exposes CSS style sheets and rules as JavaScript objects for reading and updates.',
    'Device orientation events':
        'Device orientation events expose physical device tilt and orientation sensor values.',
    'Force Touch events':
        'Force Touch events report pressure-sensitive interactions on supported touch hardware.',
    'Geometry interfaces':
        'Geometry interfaces provide point, rectangle, matrix, and transformation primitives.',
    'Performance APIs':
        'Performance APIs provide high-resolution timing and performance measurement interfaces.',
    'Pointer events': 'Pointer events unify mouse, touch, and pen input into a single event model.',
    'Sensor APIs': 'Sensor APIs provide access to hardware sensor streams in supported browsers.',
    'Server-sent events':
        'Server-sent events enable one-way real-time event streams from server to browser.',
    'Touch events':
        'Touch events provide low-level multi-touch interaction events for touchscreens.',
    'UI Events':
        'UI Events define core user interaction events such as keyboard, mouse, and focus.',
    'Web Components':
        'Web Components let you build reusable encapsulated custom elements for the web.',
    'WebGL: 2D and 3D graphics for the web':
        'WebGL provides GPU-accelerated 2D and 3D graphics rendering in the browser.',
}

const normalizeApiName = (apiName: string): string => {
    return apiName
        .replace(/\([^)]*\)/g, '')
        .replace(/ APIs?$/i, '')
        .replace(/ API$/i, '')
        .replace(/:\s*.*$/u, '')
        .trim()
}

const buildGenericWebApiDescription = (apiName: string): string => {
    const normalizedName = normalizeApiName(apiName)
    if (normalizedName === '') {
        return 'This browser API provides access to web platform capabilities.'
    }

    return `${normalizedName} is a browser API that provides interfaces for related web platform features.`
}

export const getWebApiDescription = (apiName: string): string => {
    return WEB_API_DESCRIPTION_OVERRIDES[apiName] ?? buildGenericWebApiDescription(apiName)
}
