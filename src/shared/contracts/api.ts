export const API_BASE_PATH = '/api'

export enum ApiEndpoint {
    User = '/user',
    NetworkIp = '/network/ip',
    NetworkPing = '/network/ping',
    NetworkDownload = '/network/download',
    Project = '/project',
}

export const resolveApiEndpoint = (endpoint: ApiEndpoint): string => {
    return `${API_BASE_PATH}${endpoint}`
}

export type UserPayload = {
    readonly uuid: string
    readonly createdAt: string
    readonly updatedAt: string
}

export type NetworkIpPayload = {
    readonly ip: string
    readonly timestamp: string
}

export type ProjectLibraryPayload = {
    readonly name: string
    readonly version: string
}

export type ProjectPayload = {
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

export const isUserPayload = (value: unknown): value is UserPayload => {
    if (!isRecord(value)) return false

    return (
        typeof value.uuid === 'string' &&
        typeof value.createdAt === 'string' &&
        typeof value.updatedAt === 'string'
    )
}

export const isNetworkIpPayload = (value: unknown): value is NetworkIpPayload => {
    if (!isRecord(value)) return false

    return typeof value.ip === 'string' && typeof value.timestamp === 'string'
}

export const isProjectLibraryPayload = (value: unknown): value is ProjectLibraryPayload => {
    if (!isRecord(value)) return false

    return typeof value.name === 'string' && typeof value.version === 'string'
}

export const isProjectPayload = (value: unknown): value is ProjectPayload => {
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
        typeof value.devDependenciesCount === 'number' &&
        Array.isArray(value.dependenciesLibraries) &&
        value.dependenciesLibraries.every((library) => isProjectLibraryPayload(library)) &&
        Array.isArray(value.devDependenciesLibraries) &&
        value.devDependenciesLibraries.every((library) => isProjectLibraryPayload(library))
    )
}
