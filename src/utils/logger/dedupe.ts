/**
 * Spam detection utilities for the logger.
 *
 * Groups repeated identical log messages and logs them once with a count.
 * Uses progressive timeouts that double: 10s → 20s → 40s → 80s → ... for messages that keep repeating.
 */

import type { ActiveLogLevel, LoggerContext, LoggerContextValue } from '@src/utils/logger'

// Spam detection configuration - base timeout that doubles each time
const BASE_TIMEOUT_MS = 10000 // Start with 10 seconds

export interface GroupedMessage {
    count: number
    firstTimestamp: string
    lastSeenTimestamp: number // When we last saw this message (for periodic flushing)
    level: ActiveLogLevel
    context: LoggerContext
    argumentsList: unknown[]
    timeoutId: ReturnType<typeof setTimeout> | null
    timeoutIndex: number // How many times we've doubled (0 = 10s, 1 = 20s, 2 = 40s, 3 = 80s, ...)
    lastFlushTime: number // When we last flushed this message
}

export interface SpamDetectionResult {
    shouldLog: boolean
    shouldGroup: boolean
    groupedMessage?: GroupedMessage
}

type FlushCallback = (grouped: GroupedMessage) => void

const groupedMessages = new Map<string, GroupedMessage>()

// Calculate timeout based on index (doubles each time)
export const getTimeoutMs = (timeoutIndex: number): number => {
    return BASE_TIMEOUT_MS * Math.pow(2, timeoutIndex)
}

// Normalize values so similar startup logs (with varying numbers) can be grouped.
const normalizeForGrouping = (value: unknown): unknown => {
    if (value === null || value === undefined) return String(value)
    if (typeof value === 'number') return '#'
    if (typeof value === 'bigint') return '#'
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.map(normalizeForGrouping)
        }
        const sortedKeys = Object.keys(value as Record<string, unknown>).sort()
        return sortedKeys.reduce(
            (acc, key) => {
                acc[key] = normalizeForGrouping((value as Record<string, unknown>)[key])
                return acc
            },
            {} as Record<string, unknown>
        )
    }
    return value
}

// Serialize arguments in a consistent way for comparison
const serializeArgs = (args: unknown[]): string => {
    return JSON.stringify(args.map((arg) => normalizeForGrouping(arg)))
}

// Create a unique key for a log message to detect duplicates
export const createMessageKey = (
    level: ActiveLogLevel,
    context: LoggerContext,
    args: unknown[]
): string => {
    // Serialize context in a consistent way (sorted keys)
    const contextKey = JSON.stringify(
        Object.keys(context)
            .sort()
            .reduce(
                (acc, key) => {
                    acc[key] = normalizeForGrouping(context[key]) as LoggerContextValue
                    return acc
                },
                {} as Record<string, LoggerContextValue>
            )
    )
    // Serialize arguments in a consistent way
    const argsKey = serializeArgs(args)
    return `${level}:${contextKey}:${argsKey}`
}

// Check if a message should be grouped and return the result
export const checkSpamDetection = (
    level: ActiveLogLevel,
    context: LoggerContext,
    args: unknown[],
    timestamp: string
): SpamDetectionResult => {
    const messageKey = createMessageKey(level, context, args)
    const existing = groupedMessages.get(messageKey)

    if (existing) {
        // Same message detected - increment count
        existing.count++
        existing.lastSeenTimestamp = Date.now()

        // Update firstTimestamp if this is the first occurrence after a flush (count was 0, now 1)
        if (existing.count === 1) {
            existing.firstTimestamp = timestamp
        }

        // Check if we should flush periodically (don't reset timeout, let it fire)
        // The timeout will fire after the period and log with count, then start a new period
        if (existing.timeoutId === null) {
            // Timeout was already fired, start a new one with increased period
            const timeoutMs = getTimeoutMs(existing.timeoutIndex)
            existing.timeoutId = setTimeout(() => {
                const current = groupedMessages.get(messageKey)
                if (current) {
                    // Before flushing, increase timeout for next time (double it)
                    current.timeoutIndex++
                    current.lastFlushTime = Date.now()
                    flushGroupedMessage(messageKey, current)
                    // Reset timeoutId so we can start a new period
                    current.timeoutId = null
                }
            }, timeoutMs)
        }

        return {
            shouldLog: false, // Don't log - wait for timeout to flush with count
            shouldGroup: true,
            groupedMessage: existing,
        }
    }

    // Start grouping this new message with first timeout (10s)
    const now = Date.now()
    const grouped: GroupedMessage = {
        count: 1,
        firstTimestamp: timestamp,
        lastSeenTimestamp: now,
        level,
        context: { ...context },
        argumentsList: args,
        timeoutIndex: 0, // Start with first timeout (10s)
        lastFlushTime: now,
        timeoutId: setTimeout(() => {
            const current = groupedMessages.get(messageKey)
            if (current) {
                // Before flushing, increase timeout for next time (double it)
                current.timeoutIndex++
                current.lastFlushTime = Date.now()
                flushGroupedMessage(messageKey, current)
                // Reset timeoutId so we can start a new period
                current.timeoutId = null
            }
        }, getTimeoutMs(0)),
    }

    groupedMessages.set(messageKey, grouped)

    return {
        shouldLog: true, // Log immediately for the first occurrence
        shouldGroup: true,
        groupedMessage: grouped,
    }
}

// Flush a grouped message (called by timeout)
let flushCallback: FlushCallback | null = null

export const setFlushCallback = (callback: FlushCallback): void => {
    flushCallback = callback
}

const flushGroupedMessage = (key: string, grouped: GroupedMessage): void => {
    // Only flush if count > 0 (don't flush empty groups)
    if (grouped.count > 0 && flushCallback) {
        flushCallback(grouped)
    }
    // Don't delete the message - keep it in the map so we can continue with progressive timeouts
    // Reset count to 0 and update timestamp for the next period
    grouped.count = 0
}

// Flush all pending grouped messages
export const flushAllGroupedMessages = (): void => {
    for (const key of groupedMessages.keys()) {
        const grouped = groupedMessages.get(key)
        if (grouped && grouped.timeoutId !== null) {
            clearTimeout(grouped.timeoutId)
        }
        if (grouped && grouped.count > 1) {
            flushGroupedMessage(key, grouped)
        } else if (grouped && grouped.count === 1) {
            groupedMessages.delete(key)
        }
    }
}

// Clear all grouped messages (e.g., when history is cleared)
export const clearAllGroupedMessages = (): void => {
    for (const key of groupedMessages.keys()) {
        const grouped = groupedMessages.get(key)
        if (grouped && grouped.timeoutId !== null) {
            clearTimeout(grouped.timeoutId)
        }
    }
    groupedMessages.clear()
}
