import fileSystem from 'fs'
import path from 'path'

import { LogLevel, LogOutputMode, logOutputMode, type ActiveLogLevel } from './config'

type ConsoleFunction = (...args: unknown[]) => void
type ConsoleMethodName = 'debug' | 'info' | 'warn' | 'error'

const getConsoleObject = (): Record<string, unknown> | undefined => {
    if (typeof globalThis === 'undefined') return undefined
    return (globalThis as unknown as { ['console']?: Record<string, unknown> })['console']
}

const getConsoleMethod = (name: ConsoleMethodName): ConsoleFunction => {
    const consoleObject = getConsoleObject()
    const method = consoleObject?.[name]

    if (typeof method !== 'function') {
        return () => undefined
    }

    return (...args: unknown[]) => {
        Reflect.apply(method as ConsoleFunction, consoleObject, args)
    }
}

export const consoleMethod: Record<ActiveLogLevel, (...args: unknown[]) => void> = {
    [LogLevel.Tick]: getConsoleMethod('debug'),
    [LogLevel.Trace]: getConsoleMethod('debug'),
    [LogLevel.Debug]: getConsoleMethod('debug'),
    [LogLevel.Info]: getConsoleMethod('info'),
    [LogLevel.Warn]: getConsoleMethod('warn'),
    [LogLevel.Error]: getConsoleMethod('error'),
}

export const logFileStream: fileSystem.WriteStream | undefined = (() => {
    if (logOutputMode === LogOutputMode.Console) {
        return undefined
    }

    const logDirectory = path.resolve(process.cwd(), 'logs')
    fileSystem.mkdirSync(logDirectory, { recursive: true })

    const logDateStamp = new Date().toISOString().split('T')[0]
    const logFilePath = path.join(logDirectory, `server-${logDateStamp}.log`)
    return fileSystem.createWriteStream(logFilePath, { flags: 'a' })
})()
