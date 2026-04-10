import {
    API_BASE_PATH,
    ApiEndpoint,
    isNetworkIpPayload,
    isProjectPayload,
    resolveApiEndpoint,
    isUserPayload,
    type ProjectLibraryPayload,
    type ProjectPayload,
    type UserPayload,
} from '@src/shared/contracts/api'

export type UserResponse = UserPayload

export type NetworkMetricsResponse = {
    readonly ip: string
    readonly pingMs: number
    readonly downlinkMbps: number
}

export type ProjectInfoResponse = ProjectPayload

export type ProjectLibraryResponse = ProjectLibraryPayload

const PING_SAMPLE_COUNT = 3
const DOWNLOAD_TEST_BYTES = 5_000_000
const CLIENT_API_BASE_PATH = API_BASE_PATH

const buildApiUrl = (endpoint: ApiEndpoint, searchParams?: Record<string, string>): string => {
    const url = new URL(
        `${window.location.protocol}//${window.location.hostname}:${PORT}${CLIENT_API_BASE_PATH}${endpoint}`
    )
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

const fetchJson = async <TPayload>(
    endpoint: ApiEndpoint,
    guard: (value: unknown) => value is TPayload,
    options?: RequestInit,
    searchParams?: Record<string, string>
): Promise<TPayload> => {
    const apiUrl = buildApiUrl(endpoint, searchParams)
    const response = await fetch(apiUrl, options)
    if (!response.ok) {
        throw new Error(`Failed to load ${apiUrl}: ${response.status}`)
    }

    const payload: unknown = await response.json()
    if (!guard(payload)) {
        throw new Error(`Invalid ${endpoint} payload`)
    }

    return payload
}

export const requestUser = async (): Promise<UserResponse> => {
    return fetchJson(ApiEndpoint.User, isUserPayload)
}

const requestNetworkIp = async (): Promise<string> => {
    const payload = await fetchJson(
        ApiEndpoint.NetworkIp,
        isNetworkIpPayload,
        {
            cache: 'no-store',
        },
        { nonce: createRequestNonce() }
    )

    return payload.ip
}

const requestPingSample = async (): Promise<number> => {
    const apiUrl = buildApiUrl(ApiEndpoint.NetworkPing, { nonce: createRequestNonce() })
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
    const apiUrl = buildApiUrl(ApiEndpoint.NetworkDownload, {
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
        throw new Error(
            `Invalid elapsed time for ${resolveApiEndpoint(ApiEndpoint.NetworkDownload)}`
        )
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
    return fetchJson(ApiEndpoint.Project, isProjectPayload)
}
