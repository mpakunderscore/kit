import type { Express } from 'express'

import {
    createDownloadPayload,
    NETWORK_NO_CACHE_HEADERS,
    parseDownloadTestBytes,
    resolveNetworkIpPayload,
} from '@server/modules/network/service'
import { ApiEndpoint } from '@src/shared/contracts/api'

export const registerNetworkRoutes = (app: Express): void => {
    app.get(ApiEndpoint.NetworkIp, (request, response) => {
        response.set(NETWORK_NO_CACHE_HEADERS)
        response.json(resolveNetworkIpPayload(request))
    })

    app.get(ApiEndpoint.NetworkPing, (_request, response) => {
        response.set(NETWORK_NO_CACHE_HEADERS)
        response.status(204).send()
    })

    app.get(ApiEndpoint.NetworkDownload, (request, response) => {
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
