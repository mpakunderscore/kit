import { describe, expect, it } from 'vitest'

import { formatUiTime24h } from '@src/main/utils/formatUiTime24h'

describe('formatUiTime24h', () => {
    it('returns the original string when the value is not a valid date', () => {
        expect(formatUiTime24h('not-a-date')).toBe('not-a-date')
        expect(formatUiTime24h('')).toBe('')
    })

    it('formats a valid ISO timestamp using the 24h UI formatter', () => {
        const formatted = formatUiTime24h('2024-06-15T14:30:00.000Z')
        expect(formatted).toMatch(/2024/)
        expect(formatted).toMatch(/06\.2024/)
        expect(/\d{2}:\d{2}:\d{2}/.test(formatted)).toBe(true)
    })
})
