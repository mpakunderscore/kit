import { SectionId } from '@src/main/content/sectionIds'
import type { AppSection } from '@src/main/content/sections'
import { NETWORK_NOT_AVAILABLE_VALUE } from '@src/main/context/appDataPatchers/constants'
import type { NetworkMetricsResponse } from '@src/main/network/httpApi'

type NetworkFieldKey =
    | 'location.hostname'
    | 'navigator.connection.rtt'
    | 'navigator.connection.downlink'
    | 'server.baseUrl'

type NetworkSectionValues = Readonly<Record<NetworkFieldKey, string>>

const NETWORK_FIELD_KEYS: readonly NetworkFieldKey[] = [
    'location.hostname',
    'navigator.connection.rtt',
    'navigator.connection.downlink',
    'server.baseUrl',
]

const NETWORK_FALLBACK_VALUES: NetworkSectionValues = {
    'location.hostname': NETWORK_NOT_AVAILABLE_VALUE,
    'navigator.connection.rtt': NETWORK_NOT_AVAILABLE_VALUE,
    'navigator.connection.downlink': NETWORK_NOT_AVAILABLE_VALUE,
    'server.baseUrl': NETWORK_NOT_AVAILABLE_VALUE,
}

const isNetworkFieldKey = (value: string): value is NetworkFieldKey => {
    return NETWORK_FIELD_KEYS.some((networkFieldKey) => networkFieldKey === value)
}

const buildNetworkSectionValues = (
    networkMetrics: NetworkMetricsResponse
): NetworkSectionValues => {
    return {
        'location.hostname': networkMetrics.ip,
        'navigator.connection.rtt': `${networkMetrics.pingMs} ms`,
        'navigator.connection.downlink': `${networkMetrics.downlinkMbps} Mbps`,
        'server.baseUrl': networkMetrics.serverBaseUrl,
    }
}

const applyNetworkDataToSections = (
    appSections: readonly AppSection[],
    networkDataValues: NetworkSectionValues
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== SectionId.Network) return section

        return {
            ...section,
            blocks: section.blocks.map((block) => ({
                ...block,
                fields: block.fields.map((field) => {
                    if (field.keyTooltip === undefined || !isNetworkFieldKey(field.keyTooltip)) {
                        return field
                    }

                    return {
                        ...field,
                        value: networkDataValues[field.keyTooltip],
                    }
                }),
            })),
        }
    })
}

export const applyNetworkMetricsToSections = (
    appSections: readonly AppSection[],
    networkMetrics: NetworkMetricsResponse
): readonly AppSection[] => {
    return applyNetworkDataToSections(appSections, buildNetworkSectionValues(networkMetrics))
}

export const applyNetworkFallbackToSections = (
    appSections: readonly AppSection[]
): readonly AppSection[] => {
    return applyNetworkDataToSections(appSections, NETWORK_FALLBACK_VALUES)
}
