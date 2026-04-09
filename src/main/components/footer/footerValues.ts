const UI_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})

const formatUiDate = (value: string): string => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    return UI_DATE_FORMATTER.format(date)
}

export type FooterValue = {
    readonly id: string
    readonly value: string
}

export const FOOTER_VALUES: readonly FooterValue[] = [
    { id: 'version', value: typeof VERSION !== 'undefined' ? VERSION : '' },
    { id: 'git', value: typeof GIT !== 'undefined' ? GIT : '' },
    { id: 'branch', value: typeof BRANCH !== 'undefined' ? BRANCH : '' },
    {
        id: 'build_time',
        value:
            typeof BUILD_TIME !== 'undefined' && BUILD_TIME.length > 0
                ? formatUiDate(BUILD_TIME)
                : '',
    },
    { id: 'node_env', value: typeof NODE_ENV !== 'undefined' ? NODE_ENV : '' },
] as const
