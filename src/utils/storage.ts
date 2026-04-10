/**
 * Centralized storage keys and a guarded localStorage wrapper for client code.
 * The wrapper avoids throwing when storage is unavailable (SSR, private mode, etc.).
 */
export const StorageKey = {
    LogLevel: 'LOG_LEVEL',
    LogScopeLevels: 'LOG_SCOPE_LEVELS',
    LogHideTime: 'LOG_HIDE_TIME',
} as const

export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey]

export const getLocalStorage = (): Storage | null => {
    if (typeof window === 'undefined' || !('localStorage' in window)) return null
    try {
        return window.localStorage
    } catch {
        return null
    }
}

export const isStorageAvailable = (): boolean => getLocalStorage() != null

export const storage = {
    getItem(key: StorageKey): string | null {
        const store = getLocalStorage()
        if (!store) return null
        try {
            return store.getItem(key)
        } catch {
            return null
        }
    },
    setItem(key: StorageKey, value: string): void {
        const store = getLocalStorage()
        if (!store) return
        try {
            store.setItem(key, value)
        } catch {
            // Ignore persistence errors (quota/private mode).
        }
    },
    removeItem(key: StorageKey): void {
        const store = getLocalStorage()
        if (!store) return
        try {
            store.removeItem(key)
        } catch {
            // Ignore persistence errors.
        }
    },
}
