export type SectionFieldTone = 'ok' | 'warn' | 'bad' | 'neutral'

export type SectionField = {
    readonly id: string
    readonly label: string
    readonly tone?: SectionFieldTone
    readonly value: string
}

export type SectionBlock = {
    readonly description: string
    readonly fields: readonly SectionField[]
    readonly id: string
    readonly title: string
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

export const APP_SECTIONS: readonly AppSection[] = [
    {
        id: 'user_section',
        label: 'User',
        blocks: [
            {
                id: 'user_identity',
                title: 'Session Identity',
                description: 'Mock backend payload for UUID and authentication state.',
                fields: [
                    { id: 'uuid', label: 'UUID', value: '8bf3e9ef-9a89-4d1f-8ce5-7d5021eb6d53' },
                    { id: 'status', label: 'Status', value: 'Active session', tone: 'ok' },
                    { id: 'issued_at', label: 'Issued At', value: '2026-04-08 14:21:13 UTC' },
                    { id: 'source', label: 'Source', value: 'GET /api/user/uuid' },
                    { id: 'ttl', label: 'TTL', value: '24h' },
                ],
            },
            {
                id: 'user_profile',
                title: 'Profile Snapshot',
                description: 'Mock profile attributes used by UI personalization.',
                fields: [
                    { id: 'display_name', label: 'Display Name', value: 'Alex Carter' },
                    { id: 'username', label: 'Username', value: 'alex.carter' },
                    { id: 'email', label: 'Email', value: 'alex.carter@example.com' },
                    { id: 'roles', label: 'Roles', value: 'admin, editor' },
                    { id: 'timezone', label: 'Timezone', value: 'America/Los_Angeles' },
                    { id: 'profile_fill', label: 'Profile Completeness', value: '82%', tone: 'warn' },
                ],
            },
        ],
    },
    {
        id: 'web_api_section',
        label: 'Web API',
        blocks: [
            {
                id: 'web_api_demo',
                title: 'Interactive Demos',
                description: 'Mock run states for browser Web API demo actions.',
                fields: [
                    { id: 'clipboard', label: 'Clipboard API', value: 'Supported', tone: 'ok' },
                    { id: 'geolocation', label: 'Geolocation API', value: 'Permission prompt', tone: 'warn' },
                    { id: 'notifications', label: 'Notifications', value: 'Denied', tone: 'bad' },
                    { id: 'fullscreen', label: 'Fullscreen API', value: 'Supported', tone: 'ok' },
                    { id: 'media_devices', label: 'MediaDevices', value: 'Supported (2 inputs)', tone: 'ok' },
                ],
            },
            {
                id: 'web_api_matrix',
                title: 'Availability Matrix',
                description: 'Mock feature detection snapshot in current browser.',
                fields: [
                    { id: 'service_worker', label: 'Service Worker', value: 'Supported', tone: 'ok' },
                    { id: 'web_share', label: 'Web Share', value: 'Not available on desktop', tone: 'warn' },
                    { id: 'webgpu', label: 'WebGPU', value: 'Unsupported', tone: 'bad' },
                    { id: 'indexeddb', label: 'IndexedDB', value: 'Supported', tone: 'ok' },
                    { id: 'push', label: 'Push API', value: 'Supported', tone: 'ok' },
                    { id: 'payment', label: 'Payment Request', value: 'Supported', tone: 'ok' },
                ],
            },
        ],
    },
    {
        id: 'data_section',
        label: 'Data',
        blocks: [
            {
                id: 'server_data',
                title: 'Server Request Context',
                description: 'Mock metadata observed at backend request boundary.',
                fields: [
                    { id: 'request_id', label: 'Request ID', value: 'req_9fa602e4d7f1' },
                    { id: 'ip', label: 'IP', value: '203.0.113.42' },
                    { id: 'locale', label: 'Accept-Language', value: 'en-US,en;q=0.9' },
                    { id: 'user_agent', label: 'User Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' },
                    { id: 'tls', label: 'TLS', value: 'v1.3', tone: 'ok' },
                    { id: 'region', label: 'Server Region', value: 'us-west-2' },
                ],
            },
            {
                id: 'browser_data',
                title: 'Browser Runtime Snapshot',
                description: 'Mock values collected from browser environment APIs.',
                fields: [
                    { id: 'language', label: 'navigator.language', value: 'en-US' },
                    { id: 'timezone', label: 'Intl timezone', value: 'America/Los_Angeles' },
                    { id: 'viewport', label: 'Viewport', value: '1440 x 900' },
                    { id: 'online', label: 'navigator.onLine', value: 'true', tone: 'ok' },
                    { id: 'network', label: 'Connection', value: '4g / 38ms RTT' },
                    { id: 'storage', label: 'Storage Usage', value: '1.2 MB / 120 MB' },
                ],
            },
        ],
    },
] as const

export const MENU_SECTIONS: readonly MenuSection[] = APP_SECTIONS.map(({ id, label }) => ({
    id,
    label,
}))
