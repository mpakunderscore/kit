import {
    colorsEnabled,
    timeMode,
    withMilliseconds,
    type ActiveLogLevel,
    type LoggerContext,
} from './config'

type Colorize = (value: string) => string

const colorize = (code: string): Colorize => {
    return (value: string) => (colorsEnabled ? `\x1b[${code}m${value}\x1b[0m` : value)
}

export const c = {
    dim: colorize('90'),
    red: colorize('31'),
    yellow: colorize('33'),
    green: colorize('32'),
    blue: colorize('34'),
    magenta: colorize('35'),
}

export const levelColor: Record<ActiveLogLevel, (value: string) => string> = {
    tick: c.dim,
    trace: c.dim,
    debug: c.magenta,
    info: c.green,
    warn: c.yellow,
    error: c.red,
}

const pad2 = (value: number): string => (value < 10 ? `0${value}` : String(value))
const pad3 = (value: number): string =>
    value < 10 ? `00${value}` : value < 100 ? `0${value}` : String(value)

export const formatTimestamp = (): string => {
    if (timeMode === 'off') return ''

    const date = new Date()
    const hour = pad2(date.getHours())
    const minute = pad2(date.getMinutes())
    const second = pad2(date.getSeconds())
    const milli = withMilliseconds ? `.${pad3(date.getMilliseconds())}` : ''

    if (timeMode === 'time') {
        return c.dim(`[${hour}:${minute}:${second}${milli}]`)
    }

    const year = date.getFullYear()
    const month = pad2(date.getMonth() + 1)
    const day = pad2(date.getDate())
    return c.dim(`[${year}-${month}-${day} ${hour}:${minute}:${second}${milli}]`)
}

export const stripAnsi = (value: string): string => value.replace(/\u001b\[[0-9;]*m/g, '')

export const sanitizeErrorsInObject = (value: unknown): unknown => {
    if (value === null || value === undefined) return value

    if (value instanceof Error) {
        return { name: value.name, message: value.message || value.toString() }
    }

    if (Array.isArray(value)) {
        const sanitized = value.map((item) => sanitizeErrorsInObject(item))
        return sanitized.some((item, index) => item !== value[index]) ? sanitized : value
    }

    if (typeof value === 'object') {
        const objectValue = value as Record<string, unknown>
        const sanitized: Record<string, unknown> = {}
        let hasChanges = false

        for (const [key, item] of Object.entries(objectValue)) {
            const sanitizedValue = sanitizeErrorsInObject(item)
            if (sanitizedValue !== item) hasChanges = true
            sanitized[key] = sanitizedValue
        }

        return hasChanges ? sanitized : value
    }

    return value
}

export const formatLogArgument = (value: unknown): string => {
    if (typeof value === 'string') return value

    const sanitized = sanitizeErrorsInObject(value)
    if (sanitized instanceof Error) {
        return [sanitized.name, sanitized.message].filter(Boolean).join(': ') || sanitized.toString()
    }

    try {
        const serialized = JSON.stringify(sanitized)
        return typeof serialized === 'string' ? serialized : String(sanitized)
    } catch (error) {
        if (error instanceof Error) {
            return [error.name, error.message].filter(Boolean).join(': ') || error.toString()
        }
        return String(sanitized)
    }
}

export const formatContext = (context: LoggerContext): { scopeTag: string; rest: string } => {
    const entries = Object.entries(context).filter(
        ([, value]) => value !== undefined && value !== null && value !== ''
    )

    const scopeValue = entries.find(([key]) => key === 'scope')?.[1]
    const scopeTag = scopeValue ? c.blue(`[${String(scopeValue)}]`) : ''

    const rest = entries
        .filter(([key]) => key !== 'scope')
        .map(([key, value]) => `${c.dim(key)}=${String(value)}`)
        .join(' ')

    return { scopeTag, rest }
}
