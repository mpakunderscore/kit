export const DESKTOP_IPC_CHANNELS = {
    userGet: 'desktop:user:get',
} as const

export type DesktopUserPayload = {
    readonly uuid: string
    readonly createdAt: string
    readonly updatedAt: string
}

export const isDesktopUserPayload = (value: unknown): value is DesktopUserPayload => {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as Record<string, unknown>
    return (
        typeof record.uuid === 'string' &&
        typeof record.createdAt === 'string' &&
        typeof record.updatedAt === 'string'
    )
}
