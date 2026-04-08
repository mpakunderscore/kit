export type FooterValue = {
    readonly id: string
    readonly value: string
}

export const FOOTER_VALUES: readonly FooterValue[] = [
    { id: 'version', value: typeof VERSION !== 'undefined' ? VERSION : '' },
    { id: 'git', value: typeof GIT !== 'undefined' ? GIT : '' },
    { id: 'branch', value: typeof BRANCH !== 'undefined' ? BRANCH : '' },
    { id: 'build_time', value: typeof BUILD_TIME !== 'undefined' ? BUILD_TIME : '' },
    { id: 'node_env', value: typeof NODE_ENV !== 'undefined' ? NODE_ENV : '' },
    { id: 'port', value: typeof PORT !== 'undefined' ? PORT : '' },
] as const
