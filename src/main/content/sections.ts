import {
    BROWSER_ALL_AVAILABLE_KEYS,
    BROWSER_NETWORK_KEYS,
    BROWSER_UNIQUE_VALUE_KEYS,
} from '@src/main/content/browser/browserDataKeys'
import { PROJECT_INFO_KEYS } from '@src/main/content/project/projectDataKeys'
import {
    WEB_API_WITHOUT_PERMISSIONS_RISKY_NAMES,
    WEB_API_WITHOUT_PERMISSIONS_STABLE_NAMES,
    WEB_API_WITH_PERMISSIONS_NAMES,
} from '@src/main/content/webApi/webApiFullList'

export type SectionFieldTone = 'ok' | 'warn' | 'bad' | 'neutral'

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
    readonly id: string
}

export type AppSection = {
    readonly blocks: readonly SectionBlock[]
    readonly id: string
    readonly label: string
}

export type MenuSection = {
    readonly id: string
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
        id: 'user_section',
        label: 'User',
        blocks: [
            {
                id: 'user_identity',
                description: '',
                fields: [],
            },
        ],
    },
    {
        id: 'web_api_permissions_section',
        label: 'Permissions',
        blocks: [
            {
                id: 'web_api_with_permissions',
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITH_PERMISSIONS_DEVICE_SENSOR_NAMES,
                    'Permission required',
                    'warn'
                ),
            },
            {
                id: 'web_api_with_permissions_browser_context',
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITH_PERMISSIONS_BROWSER_CONTEXT_NAMES,
                    'Permission required',
                    'warn'
                ),
            },
        ],
    },
    {
        id: 'web_api_availability_section',
        label: 'Web API',
        blocks: [
            {
                id: 'web_api_without_permissions_stable',
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITHOUT_PERMISSIONS_STABLE_NAMES,
                    'No permission required',
                    'ok'
                ),
            },
            {
                id: 'web_api_without_permissions_risky',
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITHOUT_PERMISSIONS_RISKY_NAMES,
                    'No permission required',
                    'ok'
                ),
            },
        ],
    },
    {
        id: 'browser_section',
        label: 'Browser',
        blocks: [
            {
                id: 'browser_unique_value_keys',
                description: '',
                fields: buildBrowserKeyFields(BROWSER_UNIQUE_VALUE_KEYS),
            },
            {
                id: 'browser_all_available_keys',
                description: '',
                fields: buildInlineLabelFields(BROWSER_ALL_AVAILABLE_KEYS),
            },
        ],
    },
    {
        id: 'network_section',
        label: 'Network',
        blocks: [
            {
                id: 'browser_network_keys',
                description: '',
                fields: buildBrowserKeyFields(BROWSER_NETWORK_KEYS),
            },
        ],
    },
    {
        id: 'project_section',
        label: 'Project',
        blocks: [
            {
                id: 'project_package_keys',
                description: '',
                fields: buildBrowserKeyFields(PROJECT_INFO_KEYS),
            },
            {
                id: 'project_dependencies_library_versions',
                description: '',
                fields: [],
            },
            {
                id: 'project_dev_dependencies_library_versions',
                description: '',
                fields: [],
            },
        ],
    },
] as const

export const MENU_SECTIONS: readonly MenuSection[] = APP_SECTIONS.map(({ id, label }) => ({
    id,
    label,
}))
