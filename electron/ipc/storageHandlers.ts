import { ipcMain } from 'electron'

import { DESKTOP_IPC_CHANNELS, isDesktopUserPayload } from '@electron/contracts/desktop'
import type { ElectronStorage } from '@electron/storage/sqlite/storage'

export const registerStorageHandlers = (storage: ElectronStorage): void => {
    ipcMain.removeHandler(DESKTOP_IPC_CHANNELS.userGet)
    ipcMain.handle(DESKTOP_IPC_CHANNELS.userGet, async () => {
        const user = await storage.getUser()
        if (!isDesktopUserPayload(user)) {
            throw new Error('Desktop storage returned an invalid user payload')
        }

        return user
    })
}
