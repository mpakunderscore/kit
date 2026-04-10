import type { UserPayload } from '@src/shared/contracts/api'

export { DESKTOP_IPC_CHANNELS } from '@src/shared/contracts/desktopIpc'

export type DesktopApi = {
    readonly getUser: () => Promise<UserPayload>
}
