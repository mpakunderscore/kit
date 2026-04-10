/**
 * Lightweight client-side logger mirroring the server logger API.
 *
 * - Log level can be controlled via URL (?logLevel=debug), localStorage(LOG_LEVEL), or process.env.LOG_LEVEL.
 * - Keeps a small in-memory log history for debugging.
 * - Groups repeated identical messages to reduce spam.
 */

import {
    checkSpamDetection,
    clearAllGroupedMessages,
    getTimeoutMs,
    setFlushCallback,
    type GroupedMessage,
} from '@src/utils/logger/dedupe'
import { storage, StorageKey } from '@src/utils/storage'

export enum LogLevel {
    Trace = 'trace',
    Debug = 'debug',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
    Silent = 'silent',
}
export const LOG_LEVEL_STORAGE_KEY = StorageKey.LogLevel
export const LOG_SCOPE_LEVELS_STORAGE_KEY = StorageKey.LogScopeLevels
export const LOG_HIDE_TIME_STORAGE_KEY = StorageKey.LogHideTime
export const LOG_LEVELS: ReadonlyArray<LogLevel> = Object.values(LogLevel)

export type LoggerContextValue = string | number | boolean | null | undefined
export type LoggerContext = Record<string, LoggerContextValue>

const levelPriority: Record<LogLevel, number> = {
    [LogLevel.Trace]: 10,
    [LogLevel.Debug]: 20,
    [LogLevel.Info]: 30,
    [LogLevel.Warn]: 40,
    [LogLevel.Error]: 50,
    [LogLevel.Silent]: 60,
}

type ActiveLogLevel = Exclude<LogLevel, LogLevel.Silent>
export type { ActiveLogLevel }

const consoleMethod: Record<ActiveLogLevel, (...args: unknown[]) => void> = {
    [LogLevel.Trace]: console.trace.bind(console),
    [LogLevel.Debug]: console.debug.bind(console),
    [LogLevel.Info]: console.info.bind(console),
    [LogLevel.Warn]: console.warn.bind(console),
    [LogLevel.Error]: console.error.bind(console),
}

const SPAM_NOTICE_COOLDOWN_MS = 1000
let lastSpamNoticeAt = 0

const SPAM_FILTER_ENABLED = false

const isLogLevel = (value: string): value is LogLevel => value in levelPriority

const resolveLogLevel = (value?: string | null): LogLevel => {
    if (!value) return LogLevel.Info
    const normalized = value.trim().toLowerCase()
    return isLogLevel(normalized) ? normalized : LogLevel.Info
}

const readProcessLogLevel = (): string | undefined => {
    if (typeof process === 'undefined') return undefined
    const env = (process as unknown as { env?: Record<string, string | undefined> }).env
    return env?.LOG_LEVEL
}

const readStorageLogLevel = (): string | undefined => {
    const raw = storage.getItem(LOG_LEVEL_STORAGE_KEY)
    return raw ?? undefined
}

const readSearchLogLevel = (): string | undefined => {
    if (typeof window === 'undefined') return undefined
    try {
        const search = new URLSearchParams(window.location.search)
        return (
            search.get('logLevel') ||
            search.get('log_level') ||
            search.get('LOG_LEVEL') ||
            undefined
        )
    } catch {
        return undefined
    }
}

let currentLevel: LogLevel = resolveLogLevel(
    readSearchLogLevel() ?? readStorageLogLevel() ?? readProcessLogLevel()
)

const resolveHideTimestamp = (value?: string | null): boolean => value === 'true'

const readStorageHideTimestamp = (): boolean => {
    return resolveHideTimestamp(storage.getItem(LOG_HIDE_TIME_STORAGE_KEY))
}

let hideTimestamp = readStorageHideTimestamp()

type LogLevelSubscriber = (level: LogLevel) => void
type ScopeLevelSubscriber = (levels: Record<string, LogLevel>) => void

const subscribers = new Set<LogLevelSubscriber>()
const scopeLevelSubscribers = new Set<ScopeLevelSubscriber>()
const scopeLevelOverrides = new Map<string, LogLevel>()

const notifyScopeSubscribers = (): void => {
    const payload = Object.fromEntries(scopeLevelOverrides)
    for (const subscriber of scopeLevelSubscribers) {
        try {
            subscriber(payload)
        } catch {
            // Ignore subscriber errors.
        }
    }
}

const notifySubscribers = (): void => {
    for (const subscriber of subscribers) {
        try {
            subscriber(currentLevel)
        } catch {
            // Ignore subscriber errors.
        }
    }
}

const getLogLevel = (): LogLevel => currentLevel

const getScopeLevel = (scope: LoggerContextValue | undefined): LogLevel | undefined => {
    if (typeof scope !== 'string') return undefined
    return scopeLevelOverrides.get(scope)
}

const persistLogLevel = (level: LogLevel): void => {
    storage.setItem(LOG_LEVEL_STORAGE_KEY, level)
}

const setLogLevel = (next: LogLevel | string): void => {
    const resolved = typeof next === 'string' ? resolveLogLevel(next) : next
    if (currentLevel === resolved) return
    currentLevel = resolved
    persistLogLevel(currentLevel)
    notifySubscribers()
}

const persistHideTimestamp = (hidden: boolean): void => {
    storage.setItem(LOG_HIDE_TIME_STORAGE_KEY, String(hidden))
}

export const setHideTimestamp = (hidden: boolean, options: { persist?: boolean } = {}): void => {
    const shouldPersist = options.persist ?? true
    if (hideTimestamp === hidden) return
    hideTimestamp = hidden
    if (shouldPersist) persistHideTimestamp(hidden)
}

export const isTimestampHidden = (): boolean => hideTimestamp

const subscribeToLogLevel = (listener: LogLevelSubscriber): (() => void) => {
    subscribers.add(listener)
    return () => subscribers.delete(listener)
}

const persistScopeLevels = (): void => {
    try {
        const serialized = JSON.stringify(Object.fromEntries(scopeLevelOverrides))
        storage.setItem(LOG_SCOPE_LEVELS_STORAGE_KEY, serialized)
    } catch {
        // Ignore persistence errors.
    }
}

const loadScopeLevels = (): void => {
    try {
        const raw = storage.getItem(LOG_SCOPE_LEVELS_STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw) as Record<string, unknown>
        scopeLevelOverrides.clear()
        for (const [scope, value] of Object.entries(parsed)) {
            const resolved = resolveLogLevel(String(value))
            scopeLevelOverrides.set(scope, resolved)
        }
    } catch {
        // Ignore parsing errors.
    }
}

loadScopeLevels()

export const setScopeLevel = (scope: string, level: LogLevel): void => {
    scopeLevelOverrides.set(scope, level)
    persistScopeLevels()
    notifyScopeSubscribers()
}

export const clearScopeLevel = (scope: string): void => {
    scopeLevelOverrides.delete(scope)
    persistScopeLevels()
    notifyScopeSubscribers()
}

export const clearScopeLevels = (): void => {
    scopeLevelOverrides.clear()
    persistScopeLevels()
    notifyScopeSubscribers()
}

export const getScopeLevels = (): Record<string, LogLevel> =>
    Object.fromEntries(scopeLevelOverrides)

export const subscribeToScopeLevels = (listener: ScopeLevelSubscriber): (() => void) => {
    scopeLevelSubscribers.add(listener)
    listener(getScopeLevels())
    return () => scopeLevelSubscribers.delete(listener)
}

const shouldLog = (level: ActiveLogLevel, context: LoggerContext): boolean => {
    const threshold = getScopeLevel(context.scope) ?? currentLevel
    return levelPriority[level] >= levelPriority[threshold]
}

const pad2 = (value: number) => (value < 10 ? `0${value}` : String(value))
const pad3 = (value: number) =>
    value < 10 ? `00${value}` : value < 100 ? `0${value}` : String(value)

const formatTimestamp = (): string => {
    const date = new Date()
    const hour = pad2(date.getHours())
    const minute = pad2(date.getMinutes())
    const second = pad2(date.getSeconds())
    const milli = pad3(date.getMilliseconds())
    return `[${hour}:${minute}:${second}.${milli}]`
}

const formatContext = (context: LoggerContext): { scopeTag: string; rest: string } => {
    const entries = Object.entries(context).filter(
        ([, value]) => value !== undefined && value !== null && value !== ''
    )

    const scopeEntry = entries.find(([key]) => key === 'scope')
    const scopeText = scopeEntry ? String(scopeEntry[1]) : ''
    const scopeTag = scopeText ? `[${scopeText}]` : ''

    const featureEntry = entries.find(([key]) => key === 'feature')
    const featureTag = featureEntry ? `(${String(featureEntry[1])})` : ''

    const rest = entries
        .filter(([key]) => key !== 'scope' && key !== 'feature')
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(' ')

    const remainder = [featureTag, rest].filter(Boolean).join(' ')
    return { scopeTag, rest: remainder }
}

export interface Logger {
    readonly level: () => LogLevel
    readonly setLevel: (level: LogLevel | string) => void
    readonly subscribe: (listener: LogLevelSubscriber) => () => void
    readonly isEnabled: (level: LogLevel) => boolean
    readonly trace: (...args: unknown[]) => void
    readonly debug: (...args: unknown[]) => void
    readonly info: (...args: unknown[]) => void
    readonly warn: (...args: unknown[]) => void
    readonly error: (...args: unknown[]) => void
    readonly withContext: (context: LoggerContext) => Logger
}

export interface LogEntry {
    readonly timestamp: string
    readonly level: ActiveLogLevel
    readonly context: LoggerContext
    readonly argumentsList: unknown[]
}

type LogEntryListener = (entry: LogEntry) => void

const DEFAULT_LOG_HISTORY_LIMIT = 200

const history: LogEntry[] = []
const historyListeners = new Set<LogEntryListener>()

const pushHistory = (entry: LogEntry): void => {
    history.push(entry)
    if (history.length > DEFAULT_LOG_HISTORY_LIMIT) history.shift()
    for (const listener of historyListeners) {
        try {
            listener(entry)
        } catch {
            // Ignore listener errors.
        }
    }
}

export const getHistory = (): ReadonlyArray<LogEntry> => history.slice()

export const clearHistory = (): void => {
    history.length = 0
    clearAllGroupedMessages()
}

export const onEntry = (listener: LogEntryListener): (() => void) => {
    historyListeners.add(listener)
    return () => historyListeners.delete(listener)
}

const formatGroupedMessage = (grouped: GroupedMessage): { consoleArgs: unknown[] } => {
    if (grouped.count > 1) {
        const consoleArgs = [...grouped.argumentsList]
        if (consoleArgs.length > 0 && typeof consoleArgs[consoleArgs.length - 1] === 'string') {
            consoleArgs[consoleArgs.length - 1] =
                `${consoleArgs[consoleArgs.length - 1]} (repeated ${grouped.count} times)`
        } else {
            consoleArgs.push(`(repeated ${grouped.count} times)`)
        }
        return { consoleArgs }
    }
    return { consoleArgs: grouped.argumentsList }
}

setFlushCallback((grouped: GroupedMessage) => {
    if (grouped.count <= 1) return

    const { scopeTag, rest } = formatContext(grouped.context)
    const levelText = grouped.level.toUpperCase()
    const head = [grouped.firstTimestamp, scopeTag, levelText, rest].filter(Boolean).join(' ')

    for (let i = 0; i < grouped.count; i++) {
        pushHistory({
            timestamp: grouped.firstTimestamp,
            level: grouped.level,
            context: { ...grouped.context },
            argumentsList: grouped.argumentsList,
        })
    }

    const { consoleArgs } = formatGroupedMessage(grouped)
    consoleMethod[grouped.level](head, ...consoleArgs)
})

export const createLogger = (baseContext: LoggerContext = {}): Logger => {
    const canLog = (level: LogLevel): boolean => {
        if (level === LogLevel.Silent) return false
        return shouldLog(level as ActiveLogLevel, baseContext)
    }

    const log = (level: ActiveLogLevel, ...args: unknown[]): void => {
        if (!canLog(level)) return

        const timestamp = hideTimestamp ? '' : formatTimestamp()
        const { scopeTag, rest } = formatContext(baseContext)
        const levelText = level.toUpperCase()
        const head = [timestamp, scopeTag, levelText, rest].filter(Boolean).join(' ')

        if (!SPAM_FILTER_ENABLED) {
            pushHistory({
                timestamp,
                level,
                context: { ...baseContext },
                argumentsList: args,
            })
            consoleMethod[level](head, ...args)
            return
        }

        const spamResult = checkSpamDetection(level, baseContext, args, timestamp)

        pushHistory({
            timestamp,
            level,
            context: { ...baseContext },
            argumentsList: args,
        })

        if (spamResult.shouldLog) {
            consoleMethod[level](head, ...args)
        } else if (spamResult.shouldGroup && spamResult.groupedMessage) {
            const grouped = spamResult.groupedMessage
            if (grouped.count === 2) {
                const nowMs = Date.now()
                if (nowMs - lastSpamNoticeAt >= SPAM_NOTICE_COOLDOWN_MS) {
                    lastSpamNoticeAt = nowMs

                    const { scopeTag: s, rest: r } = formatContext(baseContext)
                    const spamHead = [timestamp, s, 'WARN', r].filter(Boolean).join(' ')

                    const timeoutMs = getTimeoutMs(grouped.timeoutIndex)
                    const timeSinceFlush = nowMs - grouped.lastFlushTime
                    const timeUntilFlush = Math.max(0, timeoutMs - timeSinceFlush)
                    const timeUntilFlushSec = (timeUntilFlush / 1000).toFixed(1)
                    const waitTimeSec = (timeoutMs / 1000).toFixed(1)

                    consoleMethod.warn(
                        spamHead,
                        'SPAM',
                        `(next flush in ~${timeUntilFlushSec}s; window ${waitTimeSec}s)`
                    )
                }
            }
        }
    }

    return {
        level: getLogLevel,
        setLevel: setLogLevel,
        subscribe: subscribeToLogLevel,
        isEnabled: (level: LogLevel) => canLog(level),
        trace: (...argumentsList: unknown[]) => log(LogLevel.Trace, ...argumentsList),
        debug: (...argumentsList: unknown[]) => log(LogLevel.Debug, ...argumentsList),
        info: (...argumentsList: unknown[]) => log(LogLevel.Info, ...argumentsList),
        warn: (...argumentsList: unknown[]) => log(LogLevel.Warn, ...argumentsList),
        error: (...argumentsList: unknown[]) => log(LogLevel.Error, ...argumentsList),
        withContext: (context: LoggerContext) => createLogger({ ...baseContext, ...context }),
    }
}

export const logger = createLogger()
