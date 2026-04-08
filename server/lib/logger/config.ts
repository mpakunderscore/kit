export enum LogOutputMode {
    Console = 'console',
    File = 'file',
    Both = 'both',
}

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
export type ActiveLogLevel = Exclude<LogLevel, LogLevel.Silent>

export const levelPriority: Record<LogLevel, number> = {
    [LogLevel.Tick]: 1,
    [LogLevel.Trace]: 10,
    [LogLevel.Debug]: 20,
    [LogLevel.Info]: 30,
    [LogLevel.Warn]: 40,
    [LogLevel.Error]: 50,
    [LogLevel.Silent]: 60,
}

enum TimeMode {
    Off = 'off',
    Time = 'time',
    Datetime = 'datetime',
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

const isLogLevel = (value: string): value is LogLevel => value in levelPriority
const resolveLogLevel = (value?: string): LogLevel => {
    if (!value) return LogLevel.Info
    const normalized = value.trim().toLowerCase()
    return isLogLevel(normalized) ? normalized : LogLevel.Info
}

const resolveTimeMode = (value?: string): TimeMode => {
    const normalized = (value || '').trim().toLowerCase()
    return normalized === TimeMode.Off || normalized === TimeMode.Datetime
        ? (normalized as TimeMode)
        : TimeMode.Time
}

const defaultOutputMode: LogOutputMode = LogOutputMode.Both
export const logOutputMode: LogOutputMode = resolveLogOutputMode(
    process.env.LOG_OUTPUT,
    defaultOutputMode
)

export const colorsEnabled = (process.env.LOG_COLORS ?? 'true').toLowerCase() !== 'false'
export const withMilliseconds = (process.env.LOG_MS ?? 'false').toLowerCase() === 'true'
export const timeMode: 'off' | 'time' | 'datetime' = resolveTimeMode(process.env.LOG_TIME)

let currentLevel: LogLevel = resolveLogLevel(process.env.LOG_LEVEL)

export const getLogLevel = (): LogLevel => currentLevel
export const setLogLevel = (next: LogLevel | string): void => {
    currentLevel = typeof next === 'string' ? resolveLogLevel(next) : next
}

export const shouldLog = (level: ActiveLogLevel): boolean =>
    levelPriority[level] >= levelPriority[currentLevel]
