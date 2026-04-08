export type UserResponse = {
    readonly uuid: string
    readonly createdAt: string
    readonly updatedAt: string
}

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

export const requestUser = async (): Promise<UserResponse> => {
    const apiUrl = `${window.location.protocol}//${window.location.hostname}:${PORT}/api/user`
    console.log(`Requesting ${apiUrl}`)
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
