import { contextBridge, ipcRenderer } from 'electron'

import type { UserPayload } from '@src/shared/contracts/api'

// eslint-disable-next-line no-restricted-imports -- Preload must resolve at runtime without path aliases in emitted JS.
import { DESKTOP_IPC_CHANNELS } from './contracts/desktop'

type DesktopApi = {
    readonly getUser: () => Promise<UserPayload>
}

const desktopApi: DesktopApi = {
    getUser: async () => {
        return ipcRenderer.invoke(DESKTOP_IPC_CHANNELS.userGet)
    },
}

contextBridge.exposeInMainWorld('desktopApi', desktopApi)
