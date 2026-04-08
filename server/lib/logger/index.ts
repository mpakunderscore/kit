
import {
    LogLevel,
    LogOutputMode,
    getLogLevel,
    logOutputMode,
    setLogLevel,
    shouldLog,
    type ActiveLogLevel,
    type LoggerContext,
    type LoggerContextValue,
} from '@server/lib/logger/config'
import {
    c,
    formatContext,
    formatLogArgument,
    formatTimestamp,
    levelColor,
    sanitizeErrorsInObject,
    stripAnsi,
} from '@server/lib/logger/format'
import { consoleMethod, logFileStream } from '@server/lib/logger/sinks'
import {
    accumulateTickMessage,
    extractNumericFields,
    isTickMessage,
    printAggregationSummary,
    startTickAggregation,
    type LogOutputFormatter,
} from '@server/lib/loggerTick'

export type { LoggerContext, LoggerContextValue }
export { LogLevel }

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

const resolveMessageText = (args: unknown[]): string | undefined => {
    for (const arg of args) {
        if (typeof arg === 'string') {
            return arg
        }

        if (
            typeof arg === 'object' &&
            arg !== null &&
            !Array.isArray(arg) &&
            !(arg instanceof Error)
        ) {
            const objectArg = arg as Record<string, unknown>
            if (typeof objectArg.message === 'string') {
                return objectArg.message
            }
        }
    }

    return undefined
}

export const createLogger = (baseContext: LoggerContext = {}): Logger => {
    const log = (level: ActiveLogLevel, ...args: unknown[]): void => {
        if (!shouldLog(level)) return

        const timestamp = formatTimestamp()
        const { scopeTag, rest } = formatContext(baseContext)
        const levelText = levelColor[level](level.toUpperCase())
        const headParts = [timestamp, scopeTag, levelText, rest].filter(Boolean).join(' ')
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
        const messageText = resolveMessageText(args)

        if (isTickMessage(scope, messageText)) {
            const numericFields = extractNumericFields(args)
            accumulateTickMessage(scope, messageText, numericFields)
            return
        }

        log(LogLevel.Trace, ...args)
    }

    return {
        level: getLogLevel,
        setLevel: setLogLevel,
        tick,
        trace: (...args: unknown[]) => log(LogLevel.Trace, ...args),
        debug: (...args: unknown[]) => log(LogLevel.Debug, ...args),
        info: (...args: unknown[]) => log(LogLevel.Info, ...args),
        warn: (...args: unknown[]) => log(LogLevel.Warn, ...args),
        error: (...args: unknown[]) => log(LogLevel.Error, ...args),
        withContext: (context: LoggerContext) => createLogger({ ...baseContext, ...context }),
    }
}

export const logger = createLogger()
