import fileSystem from 'fs'
import path from 'path'

import {
    accumulateTickMessage,
    extractNumericFields,
    isTickMessage,
    printAggregationSummary,
    startTickAggregation,
    type LogOutputFormatter,
} from '@server/lib/loggerTick'

// Logging utilities for the server.
// Notes: Colors can be disabled via LOG_COLORS=false; time format via LOG_TIME=off|time|datetime; milliseconds via LOG_MS=true.
// Output mode: LOG_OUTPUT=console|file|both (default: both - writes to console and file)

enum LogOutputMode {
    Console = 'console',
    File = 'file',
    Both = 'both',
}

const resolveLogOutputMode = (
    value: string | undefined,
    fallback: LogOutputMode
): LogOutputMode => {
    if (!value) return fallback
    const normalized = value.trim().toLowerCase()
    if (normalized === LogOutputMode.File) return LogOutputMode.File
    if (normalized === LogOutputMode.Console) return LogOutputMode.Console
    if (normalized === LogOutputMode.Both) return LogOutputMode.Both
    return fallback
}

const defaultOutputMode: LogOutputMode = LogOutputMode.Both
const logOutputMode: LogOutputMode = resolveLogOutputMode(process.env.LOG_OUTPUT, defaultOutputMode)

const logFileStream: fileSystem.WriteStream | undefined = (() => {
    if (logOutputMode === LogOutputMode.Console) {
        return undefined
    }

    const logDirectory = path.resolve(process.cwd(), 'logs')
    fileSystem.mkdirSync(logDirectory, { recursive: true })

    const logDateStamp = new Date().toISOString().split('T')[0]
    const logFilePath = path.join(logDirectory, `server-${logDateStamp}.log`)
    return fileSystem.createWriteStream(logFilePath, { flags: 'a' })
})()

export enum LogLevel {
    Tick = 'tick',
    Trace = 'trace',
    Debug = 'debug',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
    Silent = 'silent',
}
export type LoggerContextValue = string | number | boolean | null | undefined
export type LoggerContext = Record<string, LoggerContextValue>

const levelPriority: Record<LogLevel, number> = {
    [LogLevel.Tick]: 1,
    [LogLevel.Trace]: 10,
    [LogLevel.Debug]: 20,
    [LogLevel.Info]: 30,
    [LogLevel.Warn]: 40,
    [LogLevel.Error]: 50,
    [LogLevel.Silent]: 60,
}

type ActiveLogLevel = Exclude<LogLevel, LogLevel.Silent>

type ConsoleFunction = (...args: unknown[]) => void
type ConsoleMethodName = 'debug' | 'info' | 'warn' | 'error'

const getConsoleObject = (): Record<string, unknown> | undefined => {
    if (typeof globalThis === 'undefined') return undefined
    return (globalThis as unknown as { ['console']?: Record<string, unknown> })['console']
}

const getConsoleMethod = (name: ConsoleMethodName): ConsoleFunction => {
    const consoleObject = getConsoleObject()
    const method = consoleObject?.[name]
    if (typeof method !== 'function') return () => undefined
    return (...args: unknown[]) => {
        Reflect.apply(method as ConsoleFunction, consoleObject, args)
    }
}

const consoleMethod: Record<ActiveLogLevel, (...args: unknown[]) => void> = {
    [LogLevel.Tick]: getConsoleMethod('debug'),
    [LogLevel.Trace]: getConsoleMethod('debug'),
    [LogLevel.Debug]: getConsoleMethod('debug'),
    [LogLevel.Info]: getConsoleMethod('info'),
    [LogLevel.Warn]: getConsoleMethod('warn'),
    [LogLevel.Error]: getConsoleMethod('error'),
}

/* ---------- Config ---------- */

enum TimeMode {
    Off = 'off',
    Time = 'time',
    Datetime = 'datetime',
}

const isLogLevel = (value: string): value is LogLevel => value in levelPriority
const resolveLogLevel = (value?: string): LogLevel => {
    if (!value) return LogLevel.Info
    const n = value.trim().toLowerCase()
    return isLogLevel(n) ? n : LogLevel.Info
}

const resolveTimeMode = (value?: string): TimeMode => {
    const n = (value || '').trim().toLowerCase()
    return n === TimeMode.Off || n === TimeMode.Datetime ? (n as TimeMode) : TimeMode.Time
}

let currentLevel: LogLevel = resolveLogLevel(process.env.LOG_LEVEL)
const colorsEnabled = (process.env.LOG_COLORS ?? 'true').toLowerCase() !== 'false'
const timeMode: TimeMode = resolveTimeMode(process.env.LOG_TIME)
const withMilliseconds = (process.env.LOG_MS ?? 'false').toLowerCase() === 'true'

/* ---------- Tiny color helpers (no external deps) ---------- */
const c = {
    reset: (s: string) => (colorsEnabled ? `\x1b[0m${s}\x1b[0m` : s),
    dim: (s: string) => (colorsEnabled ? `\x1b[90m${s}\x1b[0m` : s),
    red: (s: string) => (colorsEnabled ? `\x1b[31m${s}\x1b[0m` : s),
    yellow: (s: string) => (colorsEnabled ? `\x1b[33m${s}\x1b[0m` : s),
    green: (s: string) => (colorsEnabled ? `\x1b[32m${s}\x1b[0m` : s),
    blue: (s: string) => (colorsEnabled ? `\x1b[34m${s}\x1b[0m` : s),
    magenta: (s: string) => (colorsEnabled ? `\x1b[35m${s}\x1b[0m` : s),
    cyan: (s: string) => (colorsEnabled ? `\x1b[36m${s}\x1b[0m` : s),
    bold: (s: string) => (colorsEnabled ? `\x1b[1m${s}\x1b[0m` : s),
}

const levelColor: Record<ActiveLogLevel, (s: string) => string> = {
    tick: c.dim,
    trace: c.dim,
    debug: c.magenta,
    info: c.green,
    warn: c.yellow,
    error: c.red,
}

/* ---------- Core utils ---------- */

const getLogLevel = (): LogLevel => currentLevel
const setLogLevel = (next: LogLevel | string): void => {
    currentLevel = typeof next === 'string' ? resolveLogLevel(next) : next
}

const shouldLog = (level: ActiveLogLevel): boolean =>
    levelPriority[level] >= levelPriority[currentLevel]

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n))
const pad3 = (n: number) => (n < 10 ? `00${n}` : n < 100 ? `0${n}` : String(n))

const formatTimestamp = (): string => {
    if (timeMode === TimeMode.Off) return ''
    const date = new Date()
    const hour = pad2(date.getHours())
    const minute = pad2(date.getMinutes())
    const second = pad2(date.getSeconds())
    const milli = withMilliseconds ? `.${pad3(date.getMilliseconds())}` : ''
    if (timeMode === TimeMode.Time) return c.dim(`[${hour}:${minute}:${second}${milli}]`)
    const year = date.getFullYear()
    const month = pad2(date.getMonth() + 1)
    const day = pad2(date.getDate())
    return c.dim(`[${year}-${month}-${day} ${hour}:${minute}:${second}${milli}]`)
}

const stripAnsi = (value: string): string => value.replace(/\u001b\[[0-9;]*m/g, '')

/**
 * Server-friendly sanitization: keep errors small and readable.
 */
const sanitizeErrorsInObject = (value: unknown): unknown => {
    if (value === null || value === undefined) return value
    if (value instanceof Error) {
        return { name: value.name, message: value.message || value.toString() }
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>
        const sanitized: Record<string, unknown> = {}
        let hasChanges = false
        for (const [key, val] of Object.entries(obj)) {
            const sanitizedVal = sanitizeErrorsInObject(val)
            if (sanitizedVal !== val) hasChanges = true
            sanitized[key] = sanitizedVal
        }
        return hasChanges ? sanitized : value
    }
    if (Array.isArray(value)) {
        const sanitized = value.map((item) => sanitizeErrorsInObject(item))
        return sanitized.some((item, index) => item !== value[index]) ? sanitized : value
    }
    return value
}

const formatLogArgument = (value: unknown): string => {
    if (typeof value === 'string') return value
    const sanitized = sanitizeErrorsInObject(value)
    if (sanitized instanceof Error) {
        return (
            [sanitized.name, sanitized.message].filter(Boolean).join(': ') || sanitized.toString()
        )
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

const formatContext = (context: LoggerContext): { scopeTag: string; rest: string } => {
    const entries = Object.entries(context).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
    )

    const scopeEntry = entries.find(([k]) => k === 'scope')
    const scopeText = scopeEntry ? String(scopeEntry[1]) : ''
    const scopeTag = scopeText ? c.blue(`[${scopeText}]`) : ''

    const rest = entries
        .filter(([k]) => k !== 'scope')
        .map(([k, v]) => `${c.dim(k)}=${String(v)}`)
        .join(' ')

    return { scopeTag, rest }
}

/* ---------- Tick Aggregation ---------- */

let aggregationTimer: NodeJS.Timeout | undefined

const initAggregation = (): void => {
    if (aggregationTimer) return

    const formatter: LogOutputFormatter = {
        formatTimestamp,
        stripAnsi,
        c,
        levelColor,
        consoleMethod,
        logOutputMode,
        logFileStream,
    }

    aggregationTimer = startTickAggregation(() => {
        printAggregationSummary(formatter)
    })
}

/* ---------- Public API ---------- */

export interface Logger {
    readonly level: () => LogLevel
    readonly setLevel: (level: LogLevel | string) => void
    readonly tick: (...args: unknown[]) => void
    readonly trace: (...args: unknown[]) => void
    readonly debug: (...args: unknown[]) => void
    readonly info: (...args: unknown[]) => void
    readonly warn: (...args: unknown[]) => void
    readonly error: (...args: unknown[]) => void
    readonly withContext: (context: LoggerContext) => Logger
}

const createLogger = (baseContext: LoggerContext = {}): Logger => {
    const log = (level: ActiveLogLevel, ...args: unknown[]): void => {
        if (!shouldLog(level)) return

        const ts = formatTimestamp()
        const { scopeTag, rest } = formatContext(baseContext)
        const lvl = levelColor[level](level.toUpperCase())

        const headParts = [ts, scopeTag, lvl, rest].filter(Boolean).join(' ')
        const sanitizedArgs = args.map((value) => sanitizeErrorsInObject(value))

        if (logOutputMode === LogOutputMode.Console || logOutputMode === LogOutputMode.Both) {
            consoleMethod[level](headParts, ...sanitizedArgs)
        }

        if (
            (logOutputMode === LogOutputMode.File || logOutputMode === LogOutputMode.Both) &&
            logFileStream
        ) {
            const logLine = [
                stripAnsi(headParts),
                ...sanitizedArgs.map((value) => formatLogArgument(value)),
            ]
                .filter((segment) => segment.length > 0)
                .join(' ')
            logFileStream.write(`${logLine}\n`)
        }
    }

    const tick = (...args: unknown[]): void => {
        initAggregation()

        const scope = baseContext.scope as string | undefined
        let messageText: string | undefined
        for (const arg of args) {
            if (typeof arg === 'string') {
                messageText = arg
                break
            }
            if (
                typeof arg === 'object' &&
                arg !== null &&
                !Array.isArray(arg) &&
                !(arg instanceof Error)
            ) {
                const obj = arg as Record<string, unknown>
                if (typeof obj.message === 'string') {
                    messageText = obj.message
                    break
                }
            }
        }

        if (isTickMessage(scope, messageText)) {
            const numericFields = extractNumericFields(args)
            accumulateTickMessage(scope, messageText, numericFields)
        } else {
            log(LogLevel.Trace, ...args)
        }
    }

    return {
        level: getLogLevel,
        setLevel: setLogLevel,
        tick,
        trace: (...a: unknown[]) => log(LogLevel.Trace, ...a),
        debug: (...a: unknown[]) => log(LogLevel.Debug, ...a),
        info: (...a: unknown[]) => log(LogLevel.Info, ...a),
        warn: (...a: unknown[]) => log(LogLevel.Warn, ...a),
        error: (...a: unknown[]) => log(LogLevel.Error, ...a),
        withContext: (ctx: LoggerContext) => createLogger({ ...baseContext, ...ctx }),
    }
}

const logger = createLogger()

export { createLogger, logger }
