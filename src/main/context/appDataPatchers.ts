import type { BrowserDataKey } from '@src/main/content/browser/browserDataKeys'
import type { BrowserDataValues } from '@src/main/content/browser/browserDataValues'
import { PROJECT_INFO_KEYS, type ProjectDataKey } from '@src/main/content/project/projectDataKeys'
import { BlockId, SectionId } from '@src/main/content/sectionIds'
import type { AppSection, SectionField } from '@src/main/content/sections'
import type {
    NetworkMetricsResponse,
    ProjectLibraryResponse,
    ProjectInfoResponse,
    UserResponse,
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

export const applyUserToSections = (
    appSections: readonly AppSection[],
    user: UserResponse
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== SectionId.User) return section

        return {
            ...section,
            blocks: section.blocks.map((block) => {
                if (block.id !== BlockId.UserIdentity) return block

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
            }),
        }
    })
}

export const applyBrowserDataToSections = (
    appSections: readonly AppSection[],
    browserDataValues: BrowserDataValues
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== SectionId.Browser) return section

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
        if (section.id !== SectionId.Network) return section

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
        if (section.id !== SectionId.Project) return section

        return {
            ...section,
            blocks: section.blocks.map((block) => {
                if (block.id === BlockId.ProjectDependenciesLibraryVersions) {
                    return {
                        ...block,
                        fields: projectDependenciesLibraryFields,
                    }
                }

                if (block.id === BlockId.ProjectDevDependenciesLibraryVersions) {
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

export const applyNetworkMetricsToSections = (
    appSections: readonly AppSection[],
    networkMetrics: NetworkMetricsResponse
): readonly AppSection[] => {
    return applyNetworkDataToSections(appSections, buildNetworkSectionValues(networkMetrics))
}

export const applyNetworkFallbackToSections = (
    appSections: readonly AppSection[]
): readonly AppSection[] => {
    return applyNetworkDataToSections(appSections, NETWORK_FALLBACK_VALUES)
}

export const applyProjectInfoToSections = (
    appSections: readonly AppSection[],
    projectInfo: ProjectInfoResponse
): readonly AppSection[] => {
    return applyProjectDataToSections(
        appSections,
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
}

export const applyProjectFallbackToSections = (
    appSections: readonly AppSection[]
): readonly AppSection[] => {
    return applyProjectDataToSections(
        appSections,
        PROJECT_FALLBACK_VALUES,
        PROJECT_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS,
        PROJECT_DEV_DEPENDENCIES_LIBRARY_FALLBACK_FIELDS
    )
}
