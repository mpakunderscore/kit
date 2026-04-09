export type UserResponse = {
    readonly uuid: string
    readonly createdAt: string
    readonly updatedAt: string
}

export type NetworkMetricsResponse = {
    readonly ip: string
    readonly pingMs: number
    readonly downlinkMbps: number
}

export type ProjectInfoResponse = {
    readonly name: string
    readonly version: string
    readonly description: string
    readonly author: string
    readonly license: string
    readonly nodeVersion: string
    readonly scriptsCount: number
    readonly dependenciesCount: number
    readonly devDependenciesCount: number
}

type NetworkIpResponse = {
    readonly ip: string
    readonly timestamp: string
}

const PING_SAMPLE_COUNT = 3
const DOWNLOAD_TEST_BYTES = 5_000_000

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const isUserResponse = (value: unknown): value is UserResponse => {
    if (!isRecord(value)) return false

    return (
        typeof value.uuid === 'string' &&
        typeof value.createdAt === 'string' &&
        typeof value.updatedAt === 'string'
    )
}

const isNetworkIpResponse = (value: unknown): value is NetworkIpResponse => {
    if (!isRecord(value)) return false

    return typeof value.ip === 'string' && typeof value.timestamp === 'string'
}

const isProjectInfoResponse = (value: unknown): value is ProjectInfoResponse => {
    if (!isRecord(value)) return false

    return (
        typeof value.name === 'string' &&
        typeof value.version === 'string' &&
        typeof value.description === 'string' &&
        typeof value.author === 'string' &&
        typeof value.license === 'string' &&
        typeof value.nodeVersion === 'string' &&
        typeof value.scriptsCount === 'number' &&
        typeof value.dependenciesCount === 'number' &&
        typeof value.devDependenciesCount === 'number'
    )
}

const buildApiUrl = (path: string, searchParams?: Record<string, string>): string => {
    const url = new URL(`${window.location.protocol}//${window.location.hostname}:${PORT}${path}`)
    if (searchParams !== undefined) {
        for (const [key, value] of Object.entries(searchParams)) {
            url.searchParams.set(key, value)
        }
    }
    return url.toString()
}

const createRequestNonce = (): string => {
    return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

const round = (value: number): number => {
    return Number(value.toFixed(2))
}

const resolveMedian = (values: readonly number[]): number => {
    const sorted = [...values].sort((left, right) => left - right)
    const middleIndex = Math.floor(sorted.length / 2)
    return sorted[middleIndex]
}

export const requestUser = async (): Promise<UserResponse> => {
    const apiUrl = buildApiUrl('/api/user')
    const response = await fetch(apiUrl)
    if (!response.ok) {
        throw new Error(`Failed to load ${apiUrl}: ${response.status}`)
    }

    const payload: unknown = await response.json()
    if (!isUserResponse(payload)) {
        throw new Error('Invalid /api/user payload')
    }

    return payload
}

const requestNetworkIp = async (): Promise<string> => {
    const apiUrl = buildApiUrl('/api/network/ip', { nonce: createRequestNonce() })
    const response = await fetch(apiUrl, {
        cache: 'no-store',
    })
    if (!response.ok) {
        throw new Error(`Failed to load ${apiUrl}: ${response.status}`)
    }

    const payload: unknown = await response.json()
    if (!isNetworkIpResponse(payload)) {
        throw new Error('Invalid /api/network/ip payload')
    }

    return payload.ip
}

const requestPingSample = async (): Promise<number> => {
    const apiUrl = buildApiUrl('/api/network/ping', { nonce: createRequestNonce() })
    const startedAt = performance.now()
    const response = await fetch(apiUrl, {
        cache: 'no-store',
    })
    const finishedAt = performance.now()

    if (!response.ok) {
        throw new Error(`Failed to load ${apiUrl}: ${response.status}`)
    }

    return finishedAt - startedAt
}

const requestPing = async (): Promise<number> => {
    const samples: number[] = []
    for (let index = 0; index < PING_SAMPLE_COUNT; index += 1) {
        samples.push(await requestPingSample())
    }

    return round(resolveMedian(samples))
}

const requestDownlink = async (): Promise<number> => {
    const apiUrl = buildApiUrl('/api/network/download-test', {
        bytes: String(DOWNLOAD_TEST_BYTES),
        nonce: createRequestNonce(),
    })
    const startedAt = performance.now()
    const response = await fetch(apiUrl, {
        cache: 'no-store',
    })
    if (!response.ok) {
        throw new Error(`Failed to load ${apiUrl}: ${response.status}`)
    }

    const payload = await response.arrayBuffer()
    const elapsedSeconds = (performance.now() - startedAt) / 1_000
    if (elapsedSeconds <= 0) {
        throw new Error('Invalid elapsed time for /api/network/download-test')
    }

    const downlinkMbps = (payload.byteLength * 8) / elapsedSeconds / 1_000_000
    return round(downlinkMbps)
}

export const requestNetworkMetrics = async (): Promise<NetworkMetricsResponse> => {
    const ip = await requestNetworkIp()
    const pingMs = await requestPing()
    const downlinkMbps = await requestDownlink()

    return {
        ip,
        pingMs,
        downlinkMbps,
    }
}

export const requestProjectInfo = async (): Promise<ProjectInfoResponse> => {
    const apiUrl = buildApiUrl('/api/project')
    const response = await fetch(apiUrl)
    if (!response.ok) {
        throw new Error(`Failed to load ${apiUrl}: ${response.status}`)
    }

    const payload: unknown = await response.json()
    if (!isProjectInfoResponse(payload)) {
        throw new Error('Invalid /api/project payload')
    }

    return payload
}
