import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

type CoreBuildMetadata = Readonly<{
    VERSION: string
    GIT: string
    BRANCH: string
    BUILD_TIME: string
}>

type ClientBuildMetadata = Readonly<
    CoreBuildMetadata & {
        NODE_ENV: string
        PORT: string
    }
>

const getGitValue = (projectRoot: string, command: string, fallback: string): string => {
    try {
        const output = execSync(command, {
            cwd: projectRoot,
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString()
            .trim()
        return output.length > 0 ? output : fallback
    } catch {
        return fallback
    }
}

const readPackageVersion = (projectRoot: string): string => {
    const packageJsonPath = path.resolve(projectRoot, 'package.json')
    try {
        const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version?: string }
        return parsed.version?.trim() || 'unknown'
    } catch {
        return 'unknown'
    }
}

const formatBuildTime24h = (date: Date): string => {
    const pad2 = (value: number): string => value.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

export const createCoreBuildMetadata = (projectRoot: string): CoreBuildMetadata => {
    return {
        VERSION: JSON.stringify(readPackageVersion(projectRoot)),
        GIT: JSON.stringify(getGitValue(projectRoot, 'git rev-parse --short HEAD', 'unknown')),
        BRANCH: JSON.stringify(getGitValue(projectRoot, 'git rev-parse --abbrev-ref HEAD', 'unknown')),
        BUILD_TIME: JSON.stringify(formatBuildTime24h(new Date())),
    }
}

export const createClientBuildMetadata = (
    projectRoot: string,
    env: Readonly<Record<string, string | undefined>>
): ClientBuildMetadata => {
    return {
        ...createCoreBuildMetadata(projectRoot),
        NODE_ENV: JSON.stringify(env.NODE_ENV ?? process.env.NODE_ENV ?? 'development'),
        PORT: JSON.stringify(env.PORT ?? process.env.PORT ?? '4000'),
    }
}
