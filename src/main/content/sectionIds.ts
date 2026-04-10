export enum SectionId {
    User = 'user_section',
    WebApiPermissions = 'web_api_permissions_section',
    WebApiAvailability = 'web_api_availability_section',
    Browser = 'browser_section',
    Network = 'network_section',
    Project = 'project_section',
}

export enum BlockId {
    UserIdentity = 'user_identity',
    WebApiWithPermissions = 'web_api_with_permissions',
    WebApiWithPermissionsBrowserContext = 'web_api_with_permissions_browser_context',
    WebApiWithoutPermissionsStable = 'web_api_without_permissions_stable',
    WebApiWithoutPermissionsRisky = 'web_api_without_permissions_risky',
    BrowserUniqueValueKeys = 'browser_unique_value_keys',
    BrowserAllAvailableKeys = 'browser_all_available_keys',
    BrowserNetworkKeys = 'browser_network_keys',
    ProjectPackageKeys = 'project_package_keys',
    ProjectDependenciesLibraryVersions = 'project_dependencies_library_versions',
    ProjectDevDependenciesLibraryVersions = 'project_dev_dependencies_library_versions',
}
