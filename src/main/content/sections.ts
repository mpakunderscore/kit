import {
    BROWSER_ENVIRONMENT_KEYS,
    BROWSER_SESSION_STATE_KEYS,
} from '@src/main/content/browserDataKeys'
import {
    WEB_API_WITHOUT_PERMISSIONS_NAMES,
    WEB_API_WITH_PERMISSIONS_NAMES,
} from '@src/main/content/webApiFullList'

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
            {
                id: 'user_profile',
                description: '',
                fields: [],
            },
        ],
    },
    {
        id: 'web_api_section',
        label: 'Web API',
        blocks: [
            {
                id: 'web_api_with_permissions',
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITH_PERMISSIONS_NAMES,
                    'Permission required',
                    'warn'
                ),
            },
            {
                id: 'web_api_without_permissions',
                description: '',
                fields: buildWebApiFields(
                    WEB_API_WITHOUT_PERMISSIONS_NAMES,
                    'No permission required',
                    'ok'
                ),
            },
        ],
    },
    {
        id: 'data_section',
        label: 'Data',
        blocks: [
            {
                id: 'browser_environment_keys',
                description: '',
                fields: buildBrowserKeyFields(BROWSER_ENVIRONMENT_KEYS),
            },
            {
                id: 'browser_session_state_keys',
                description: '',
                fields: buildBrowserKeyFields(BROWSER_SESSION_STATE_KEYS),
            },
        ],
    },
] as const

export const MENU_SECTIONS: readonly MenuSection[] = APP_SECTIONS.map(({ id, label }) => ({
    id,
    label,
}))
