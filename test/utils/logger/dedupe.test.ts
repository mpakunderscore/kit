import { describe, expect, it } from 'vitest'

import { LogLevel } from '@src/utils/logger'
import { createMessageKey, getTimeoutMs } from '@src/utils/logger/dedupe'

describe('getTimeoutMs', () => {
    it('doubles the base interval with the timeout index', () => {
        expect(getTimeoutMs(0)).toBe(10000)
        expect(getTimeoutMs(1)).toBe(20000)
        expect(getTimeoutMs(2)).toBe(40000)
    })
})

describe('createMessageKey', () => {
    it('is stable for the same level, context, and arguments', () => {
        const first = createMessageKey(LogLevel.Info, { scope: 'app' }, ['hello', 42])
        const second = createMessageKey(LogLevel.Info, { scope: 'app' }, ['hello', 42])
        expect(first).toBe(second)
    })

    it('changes when the log level changes', () => {
        const infoKey = createMessageKey(LogLevel.Info, { scope: 'x' }, ['m'])
        const warnKey = createMessageKey(LogLevel.Warn, { scope: 'x' }, ['m'])
        expect(infoKey).not.toBe(warnKey)
    })
})
