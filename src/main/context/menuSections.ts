export type MenuSection = {
    readonly id: string
    readonly label: string
}

export const MENU_SECTIONS: readonly MenuSection[] = [
    { id: 'user_section', label: 'User' },
    { id: 'web_api_section', label: 'Web API' },
    { id: 'data_section', label: 'Data' },
] as const
