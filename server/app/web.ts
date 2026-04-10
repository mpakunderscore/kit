import { readFile } from 'node:fs/promises'
import path from 'node:path'

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

type ProjectPayload = {
    readonly name: string
    readonly version: string
    readonly description: string
    readonly author: string
    readonly license: string
    readonly nodeVersion: string
    readonly scriptsCount: number
    readonly dependenciesCount: number
    readonly devDependenciesCount: number
    readonly dependenciesLibraries: readonly ProjectLibraryPayload[]
    readonly devDependenciesLibraries: readonly ProjectLibraryPayload[]
}

type ProjectLibraryPayload = {
    readonly name: string
    readonly version: string
}

type PackageJson = Readonly<Record<string, unknown>>

const DOWNLOAD_TEST_DEFAULT_BYTES = 5_000_000
const DOWNLOAD_TEST_MIN_BYTES = 1_000_000
const DOWNLOAD_TEST_MAX_BYTES = 20_000_000
const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json')
const NOT_AVAILABLE_VALUE = 'Not available'

const NETWORK_NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
} as const

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

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

const resolveStringValue = (value: unknown): string => {
    if (typeof value !== 'string') return NOT_AVAILABLE_VALUE
    const normalizedValue = value.trim()
    return normalizedValue === '' ? NOT_AVAILABLE_VALUE : normalizedValue
}

const resolveAuthorValue = (value: unknown): string => {
    if (typeof value === 'string') return resolveStringValue(value)
    if (!isRecord(value)) return NOT_AVAILABLE_VALUE
    return resolveStringValue(value.name)
}

const resolveObjectSize = (value: unknown): number => {
    if (!isRecord(value)) return 0
    return Object.keys(value).length
}

const resolvePackageLibraries = (source: unknown): readonly ProjectLibraryPayload[] => {
    const librariesByName = new Map<string, string>()

    if (!isRecord(source)) return []

    for (const [name, version] of Object.entries(source)) {
        if (typeof version !== 'string') continue

        const normalizedName = name.trim()
        const normalizedVersion = version.trim()
        if (normalizedName === '' || normalizedVersion === '') continue
        if (librariesByName.has(normalizedName)) continue

        librariesByName.set(normalizedName, normalizedVersion)
    }

    return [...librariesByName.entries()]
        .sort(([leftName], [rightName]) => leftName.localeCompare(rightName))
        .map(([name, version]) => ({ name, version }))
}

const readPackageJson = async (): Promise<PackageJson> => {
    const rawContent = await readFile(PACKAGE_JSON_PATH, 'utf8')
    const parsedContent: unknown = JSON.parse(rawContent)
    if (!isRecord(parsedContent)) {
        throw new Error('Invalid package.json payload')
    }
    return parsedContent
}

const resolveProjectPayload = async (): Promise<ProjectPayload> => {
    const packageJson = await readPackageJson()

    return {
        name: resolveStringValue(packageJson.name),
        version: resolveStringValue(packageJson.version),
        description: resolveStringValue(packageJson.description),
        author: resolveAuthorValue(packageJson.author),
        license: resolveStringValue(packageJson.license),
        nodeVersion: isRecord(packageJson.engines)
            ? resolveStringValue(packageJson.engines.node)
            : NOT_AVAILABLE_VALUE,
        scriptsCount: resolveObjectSize(packageJson.scripts),
        dependenciesCount: resolveObjectSize(packageJson.dependencies),
        devDependenciesCount: resolveObjectSize(packageJson.devDependencies),
        dependenciesLibraries: resolvePackageLibraries(packageJson.dependencies),
        devDependenciesLibraries: resolvePackageLibraries(packageJson.devDependencies),
    }
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

    app.get('/api/project', async (_request, response, next) => {
        try {
            const payload = await resolveProjectPayload()
            response.json(payload)
        } catch (error) {
            next(error)
        }
    })

    app.use('/', express.static(paths.distDir))
}
