import type { UserPayload } from '@src/shared/contracts/api'

export const DESKTOP_IPC_CHANNELS = {
    userGet: 'desktop:user:get',
} as const

export type DesktopApi = {
    readonly getUser: () => Promise<UserPayload>
}
