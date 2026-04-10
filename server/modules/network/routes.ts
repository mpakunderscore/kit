import type { Express } from 'express'

import {
    createDownloadPayload,
    NETWORK_NO_CACHE_HEADERS,
    parseDownloadTestBytes,
    resolveNetworkIpPayload,
} from '@server/modules/network/service'
import { API_BASE_PATH, ApiEndpoint } from '@src/shared/contracts/api'

export const registerNetworkRoutes = (app: Express): void => {
    app.get(`${API_BASE_PATH}${ApiEndpoint.NetworkIp}`, (request, response) => {
        response.set(NETWORK_NO_CACHE_HEADERS)
        response.json(resolveNetworkIpPayload(request))
    })

    app.get(`${API_BASE_PATH}${ApiEndpoint.NetworkPing}`, (_request, response) => {
        response.set(NETWORK_NO_CACHE_HEADERS)
        response.status(204).send()
    })

    app.get(`${API_BASE_PATH}${ApiEndpoint.NetworkDownload}`, (request, response) => {
        const payloadSize = parseDownloadTestBytes(request.query.bytes)
        response.set({
            ...NETWORK_NO_CACHE_HEADERS,
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(payloadSize),
            'Content-Encoding': 'identity',
        })
        response.status(200).end(createDownloadPayload(payloadSize))
    })
}
