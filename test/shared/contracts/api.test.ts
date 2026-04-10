import { describe, expect, it } from 'vitest'

import {
    ApiEndpoint,
    isNetworkIpPayload,
    isProjectLibraryPayload,
    isProjectPayload,
    isUserPayload,
    resolveApiEndpoint,
} from '@src/shared/contracts/api'

describe('resolveApiEndpoint', () => {
    it('prefixes the API base path', () => {
        expect(resolveApiEndpoint(ApiEndpoint.User)).toBe('/api/user')
    })
})

describe('isUserPayload', () => {
    it('accepts a valid payload', () => {
        const payload = {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
        }
        expect(isUserPayload(payload)).toBe(true)
    })

    it('rejects non-objects and wrong field types', () => {
        expect(isUserPayload(null)).toBe(false)
        expect(isUserPayload(undefined)).toBe(false)
        expect(isUserPayload('x')).toBe(false)
        expect(isUserPayload({ uuid: 1, createdAt: '', updatedAt: '' })).toBe(false)
        expect(isUserPayload({ uuid: '', createdAt: '', updatedAt: '' })).toBe(true)
    })
})

describe('isNetworkIpPayload', () => {
    it('accepts ip and timestamp strings', () => {
        expect(isNetworkIpPayload({ ip: '127.0.0.1', timestamp: '2024-01-01T00:00:00.000Z' })).toBe(
            true
        )
    })

    it('rejects missing or invalid fields', () => {
        expect(isNetworkIpPayload({ ip: '127.0.0.1' })).toBe(false)
        expect(isNetworkIpPayload({ ip: 1, timestamp: '' })).toBe(false)
    })
})

describe('isProjectLibraryPayload', () => {
    it('accepts name and version', () => {
        expect(isProjectLibraryPayload({ name: 'react', version: '19.0.0' })).toBe(true)
    })

    it('rejects incomplete records', () => {
        expect(isProjectLibraryPayload({ name: 'react' })).toBe(false)
    })
})

describe('isProjectPayload', () => {
    const library = { name: 'react', version: '19.0.0' }

    const valid = {
        name: 'kit',
        version: '1.0.0',
        description: 'desc',
        author: 'a',
        license: 'ISC',
        nodeVersion: '22.0.0',
        scriptsCount: 1,
        dependenciesCount: 2,
        devDependenciesCount: 3,
        dependenciesLibraries: [library],
        devDependenciesLibraries: [library],
    }

    it('accepts a complete payload', () => {
        expect(isProjectPayload(valid)).toBe(true)
    })

    it('rejects when nested libraries are invalid', () => {
        expect(
            isProjectPayload({
                ...valid,
                dependenciesLibraries: [{ name: 'x', version: 1 }],
            })
        ).toBe(false)
    })

    it('rejects when counts are not numbers', () => {
        expect(isProjectPayload({ ...valid, scriptsCount: '1' })).toBe(false)
    })
})
