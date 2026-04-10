import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { ProjectLibraryPayload, ProjectPayload } from '../../../src/shared/contracts/api'

type PackageJson = Readonly<Record<string, unknown>>

const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json')
const NOT_AVAILABLE_VALUE = 'Not available'

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const resolveStringValue = (value: unknown): string => {
    if (typeof value !== 'string') return NOT_AVAILABLE_VALUE
    const normalizedValue = value.trim()
    return normalizedValue === '' ? NOT_AVAILABLE_VALUE : normalizedValue
}

const resolveAuthorValue = (value: unknown): string => {
    if (typeof value === 'string') return resolveStringValue(value)
    if (!isRecord(value)) return NOT_AVAILABLE_VALUE
    return resolveStringValue(value.name)
}

const resolveObjectSize = (value: unknown): number => {
    if (!isRecord(value)) return 0
    return Object.keys(value).length
}

const resolvePackageLibraries = (source: unknown): readonly ProjectLibraryPayload[] => {
    const librariesByName = new Map<string, string>()

    if (!isRecord(source)) return []

    for (const [name, version] of Object.entries(source)) {
        if (typeof version !== 'string') continue

        const normalizedName = name.trim()
        const normalizedVersion = version.trim()
        if (normalizedName === '' || normalizedVersion === '') continue
        if (librariesByName.has(normalizedName)) continue

        librariesByName.set(normalizedName, normalizedVersion)
    }

    return [...librariesByName.entries()]
        .sort(([leftName], [rightName]) => leftName.localeCompare(rightName))
        .map(([name, version]) => ({ name, version }))
}

const readPackageJson = async (): Promise<PackageJson> => {
    const rawContent = await readFile(PACKAGE_JSON_PATH, 'utf8')
    const parsedContent: unknown = JSON.parse(rawContent)
    if (!isRecord(parsedContent)) {
        throw new Error('Invalid package.json payload')
    }
    return parsedContent
}

export const resolveProjectPayload = async (): Promise<ProjectPayload> => {
    const packageJson = await readPackageJson()

    return {
        name: resolveStringValue(packageJson.name),
        version: resolveStringValue(packageJson.version),
        description: resolveStringValue(packageJson.description),
        author: resolveAuthorValue(packageJson.author),
        license: resolveStringValue(packageJson.license),
        nodeVersion: isRecord(packageJson.engines)
            ? resolveStringValue(packageJson.engines.node)
            : NOT_AVAILABLE_VALUE,
        scriptsCount: resolveObjectSize(packageJson.scripts),
        dependenciesCount: resolveObjectSize(packageJson.dependencies),
        devDependenciesCount: resolveObjectSize(packageJson.devDependencies),
        dependenciesLibraries: resolvePackageLibraries(packageJson.dependencies),
        devDependenciesLibraries: resolvePackageLibraries(packageJson.devDependencies),
    }
}
