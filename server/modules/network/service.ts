import type { Request } from 'express'

import type { NetworkIpPayload } from '../../../src/shared/contracts/api'

const DOWNLOAD_TEST_DEFAULT_BYTES = 5_000_000
const DOWNLOAD_TEST_MIN_BYTES = 1_000_000
const DOWNLOAD_TEST_MAX_BYTES = 20_000_000

export const NETWORK_NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
} as const

const normalizeIpAddress = (value: string | undefined): string => {
    if (!value || value.trim() === '') return 'unknown'

    const normalized = value.trim()
    if (normalized === '::1') return '127.0.0.1'
    if (normalized.startsWith('::ffff:')) return normalized.slice('::ffff:'.length)
    return normalized
}

const resolveForwardedIp = (request: Request): string | undefined => {
    const forwarded = request.headers['x-forwarded-for']
    if (typeof forwarded === 'string') {
        const [firstIp] = forwarded.split(',')
        return firstIp?.trim()
    }

    if (Array.isArray(forwarded) && forwarded.length > 0) {
        const [firstIp] = forwarded[0].split(',')
        return firstIp?.trim()
    }

    return undefined
}

export const resolveNetworkIpPayload = (request: Request): NetworkIpPayload => {
    const forwardedIp = resolveForwardedIp(request)
    const fallbackIp = request.ip ?? request.socket.remoteAddress

    return {
        ip: normalizeIpAddress(forwardedIp ?? fallbackIp ?? undefined),
        timestamp: new Date().toISOString(),
    }
}

export const parseDownloadTestBytes = (value: unknown): number => {
    const candidate = Array.isArray(value) ? value[0] : value
    if (typeof candidate !== 'string') return DOWNLOAD_TEST_DEFAULT_BYTES

    const parsedValue = Number(candidate)
    if (!Number.isInteger(parsedValue)) return DOWNLOAD_TEST_DEFAULT_BYTES

    return Math.min(DOWNLOAD_TEST_MAX_BYTES, Math.max(DOWNLOAD_TEST_MIN_BYTES, parsedValue))
}

export const createDownloadPayload = (bytes: number): Buffer => {
    return Buffer.alloc(bytes, 120)
}
