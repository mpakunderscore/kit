import express, { type Express, type Request } from 'express'

import type { AppStaticPaths } from '@server/app/paths'
import { prisma } from '@server/lib/prisma'

type UserPayload = {
    readonly uuid: string
    readonly createdAt: string
    readonly updatedAt: string
}

type NetworkIpPayload = {
    readonly ip: string
    readonly timestamp: string
}

const DOWNLOAD_TEST_DEFAULT_BYTES = 5_000_000
const DOWNLOAD_TEST_MIN_BYTES = 1_000_000
const DOWNLOAD_TEST_MAX_BYTES = 20_000_000

const NETWORK_NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
} as const

const resolveUserPayload = async (): Promise<UserPayload> => {
    const existingUser = await prisma.user.findFirst({
        orderBy: {
            id: 'asc',
        },
    })
    const user =
        existingUser ??
        (await prisma.user.create({
            data: {},
        }))

    return {
        uuid: user.uuid,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }
}

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

const resolveNetworkIpPayload = (request: Request): NetworkIpPayload => {
    const forwardedIp = resolveForwardedIp(request)
    const fallbackIp = request.ip ?? request.socket.remoteAddress

    return {
        ip: normalizeIpAddress(forwardedIp ?? fallbackIp ?? undefined),
        timestamp: new Date().toISOString(),
    }
}

const parseDownloadTestBytes = (value: unknown): number => {
    const candidate = Array.isArray(value) ? value[0] : value
    if (typeof candidate !== 'string') return DOWNLOAD_TEST_DEFAULT_BYTES

    const parsedValue = Number(candidate)
    if (!Number.isInteger(parsedValue)) return DOWNLOAD_TEST_DEFAULT_BYTES

    return Math.min(DOWNLOAD_TEST_MAX_BYTES, Math.max(DOWNLOAD_TEST_MIN_BYTES, parsedValue))
}

const createDownloadPayload = (bytes: number): Buffer => {
    return Buffer.alloc(bytes, 120)
}

export const registerWebRoutes = (app: Express, paths: AppStaticPaths): void => {
    app.get('/api/user', async (_request, response, next) => {
        try {
            const payload = await resolveUserPayload()
            response.json(payload)
        } catch (error) {
            next(error)
        }
    })

    app.get('/api/network/ip', (request, response) => {
        response.set(NETWORK_NO_CACHE_HEADERS)
        response.json(resolveNetworkIpPayload(request))
    })

    app.get('/api/network/ping', (_request, response) => {
        response.set(NETWORK_NO_CACHE_HEADERS)
        response.status(204).send()
    })

    app.get('/api/network/download-test', (request, response) => {
        const payloadSize = parseDownloadTestBytes(request.query.bytes)
        response.set({
            ...NETWORK_NO_CACHE_HEADERS,
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(payloadSize),
            'Content-Encoding': 'identity',
        })
        response.status(200).end(createDownloadPayload(payloadSize))
    })

    app.use('/', express.static(paths.distDir))
}
