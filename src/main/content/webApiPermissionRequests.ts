export type WebApiPermissionRequestResult =
    | 'granted'
    | 'denied'
    | 'prompt'
    | 'unsupported'
    | 'error'

type PermissionRequestHandler = () => Promise<WebApiPermissionRequestResult>

type NavigatorWithExperimentalApis = Navigator & {
    readonly bluetooth?: {
        requestDevice?: (options: { readonly acceptAllDevices: boolean }) => Promise<unknown>
    }
    readonly hid?: {
        requestDevice?: (options: { readonly filters: readonly unknown[] }) => Promise<unknown>
    }
    readonly mediaDevices?: MediaDevices & {
        readonly selectAudioOutput?: () => Promise<unknown>
    }
    readonly serial?: {
        requestPort?: (options: { readonly filters: readonly unknown[] }) => Promise<unknown>
    }
    readonly usb?: {
        requestDevice?: (options: { readonly filters: readonly unknown[] }) => Promise<unknown>
    }
    readonly xr?: {
        requestSession?: (mode: string) => Promise<unknown>
    }
}

type WindowWithExperimentalApis = Window & {
    readonly ContactPicker?: {
        new (): {
            select: (
                properties: readonly string[],
                options?: { readonly multiple?: boolean }
            ) => Promise<unknown>
        }
    }
    readonly IdleDetector?: {
        requestPermission?: () => Promise<'granted' | 'denied'>
    }
    readonly NDEFReader?: {
        new (): {
            scan: () => Promise<void>
        }
    }
    readonly getScreenDetails?: () => Promise<unknown>
    readonly queryLocalFonts?: () => Promise<readonly unknown[]>
}

type DocumentWithExperimentalApis = Document & {
    readonly requestStorageAccess?: () => Promise<void>
}

const withNavigator = <T>(reader: (nav: NavigatorWithExperimentalApis) => T): T | undefined => {
    if (typeof navigator === 'undefined') return undefined

    try {
        return reader(navigator as NavigatorWithExperimentalApis)
    } catch {
        return undefined
    }
}

const withWindow = <T>(reader: (win: WindowWithExperimentalApis) => T): T | undefined => {
    if (typeof window === 'undefined') return undefined

    try {
        return reader(window as WindowWithExperimentalApis)
    } catch {
        return undefined
    }
}

const withDocument = <T>(reader: (doc: DocumentWithExperimentalApis) => T): T | undefined => {
    if (typeof document === 'undefined') return undefined

    try {
        return reader(document as DocumentWithExperimentalApis)
    } catch {
        return undefined
    }
}

const queryPermissionState = async (
    permissionName: string
): Promise<PermissionState | undefined> => {
    const permissionsApi = withNavigator((nav) => nav.permissions)
    if (permissionsApi === undefined) return undefined

    try {
        const status = await permissionsApi.query({
            name: permissionName,
        } as PermissionDescriptor)
        return status.state
    } catch {
        return undefined
    }
}

const permissionStateToResult = (state: PermissionState): WebApiPermissionRequestResult => {
    if (state === 'granted') return 'granted'
    if (state === 'denied') return 'denied'
    return 'prompt'
}

const requestByPermissionsApi = async (
    permissionName: string
): Promise<WebApiPermissionRequestResult> => {
    const state = await queryPermissionState(permissionName)
    if (state === undefined) return 'unsupported'
    return permissionStateToResult(state)
}

const requestNotificationPermission: PermissionRequestHandler = async () => {
    if (typeof Notification === 'undefined') return 'unsupported'

    try {
        const result = await Notification.requestPermission()
        if (result === 'granted') return 'granted'
        if (result === 'denied') return 'denied'
        return 'prompt'
    } catch {
        return 'error'
    }
}

const requestGeolocationPermission: PermissionRequestHandler = async () => {
    const geolocation = withNavigator((nav) => nav.geolocation)
    if (geolocation === undefined) return 'unsupported'

    return new Promise((resolve) => {
        geolocation.getCurrentPosition(
            () => resolve('granted'),
            () => resolve('denied'),
            { enableHighAccuracy: false, maximumAge: 0, timeout: 10_000 }
        )
    })
}

const requestMediaStreamPermission: PermissionRequestHandler = async () => {
    const getUserMedia = withNavigator((nav) => nav.mediaDevices?.getUserMedia)
    if (getUserMedia === undefined) return 'unsupported'

    try {
        const stream = await getUserMedia.call(navigator.mediaDevices, { audio: true })
        stream.getTracks().forEach((track) => track.stop())
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestClipboardPermission: PermissionRequestHandler = async () => {
    const readText = withNavigator((nav) => nav.clipboard?.readText)
    if (readText === undefined) {
        return requestByPermissionsApi('clipboard-read')
    }

    try {
        await readText.call(navigator.clipboard)
        return 'granted'
    } catch {
        return requestByPermissionsApi('clipboard-read')
    }
}

const requestScreenCapturePermission: PermissionRequestHandler = async () => {
    const getDisplayMedia = withNavigator((nav) => nav.mediaDevices?.getDisplayMedia)
    if (getDisplayMedia === undefined) return 'unsupported'

    try {
        const stream = await getDisplayMedia.call(navigator.mediaDevices, { video: true })
        stream.getTracks().forEach((track) => track.stop())
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestStorageAccessPermission: PermissionRequestHandler = async () => {
    const requestStorageAccess = withDocument((doc) => doc.requestStorageAccess)
    if (requestStorageAccess === undefined) {
        return 'unsupported'
    }

    try {
        await requestStorageAccess.call(document as DocumentWithExperimentalApis)
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWebBluetoothPermission: PermissionRequestHandler = async () => {
    const requestDevice = withNavigator((nav) => nav.bluetooth?.requestDevice)
    if (requestDevice === undefined) return 'unsupported'

    try {
        await requestDevice({ acceptAllDevices: true })
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWebUsbPermission: PermissionRequestHandler = async () => {
    const requestDevice = withNavigator((nav) => nav.usb?.requestDevice)
    if (requestDevice === undefined) return 'unsupported'

    try {
        await requestDevice({ filters: [] })
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWebSerialPermission: PermissionRequestHandler = async () => {
    const requestPort = withNavigator((nav) => nav.serial?.requestPort)
    if (requestPort === undefined) return 'unsupported'

    try {
        await requestPort({ filters: [] })
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWebHidPermission: PermissionRequestHandler = async () => {
    const requestDevice = withNavigator((nav) => nav.hid?.requestDevice)
    if (requestDevice === undefined) return 'unsupported'

    try {
        await requestDevice({ filters: [] })
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWebMidiPermission: PermissionRequestHandler = async () => {
    const requestMIDIAccess = withNavigator((nav) => nav.requestMIDIAccess)
    if (requestMIDIAccess === undefined) return 'unsupported'

    try {
        await requestMIDIAccess.call(navigator)
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWebNfcPermission: PermissionRequestHandler = async () => {
    const NDEFReader = withWindow((win) => win.NDEFReader)
    if (NDEFReader === undefined) return 'unsupported'

    try {
        const reader = new NDEFReader()
        await reader.scan()
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWebXrPermission: PermissionRequestHandler = async () => {
    const xr = withNavigator((nav) => nav.xr)
    const requestSession = xr?.requestSession
    if (requestSession === undefined) return 'unsupported'

    try {
        await requestSession.call(xr, 'immersive-vr')
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestWindowManagementPermission: PermissionRequestHandler = async () => {
    const getScreenDetails = withWindow((win) => win.getScreenDetails)
    if (getScreenDetails === undefined) {
        return 'unsupported'
    }

    try {
        await getScreenDetails.call(window as WindowWithExperimentalApis)
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestContactPickerPermission: PermissionRequestHandler = async () => {
    const ContactPicker = withWindow((win) => win.ContactPicker)
    if (ContactPicker === undefined) return 'unsupported'

    try {
        const picker = new ContactPicker()
        await picker.select(['name'], { multiple: false })
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestIdleDetectionPermission: PermissionRequestHandler = async () => {
    const requestPermission = withWindow((win) => win.IdleDetector?.requestPermission)
    if (requestPermission === undefined) return requestByPermissionsApi('idle-detection')

    try {
        const state = await requestPermission()
        return permissionStateToResult(state)
    } catch {
        return 'denied'
    }
}

const requestLocalFontAccessPermission: PermissionRequestHandler = async () => {
    const queryLocalFonts = withWindow((win) => win.queryLocalFonts)
    if (queryLocalFonts === undefined) {
        return 'unsupported'
    }

    try {
        await queryLocalFonts.call(window as WindowWithExperimentalApis)
        return 'granted'
    } catch {
        return 'denied'
    }
}

const requestDeviceOrientationPermission: PermissionRequestHandler = async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
        return requestByPermissionsApi('accelerometer')
    }

    const DeviceOrientationEventWithPermission = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        readonly requestPermission?: () => Promise<'granted' | 'denied'>
    }
    if (typeof DeviceOrientationEventWithPermission.requestPermission !== 'function') {
        return requestByPermissionsApi('accelerometer')
    }

    try {
        const result = await DeviceOrientationEventWithPermission.requestPermission()
        return permissionStateToResult(result)
    } catch {
        return 'denied'
    }
}

const requestAudioOutputDevicesPermission: PermissionRequestHandler = async () => {
    const selectAudioOutput = withNavigator((nav) => nav.mediaDevices?.selectAudioOutput)
    if (selectAudioOutput === undefined) return requestByPermissionsApi('speaker-selection')

    try {
        await selectAudioOutput.call(navigator.mediaDevices)
        return 'granted'
    } catch {
        return 'denied'
    }
}

const PERMISSION_API_NAME_BY_WEB_API_NAME: Readonly<Record<string, string>> = {
    'Barcode Detection': 'camera',
    Geolocation: 'geolocation',
    Notifications: 'notifications',
    Push: 'push',
    'Web Speech': 'microphone',
}

const WEB_API_PERMISSION_REQUESTERS: Readonly<Record<string, PermissionRequestHandler>> = {
    'Audio Output Devices': requestAudioOutputDevicesPermission,
    'Barcode Detection': requestMediaStreamPermission,
    Clipboard: requestClipboardPermission,
    'Contact Picker': requestContactPickerPermission,
    'Device orientation events': requestDeviceOrientationPermission,
    Geolocation: requestGeolocationPermission,
    'Idle Detection': requestIdleDetectionPermission,
    'Local Font Access': requestLocalFontAccessPermission,
    'Media Capture and Streams API (Media Stream)': requestMediaStreamPermission,
    'MediaStream Image Capture': requestMediaStreamPermission,
    'MediaStream Recording': requestMediaStreamPermission,
    Notifications: requestNotificationPermission,
    Push: requestNotificationPermission,
    'Screen Capture': requestScreenCapturePermission,
    'Storage Access': requestStorageAccessPermission,
    'Web Bluetooth': requestWebBluetoothPermission,
    WebHID: requestWebHidPermission,
    'Web MIDI': requestWebMidiPermission,
    'Web NFC': requestWebNfcPermission,
    'Web Serial': requestWebSerialPermission,
    'Web Speech': requestMediaStreamPermission,
    WebUSB: requestWebUsbPermission,
    'WebXR Device': requestWebXrPermission,
    'Window Management': requestWindowManagementPermission,
}

export const requestWebApiPermission = async (
    apiName: string
): Promise<WebApiPermissionRequestResult> => {
    if (typeof window === 'undefined') return 'unsupported'

    const permissionName = PERMISSION_API_NAME_BY_WEB_API_NAME[apiName]
    if (permissionName !== undefined) {
        const stateBeforeRequest = await queryPermissionState(permissionName)
        if (stateBeforeRequest === 'granted' || stateBeforeRequest === 'denied') {
            return permissionStateToResult(stateBeforeRequest)
        }
    }

    const permissionRequester = WEB_API_PERMISSION_REQUESTERS[apiName]
    if (permissionRequester === undefined) {
        if (permissionName === undefined) return 'unsupported'
        return requestByPermissionsApi(permissionName)
    }

    try {
        const requestResult = await permissionRequester()
        if (requestResult !== 'prompt' || permissionName === undefined) {
            return requestResult
        }

        const stateAfterRequest = await queryPermissionState(permissionName)
        if (stateAfterRequest === undefined) return requestResult
        return permissionStateToResult(stateAfterRequest)
    } catch {
        return 'error'
    }
}
