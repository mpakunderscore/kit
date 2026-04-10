import { createContext, type ReactNode, use, useEffect, useMemo, useState } from 'react'

import type { BrowserDataKey } from '@src/main/content/browser/browserDataKeys'
import {
    type BrowserDataValues,
    collectBrowserDataValues,
} from '@src/main/content/browser/browserDataValues'
import { PROJECT_INFO_KEYS, type ProjectDataKey } from '@src/main/content/project/projectDataKeys'
import {
    APP_SECTIONS,
    type AppSection,
    type MenuSection,
    type SectionField,
} from '@src/main/content/sections'
import {
    requestNetworkMetrics,
    requestProjectInfo,
    requestUser,
    type NetworkMetricsResponse,
    type ProjectLibraryResponse,
    type ProjectInfoResponse,
    type UserResponse,
} from '@src/main/network/httpApi'
import { formatUiTime24h } from '@src/main/utils/formatUiTime24h'

const NETWORK_NOT_AVAILABLE_VALUE = 'Not available'
const PROJECT_NOT_AVAILABLE_VALUE = 'Not available'

type NetworkFieldKey =
    | 'location.hostname'
    | 'navigator.connection.rtt'
    | 'navigator.connection.downlink'

type NetworkSectionValues = Readonly<Record<NetworkFieldKey, string>>
type ProjectSectionValues = Readonly<Record<ProjectDataKey, string>>

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

const PROJECT_FALLBACK_VALUES: ProjectSectionValues = {
    'package.name': PROJECT_NOT_AVAILABLE_VALUE,
    'package.version': PROJECT_NOT_AVAILABLE_VALUE,
    'package.description': PROJECT_NOT_AVAILABLE_VALUE,
    'package.author': PROJECT_NOT_AVAILABLE_VALUE,
    'package.license': PROJECT_NOT_AVAILABLE_VALUE,
    'package.engines.node': PROJECT_NOT_AVAILABLE_VALUE,
    'package.scripts.count': PROJECT_NOT_AVAILABLE_VALUE,
    'package.dependencies.count': PROJECT_NOT_AVAILABLE_VALUE,
    'package.devDependencies.count': PROJECT_NOT_AVAILABLE_VALUE,
}

const PROJECT_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS: readonly SectionField[] = [
    {
        id: 'project_dependencies_libraries_not_available',
        label: 'Dependencies',
        value: PROJECT_NOT_AVAILABLE_VALUE,
    },
]

const PROJECT_DEV_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS: readonly SectionField[] = [
    {
        id: 'project_dev_dependencies_libraries_not_available',
        label: 'Dev Dependencies',
        value: PROJECT_NOT_AVAILABLE_VALUE,
    },
]

const isNetworkFieldKey = (value: string): value is NetworkFieldKey => {
    return NETWORK_FIELD_KEYS.some((networkFieldKey) => networkFieldKey === value)
}

const isProjectFieldKey = (value: string): value is ProjectDataKey => {
    return PROJECT_INFO_KEYS.some((projectDataKey) => projectDataKey.key === value)
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

const buildProjectSectionValues = (projectInfo: ProjectInfoResponse): ProjectSectionValues => {
    return {
        'package.name': projectInfo.name,
        'package.version': projectInfo.version,
        'package.description': projectInfo.description,
        'package.author': projectInfo.author,
        'package.license': projectInfo.license,
        'package.engines.node': projectInfo.nodeVersion,
        'package.scripts.count': String(projectInfo.scriptsCount),
        'package.dependencies.count': String(projectInfo.dependenciesCount),
        'package.devDependencies.count': String(projectInfo.devDependenciesCount),
    }
}

const buildProjectLibraryFields = (
    libraries: readonly ProjectLibraryResponse[],
    fallbackFields: readonly SectionField[]
): readonly SectionField[] => {
    if (libraries.length === 0) return fallbackFields

    return libraries.map((library, index) => ({
        id: `project_library_${index + 1}`,
        label: library.name,
        value: library.version,
    }))
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
                            {
                                id: 'created_at',
                                label: 'createdAt',
                                value: formatUiTime24h(user.createdAt),
                            },
                            {
                                id: 'updated_at',
                                label: 'updatedAt',
                                value: formatUiTime24h(user.updatedAt),
                            },
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

const applyProjectDataToSections = (
    appSections: readonly AppSection[],
    projectDataValues: ProjectSectionValues,
    projectDependenciesLibraryFields: readonly SectionField[],
    projectDevDependenciesLibraryFields: readonly SectionField[]
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== 'project_section') return section

        return {
            ...section,
            blocks: section.blocks.map((block) => {
                if (block.id === 'project_dependencies_library_versions') {
                    return {
                        ...block,
                        fields: projectDependenciesLibraryFields,
                    }
                }

                if (block.id === 'project_dev_dependencies_library_versions') {
                    return {
                        ...block,
                        fields: projectDevDependenciesLibraryFields,
                    }
                }

                return {
                    ...block,
                    fields: block.fields.map((field) => {
                        if (
                            field.keyTooltip === undefined ||
                            !isProjectFieldKey(field.keyTooltip)
                        ) {
                            return field
                        }

                        return {
                            ...field,
                            value: projectDataValues[field.keyTooltip],
                        }
                    }),
                }
            }),
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

        const loadProject = async () => {
            try {
                const projectInfo = await requestProjectInfo()
                if (isDisposed) return

                setAppSections((currentAppSections) =>
                    applyProjectDataToSections(
                        currentAppSections,
                        buildProjectSectionValues(projectInfo),
                        buildProjectLibraryFields(
                            projectInfo.dependenciesLibraries,
                            PROJECT_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS
                        ),
                        buildProjectLibraryFields(
                            projectInfo.devDependenciesLibraries,
                            PROJECT_DEV_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS
                        )
                    )
                )
            } catch {
                if (isDisposed) return

                setAppSections((currentAppSections) =>
                    applyProjectDataToSections(
                        currentAppSections,
                        PROJECT_FALLBACK_VALUES,
                        PROJECT_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS,
                        PROJECT_DEV_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS
                    )
                )
            }
        }

        void loadBrowserData()
        void loadUser()
        void loadNetwork()
        void loadProject()

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
