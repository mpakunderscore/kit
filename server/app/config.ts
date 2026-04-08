const DEFAULT_SERVER_PORT = 4000
const MIN_PORT = 1
const MAX_PORT = 65535

const toPortNumber = (value: string): number | null => {
    const parsed = Number(value)
    if (!Number.isInteger(parsed)) return null
    if (parsed < MIN_PORT || parsed > MAX_PORT) return null
    return parsed
}

export const resolveServerPort = (rawPort: string | undefined): number => {
    if (!rawPort) return DEFAULT_SERVER_PORT

    const normalizedPort = rawPort.trim()
    if (normalizedPort.length === 0) return DEFAULT_SERVER_PORT

    const parsedPort = toPortNumber(normalizedPort)
    if (parsedPort !== null) return parsedPort

    throw new Error(
        `Invalid PORT value "${rawPort}". Expected an integer in range ${MIN_PORT}-${MAX_PORT}.`
    )
}

export const serverPort = resolveServerPort(process.env.PORT)
