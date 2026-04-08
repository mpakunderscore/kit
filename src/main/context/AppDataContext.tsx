import { createContext, type ReactNode, use, useEffect, useMemo, useState } from 'react'

import type { BrowserDataKey } from '@src/main/content/browserDataKeys'
import {
    type BrowserDataValues,
    collectBrowserDataValues,
} from '@src/main/content/browserDataValues'
import { APP_SECTIONS, type AppSection, type MenuSection } from '@src/main/content/sections'
import {
    requestNetworkMetrics,
    requestUser,
    type NetworkMetricsResponse,
    type UserResponse,
} from '@src/main/network/httpApi'

const NETWORK_NOT_AVAILABLE_VALUE = 'Not available'

type NetworkFieldKey =
    | 'location.hostname'
    | 'navigator.connection.rtt'
    | 'navigator.connection.downlink'

type NetworkSectionValues = Readonly<Record<NetworkFieldKey, string>>

const NETWORK_FIELD_KEYS: readonly NetworkFieldKey[] = [
    'location.hostname',
    'navigator.connection.rtt',
    'navigator.connection.downlink',
]

const NETWORK_FALLBACK_VALUES: NetworkSectionValues = {
    'location.hostname': NETWORK_NOT_AVAILABLE_VALUE,
    'navigator.connection.rtt': NETWORK_NOT_AVAILABLE_VALUE,
    'navigator.connection.downlink': NETWORK_NOT_AVAILABLE_VALUE,
}

const isNetworkFieldKey = (value: string): value is NetworkFieldKey => {
    return NETWORK_FIELD_KEYS.some((networkFieldKey) => networkFieldKey === value)
}

const buildNetworkSectionValues = (
    networkMetrics: NetworkMetricsResponse
): NetworkSectionValues => {
    return {
        'location.hostname': networkMetrics.ip,
        'navigator.connection.rtt': `${networkMetrics.pingMs} ms`,
        'navigator.connection.downlink': `${networkMetrics.downlinkMbps} Mbps`,
    }
}

const applyUserToSections = (
    appSections: readonly AppSection[],
    user: UserResponse
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== 'user_section') return section

        return {
            ...section,
            blocks: section.blocks.map((block) => {
                if (block.id === 'user_identity') {
                    return {
                        ...block,
                        fields: [
                            { id: 'uuid', label: 'UUID', value: user.uuid },
                            { id: 'created_at', label: 'createdAt', value: user.createdAt },
                            { id: 'updated_at', label: 'updatedAt', value: user.updatedAt },
                        ],
                    }
                }

                if (block.id === 'user_profile') {
                    return {
                        ...block,
                        description: '',
                        fields: [],
                    }
                }

                return block
            }),
        }
    })
}

const applyBrowserDataToSections = (
    appSections: readonly AppSection[],
    browserDataValues: BrowserDataValues
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== 'browser_section') return section

        return {
            ...section,
            blocks: section.blocks.map((block) => ({
                ...block,
                fields: block.fields.map((field) => {
                    if (field.keyTooltip === undefined) return field
                    const browserKey = field.keyTooltip as BrowserDataKey

                    return {
                        ...field,
                        value: browserDataValues[browserKey],
                    }
                }),
            })),
        }
    })
}

const applyNetworkDataToSections = (
    appSections: readonly AppSection[],
    networkDataValues: NetworkSectionValues
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== 'network_section') return section

        return {
            ...section,
            blocks: section.blocks.map((block) => ({
                ...block,
                fields: block.fields.map((field) => {
                    if (field.keyTooltip === undefined || !isNetworkFieldKey(field.keyTooltip)) {
                        return field
                    }

                    return {
                        ...field,
                        value: networkDataValues[field.keyTooltip],
                    }
                }),
            })),
        }
    })
}

type AppDataContextValue = {
    readonly appSections: readonly AppSection[]
    readonly menuSections: readonly MenuSection[]
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

type AppDataProviderProps = {
    readonly children: ReactNode
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
    const [appSections, setAppSections] = useState<readonly AppSection[]>(APP_SECTIONS)

    useEffect(() => {
        let isDisposed = false

        const loadBrowserData = async () => {
            const browserDataValues = await collectBrowserDataValues()
            if (isDisposed) return

            setAppSections((currentAppSections) =>
                applyBrowserDataToSections(currentAppSections, browserDataValues)
            )
        }

        const loadUser = async () => {
            try {
                const user = await requestUser()
                if (isDisposed) return

                setAppSections((currentAppSections) =>
                    applyUserToSections(currentAppSections, user)
                )
            } catch {
                // Keep section blocks empty when /api/user is unavailable.
            }
        }

        const loadNetwork = async () => {
            try {
                const networkMetrics = await requestNetworkMetrics()
                if (isDisposed) return

                setAppSections((currentAppSections) =>
                    applyNetworkDataToSections(
                        currentAppSections,
                        buildNetworkSectionValues(networkMetrics)
                    )
                )
            } catch {
                if (isDisposed) return

                setAppSections((currentAppSections) =>
                    applyNetworkDataToSections(currentAppSections, NETWORK_FALLBACK_VALUES)
                )
            }
        }

        void loadBrowserData()
        void loadUser()
        void loadNetwork()

        return () => {
            isDisposed = true
        }
    }, [])

    const menuSections = useMemo<readonly MenuSection[]>(() => {
        return appSections.map(({ id, label }) => ({ id, label }))
    }, [appSections])

    return (
        <AppDataContext
            value={{
                appSections,
                menuSections,
            }}
        >
            {children}
        </AppDataContext>
    )
}

export const useAppDataContext = (): AppDataContextValue => {
    const context = use(AppDataContext)
    if (context === null) {
        throw new Error('useAppDataContext must be used inside AppDataProvider')
    }
    return context
}
