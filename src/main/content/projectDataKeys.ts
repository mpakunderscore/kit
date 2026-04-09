export const PROJECT_INFO_KEYS = [
    { key: 'package.name', value: 'Package Name' },
    { key: 'package.version', value: 'Version' },
    { key: 'package.description', value: 'Description' },
    { key: 'package.author', value: 'Author' },
    { key: 'package.license', value: 'License' },
    { key: 'package.engines.node', value: 'Node Engine' },
    { key: 'package.scripts.count', value: 'Scripts Count' },
    { key: 'package.dependencies.count', value: 'Dependencies Count' },
    { key: 'package.devDependencies.count', value: 'Dev Dependencies Count' },
] as const

export type ProjectDataKey = (typeof PROJECT_INFO_KEYS)[number]['key']
