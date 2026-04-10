import { SectionId } from '@src/main/content/sectionIds'

export const SECTION_PATHNAMES = [
    '/',
    '/permissions',
    '/webapi',
    '/browser',
    '/network',
    '/project',
] as const

export type SectionPathname = (typeof SECTION_PATHNAMES)[number]

const SECTION_TO_PATHNAME: Readonly<Record<SectionId, SectionPathname>> = {
    [SectionId.User]: '/',
    [SectionId.WebApiPermissions]: '/permissions',
    [SectionId.WebApiAvailability]: '/webapi',
    [SectionId.Browser]: '/browser',
    [SectionId.Network]: '/network',
    [SectionId.Project]: '/project',
}

const PATHNAME_TO_SECTION: Readonly<Record<SectionPathname, SectionId>> = {
    '/': SectionId.User,
    '/permissions': SectionId.WebApiPermissions,
    '/webapi': SectionId.WebApiAvailability,
    '/browser': SectionId.Browser,
    '/network': SectionId.Network,
    '/project': SectionId.Project,
}

export const APP_SECTION_PATHNAMES: readonly SectionPathname[] = SECTION_PATHNAMES

export const normalizePathname = (pathname: string): string => {
    return pathname.replace(/\/+$/, '') || '/'
}

const isSectionPathname = (pathname: string): pathname is SectionPathname => {
    return pathname in PATHNAME_TO_SECTION
}

export const getSectionFromPathname = (pathname: string): SectionId | null => {
    const normalizedPathname = normalizePathname(pathname).toLowerCase()
    if (!isSectionPathname(normalizedPathname)) {
        return null
    }

    return PATHNAME_TO_SECTION[normalizedPathname]
}

export const getPathnameForSection = (sectionId: SectionId): SectionPathname => {
    return SECTION_TO_PATHNAME[sectionId]
}
