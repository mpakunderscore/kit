import {
    BROWSER_ALL_AVAILABLE_KEYS,
    BROWSER_NETWORK_KEYS,
    BROWSER_UNIQUE_VALUE_KEYS,
} from '@src/main/content/browser/browserDataKeys'
import { PROJECT_INFO_KEYS } from '@src/main/content/project/projectDataKeys'
import { BlockId, SectionId } from '@src/main/content/sectionIds'
import {
    WEB_API_WITHOUT_PERMISSIONS_RISKY_NAMES,
    WEB_API_WITHOUT_PERMISSIONS_STABLE_NAMES,
    WEB_API_WITH_PERMISSIONS_NAMES,
} from '@src/main/content/webApi/webApiFullList'

export enum SectionFieldTone {
    Ok = 'ok',
    Warn = 'warn',
    Bad = 'bad',
    Neutral = 'neutral',
}

export type SectionField = {
    readonly id: string
    readonly keyTooltip?: string
    readonly label: string
    readonly tone?: SectionFieldTone
    readonly value: string
}

export type SectionBlock = {
    readonly description: string
    readonly fields: readonly SectionField[]
    readonly id: BlockId
}

export type AppSection = {
    readonly blocks: readonly SectionBlock[]
    readonly id: SectionId
    readonly label: string
}

export type MenuSection = {
    readonly id: SectionId
    readonly label: string
}

const buildWebApiFields = (
    apiNames: readonly string[],
    value: string,
    tone: SectionFieldTone
): readonly SectionField[] => {
    return apiNames.map((apiName, index) => ({
        id: `web_api_${index + 1}`,
        label: apiName,
        value,
        tone,
    }))
}

const WEB_API_WITH_PERMISSIONS_BROWSER_CONTEXT_SET = new Set<string>([
    'Clipboard',
    'Contact Picker',
    'Idle Detection',
    'Local Font Access',
    'Notifications',
    'Push',
    'Screen Capture',
    'Storage Access',
    'Window Management',
])

const WEB_API_WITH_PERMISSIONS_DEVICE_SENSOR_NAMES: readonly string[] =
    WEB_API_WITH_PERMISSIONS_NAMES.filter(
        (apiName) => !WEB_API_WITH_PERMISSIONS_BROWSER_CONTEXT_SET.has(apiName)
    )

const WEB_API_WITH_PERMISSIONS_BROWSER_CONTEXT_NAMES: readonly string[] =
    WEB_API_WITH_PERMISSIONS_NAMES.filter((apiName) =>
        WEB_API_WITH_PERMISSIONS_BROWSER_CONTEXT_SET.has(apiName)
    )

const toFieldId = (key: string): string => key.toLowerCase().replaceAll(/[^a-z0-9]+/g, '_')

const buildBrowserKeyFields = (
    keys: readonly { readonly key: string; readonly value: string }[]
): readonly SectionField[] => {
    return keys.map(({ key, value }) => ({
        id: toFieldId(key),
        keyTooltip: key,
        label: value,
        value: '',
    }))
}

const buildInlineLabelFields = (labels: readonly string[]): readonly SectionField[] => {
    return labels.map((label) => ({
        id: toFieldId(label),
        label,
        value: '',
    }))
}

export const APP_SECTIONS: readonly AppSection[] = [
    {
        id: SectionId.User,
        label: 'User',
        blocks: [
            {
                id: BlockId.UserIdentity,
                description: '',
                fields: [],
            },
        ],
    },
    {
        id: SectionId.WebApiPermissions,
        label: 'Permissions',
        blocks: [
            {
                id: BlockId.WebApiWithPermissions,
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITH_PERMISSIONS_DEVICE_SENSOR_NAMES,
                    'Permission required',
                    SectionFieldTone.Warn
                ),
            },
            {
                id: BlockId.WebApiWithPermissionsBrowserContext,
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITH_PERMISSIONS_BROWSER_CONTEXT_NAMES,
                    'Permission required',
                    SectionFieldTone.Warn
                ),
            },
        ],
    },
    {
        id: SectionId.WebApiAvailability,
        label: 'Web API',
        blocks: [
            {
                id: BlockId.WebApiWithoutPermissionsStable,
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITHOUT_PERMISSIONS_STABLE_NAMES,
                    'No permission required',
                    SectionFieldTone.Ok
                ),
            },
            {
                id: BlockId.WebApiWithoutPermissionsRisky,
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITHOUT_PERMISSIONS_RISKY_NAMES,
                    'No permission required',
                    SectionFieldTone.Ok
                ),
            },
        ],
    },
    {
        id: SectionId.Browser,
        label: 'Browser',
        blocks: [
            {
                id: BlockId.BrowserUniqueValueKeys,
                description: '',
                fields: buildBrowserKeyFields(BROWSER_UNIQUE_VALUE_KEYS),
            },
            {
                id: BlockId.BrowserAllAvailableKeys,
                description: '',
                fields: buildInlineLabelFields(BROWSER_ALL_AVAILABLE_KEYS),
            },
        ],
    },
    {
        id: SectionId.Network,
        label: 'Network',
        blocks: [
            {
                id: BlockId.BrowserNetworkKeys,
                description: '',
                fields: [
                    {
                        id: 'server_base_url',
                        keyTooltip: 'server.baseUrl',
                        label: 'Server',
                        value: '',
                    },
                    ...buildBrowserKeyFields(BROWSER_NETWORK_KEYS),
                ],
            },
        ],
    },
    {
        id: SectionId.Project,
        label: 'Project',
        blocks: [
            {
                id: BlockId.ProjectPackageKeys,
                description: '',
                fields: buildBrowserKeyFields(PROJECT_INFO_KEYS),
            },
            {
                id: BlockId.ProjectDependenciesLibraryVersions,
                description: '',
                fields: [],
            },
            {
                id: BlockId.ProjectDevDependenciesLibraryVersions,
                description: '',
                fields: [],
            },
        ],
    },
] as const
