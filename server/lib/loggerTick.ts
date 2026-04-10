import type fileSystem from 'fs'

// Tick Aggregation Config
export const LOG_AGGREGATE_TICKS =
    (process.env.LOG_AGGREGATE_TICKS ?? 'true').toLowerCase() !== 'false'
export const LOG_AGGREGATE_INTERVAL_SECONDS =
    Number(process.env.LOG_AGGREGATE_INTERVAL_SECONDS) || 10

type TickAggregationAccumulator = {
    count: number
    numericFields: Record<string, { sum: number; count: number }>
    messageTypes: Set<string>
}

// Map of scope -> accumulator for per-scope aggregation
const tickAggregationAccumulators = new Map<string, TickAggregationAccumulator>()

const getOrCreateAccumulator = (scope: string): TickAggregationAccumulator => {
    let accumulator = tickAggregationAccumulators.get(scope)
    if (!accumulator) {
        accumulator = {
            count: 0,
            numericFields: {},
            messageTypes: new Set(),
        }
        tickAggregationAccumulators.set(scope, accumulator)
    }
    return accumulator
}

/**
 * Checks if a message is tick-related based on scope or message text.
 */
export const isTickMessage = (
    scope: string | undefined,
    messageText: string | undefined
): boolean => {
    const scopeLower = scope?.toLowerCase() ?? ''
    const messageLower = messageText?.toLowerCase() ?? ''
    return (
        scopeLower.includes('tick') ||
        messageLower.includes('tick') ||
        messageLower.includes('snapshot')
    )
}

/**
 * Extracts numeric fields from log arguments (context objects).
 */
export const extractNumericFields = (args: unknown[]): Record<string, number> => {
    const numericFields: Record<string, number> = {}
    for (const arg of args) {
        if (
            typeof arg === 'object' &&
            arg !== null &&
            !Array.isArray(arg) &&
            !(arg instanceof Error)
        ) {
            const obj = arg as Record<string, unknown>
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
                    numericFields[key] = value
                }
            }
        }
    }
    return numericFields
}

/**
 * Accumulates tick message data into the aggregation buffer for a specific scope.
 */
export const accumulateTickMessage = (
    scope: string | undefined,
    messageText: string | undefined,
    numericFields: Record<string, number>
): void => {
    const scopeKey = scope || 'unknown'
    const accumulator = getOrCreateAccumulator(scopeKey)

    accumulator.count++
    if (messageText) {
        accumulator.messageTypes.add(messageText)
    }
    for (const [key, value] of Object.entries(numericFields)) {
        if (!accumulator.numericFields[key]) {
            accumulator.numericFields[key] = { sum: 0, count: 0 }
        }
        accumulator.numericFields[key].sum += value
        accumulator.numericFields[key].count++
    }
}

/**
 * Calculates averages for all accumulated numeric fields for a specific scope.
 */
const calculateAggregationSummary = (
    accumulator: TickAggregationAccumulator
): {
    count: number
    averages: Record<string, number>
    messageTypes: string[]
} => {
    const averages: Record<string, number> = {}
    for (const [key, { sum, count }] of Object.entries(accumulator.numericFields)) {
        if (count > 0) {
            averages[key] = sum / count
        }
    }
    return {
        count: accumulator.count,
        averages,
        messageTypes: Array.from(accumulator.messageTypes),
    }
}

/**
 * Resets the aggregation accumulator for a specific scope.
 */
const resetAggregationAccumulator = (scope: string): void => {
    const accumulator = tickAggregationAccumulators.get(scope)
    if (accumulator) {
        accumulator.count = 0
        accumulator.numericFields = {}
        accumulator.messageTypes.clear()
    }
}

export type LogOutputFormatter = {
    formatTimestamp: () => string
    stripAnsi: (value: string) => string
    c: { blue: (s: string) => string; dim: (s: string) => string }
    levelColor: { info: (s: string) => string }
    consoleMethod: { info: (...args: unknown[]) => void }
    logOutputMode: 'console' | 'file' | 'both'
    logFileStream: fileSystem.WriteStream | undefined
}

/**
 * Prints the aggregated tick message summary for a specific scope.
 */
const printScopeAggregationSummary = (
    scope: string,
    accumulator: TickAggregationAccumulator,
    formatter: LogOutputFormatter
): void => {
    if (accumulator.count === 0) return

    const summary = calculateAggregationSummary(accumulator)
    const ts = formatter.formatTimestamp()
    const scopeTag = formatter.c.blue(`[${scope}]`)
    const lvl = formatter.levelColor.info('INFO')

    const averagesStr = Object.entries(summary.averages)
        .map(
            ([key, value]) => `avg${key.charAt(0).toUpperCase() + key.slice(1)}=${value.toFixed(4)}`
        )
        .join(' ')

    const messageTypesStr =
        summary.messageTypes.length > 0 ? `messages=[${summary.messageTypes.join(', ')}]` : ''

    const summaryParts = [`count=${summary.count}`, averagesStr, messageTypesStr]
        .filter(Boolean)
        .join(' ')

    const headParts = [ts, scopeTag, lvl].filter(Boolean).join(' ')
    const message = `Tick aggregation: ${summaryParts}`

    if (formatter.logOutputMode === 'console' || formatter.logOutputMode === 'both') {
        formatter.consoleMethod.info(headParts, message)
    }

    if (
        (formatter.logOutputMode === 'file' || formatter.logOutputMode === 'both') &&
        formatter.logFileStream
    ) {
        const logLine = [formatter.stripAnsi(headParts), message]
            .filter((segment) => segment.length > 0)
            .join(' ')
        formatter.logFileStream.write(`${logLine}\n`)
    }

    resetAggregationAccumulator(scope)
}

/**
 * Prints aggregated tick message summaries for all scopes.
 */
export const printAggregationSummary = (formatter: LogOutputFormatter): void => {
    for (const [scope, accumulator] of tickAggregationAccumulators.entries()) {
        printScopeAggregationSummary(scope, accumulator, formatter)
    }
}

/**
 * Starts the tick aggregation interval timer.
 */
export const startTickAggregation = (printSummary: () => void): NodeJS.Timeout | undefined => {
    if (!LOG_AGGREGATE_TICKS) return undefined
    return setInterval(() => {
        printSummary()
    }, LOG_AGGREGATE_INTERVAL_SECONDS * 1000)
}
