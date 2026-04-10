import { contextBridge, ipcRenderer } from 'electron'

import type { DesktopUserPayload } from '@electron/contracts/desktop'

const DESKTOP_IPC_CHANNELS = {
    userGet: 'desktop:user:get',
} as const

type DesktopApi = {
    readonly getUser: () => Promise<DesktopUserPayload>
}

const desktopApi: DesktopApi = {
    getUser: async () => {
        return ipcRenderer.invoke(DESKTOP_IPC_CHANNELS.userGet)
    },
}

contextBridge.exposeInMainWorld('desktopApi', desktopApi)
