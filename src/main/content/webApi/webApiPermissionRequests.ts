export enum WebApiPermissionResult {
    Granted = 'granted',
    Denied = 'denied',
    Prompt = 'prompt',
    Unsupported = 'unsupported',
    Error = 'error',
}

enum PermissionApiName {
    Accelerometer = 'accelerometer',
    Camera = 'camera',
    ClipboardRead = 'clipboard-read',
    Geolocation = 'geolocation',
    IdleDetection = 'idle-detection',
    Microphone = 'microphone',
    Notifications = 'notifications',
    Push = 'push',
    SpeakerSelection = 'speaker-selection',
}

export type WebApiPermissionRequestResult =
    | WebApiPermissionResult.Granted
    | WebApiPermissionResult.Denied
    | WebApiPermissionResult.Prompt
    | WebApiPermissionResult.Unsupported
    | WebApiPermissionResult.Error

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
    permissionName: PermissionApiName
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
    if (state === 'granted') return WebApiPermissionResult.Granted
    if (state === 'denied') return WebApiPermissionResult.Denied
    return WebApiPermissionResult.Prompt
}

const requestByPermissionsApi = async (
    permissionName: PermissionApiName
): Promise<WebApiPermissionRequestResult> => {
    const state = await queryPermissionState(permissionName)
    if (state === undefined) return WebApiPermissionResult.Unsupported
    return permissionStateToResult(state)
}

const requestNotificationPermission: PermissionRequestHandler = async () => {
    if (typeof Notification === 'undefined') return WebApiPermissionResult.Unsupported

    try {
        const result = await Notification.requestPermission()
        if (result === 'granted') return WebApiPermissionResult.Granted
        if (result === 'denied') return WebApiPermissionResult.Denied
        return WebApiPermissionResult.Prompt
    } catch {
        return WebApiPermissionResult.Error
    }
}

const requestGeolocationPermission: PermissionRequestHandler = async () => {
    const geolocation = withNavigator((nav) => nav.geolocation)
    if (geolocation === undefined) return WebApiPermissionResult.Unsupported

    return new Promise((resolve) => {
        geolocation.getCurrentPosition(
            () => resolve(WebApiPermissionResult.Granted),
            () => resolve(WebApiPermissionResult.Denied),
            { enableHighAccuracy: false, maximumAge: 0, timeout: 10_000 }
        )
    })
}

const requestMediaStreamPermission: PermissionRequestHandler = async () => {
    const getUserMedia = withNavigator((nav) => nav.mediaDevices?.getUserMedia)
    if (getUserMedia === undefined) return WebApiPermissionResult.Unsupported

    try {
        const stream = await getUserMedia.call(navigator.mediaDevices, { audio: true })
        stream.getTracks().forEach((track) => track.stop())
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestClipboardPermission: PermissionRequestHandler = async () => {
    const readText = withNavigator((nav) => nav.clipboard?.readText)
    if (readText === undefined) {
        return requestByPermissionsApi(PermissionApiName.ClipboardRead)
    }

    try {
        await readText.call(navigator.clipboard)
        return WebApiPermissionResult.Granted
    } catch {
        return requestByPermissionsApi(PermissionApiName.ClipboardRead)
    }
}

const requestScreenCapturePermission: PermissionRequestHandler = async () => {
    const getDisplayMedia = withNavigator((nav) => nav.mediaDevices?.getDisplayMedia)
    if (getDisplayMedia === undefined) return WebApiPermissionResult.Unsupported

    try {
        const stream = await getDisplayMedia.call(navigator.mediaDevices, { video: true })
        stream.getTracks().forEach((track) => track.stop())
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestStorageAccessPermission: PermissionRequestHandler = async () => {
    const requestStorageAccess = withDocument((doc) => doc.requestStorageAccess)
    if (requestStorageAccess === undefined) {
        return WebApiPermissionResult.Unsupported
    }

    try {
        await requestStorageAccess.call(document as DocumentWithExperimentalApis)
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWebBluetoothPermission: PermissionRequestHandler = async () => {
    const requestDevice = withNavigator((nav) => nav.bluetooth?.requestDevice)
    if (requestDevice === undefined) return WebApiPermissionResult.Unsupported

    try {
        await requestDevice({ acceptAllDevices: true })
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWebUsbPermission: PermissionRequestHandler = async () => {
    const requestDevice = withNavigator((nav) => nav.usb?.requestDevice)
    if (requestDevice === undefined) return WebApiPermissionResult.Unsupported

    try {
        await requestDevice({ filters: [] })
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWebSerialPermission: PermissionRequestHandler = async () => {
    const requestPort = withNavigator((nav) => nav.serial?.requestPort)
    if (requestPort === undefined) return WebApiPermissionResult.Unsupported

    try {
        await requestPort({ filters: [] })
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWebHidPermission: PermissionRequestHandler = async () => {
    const requestDevice = withNavigator((nav) => nav.hid?.requestDevice)
    if (requestDevice === undefined) return WebApiPermissionResult.Unsupported

    try {
        await requestDevice({ filters: [] })
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWebMidiPermission: PermissionRequestHandler = async () => {
    const requestMIDIAccess = withNavigator((nav) => nav.requestMIDIAccess)
    if (requestMIDIAccess === undefined) return WebApiPermissionResult.Unsupported

    try {
        await requestMIDIAccess.call(navigator)
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWebNfcPermission: PermissionRequestHandler = async () => {
    const NDEFReader = withWindow((win) => win.NDEFReader)
    if (NDEFReader === undefined) return WebApiPermissionResult.Unsupported

    try {
        const reader = new NDEFReader()
        await reader.scan()
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWebXrPermission: PermissionRequestHandler = async () => {
    const xrNavigator = withNavigator((nav) => nav.xr)
    const requestSession = xrNavigator?.requestSession
    if (requestSession === undefined) return WebApiPermissionResult.Unsupported

    try {
        await requestSession.call(xrNavigator, 'immersive-vr')
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestWindowManagementPermission: PermissionRequestHandler = async () => {
    const getScreenDetails = withWindow((win) => win.getScreenDetails)
    if (getScreenDetails === undefined) {
        return WebApiPermissionResult.Unsupported
    }

    try {
        await getScreenDetails.call(window as WindowWithExperimentalApis)
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestContactPickerPermission: PermissionRequestHandler = async () => {
    const ContactPicker = withWindow((win) => win.ContactPicker)
    if (ContactPicker === undefined) return WebApiPermissionResult.Unsupported

    try {
        const picker = new ContactPicker()
        await picker.select(['name'], { multiple: false })
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestIdleDetectionPermission: PermissionRequestHandler = async () => {
    const requestPermission = withWindow((win) => win.IdleDetector?.requestPermission)
    if (requestPermission === undefined)
        return requestByPermissionsApi(PermissionApiName.IdleDetection)

    try {
        const state = await requestPermission()
        return permissionStateToResult(state)
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestLocalFontAccessPermission: PermissionRequestHandler = async () => {
    const queryLocalFonts = withWindow((win) => win.queryLocalFonts)
    if (queryLocalFonts === undefined) {
        return WebApiPermissionResult.Unsupported
    }

    try {
        await queryLocalFonts.call(window as WindowWithExperimentalApis)
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestDeviceOrientationPermission: PermissionRequestHandler = async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
        return requestByPermissionsApi(PermissionApiName.Accelerometer)
    }

    const DeviceOrientationEventWithPermission =
        DeviceOrientationEvent as typeof DeviceOrientationEvent & {
            readonly requestPermission?: () => Promise<'granted' | 'denied'>
        }
    if (typeof DeviceOrientationEventWithPermission.requestPermission !== 'function') {
        return requestByPermissionsApi(PermissionApiName.Accelerometer)
    }

    try {
        const result = await DeviceOrientationEventWithPermission.requestPermission()
        return permissionStateToResult(result)
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const requestAudioOutputDevicesPermission: PermissionRequestHandler = async () => {
    const selectAudioOutput = withNavigator((nav) => nav.mediaDevices?.selectAudioOutput)
    if (selectAudioOutput === undefined) {
        return requestByPermissionsApi(PermissionApiName.SpeakerSelection)
    }

    try {
        await selectAudioOutput.call(navigator.mediaDevices)
        return WebApiPermissionResult.Granted
    } catch {
        return WebApiPermissionResult.Denied
    }
}

const PERMISSION_API_NAME_BY_WEB_API_NAME: Readonly<Record<string, PermissionApiName>> = {
    'Barcode Detection': PermissionApiName.Camera,
    Geolocation: PermissionApiName.Geolocation,
    Notifications: PermissionApiName.Notifications,
    Push: PermissionApiName.Push,
    'Web Speech': PermissionApiName.Microphone,
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
    if (typeof window === 'undefined') return WebApiPermissionResult.Unsupported

    const permissionName = PERMISSION_API_NAME_BY_WEB_API_NAME[apiName]
    if (permissionName !== undefined) {
        const stateBeforeRequest = await queryPermissionState(permissionName)
        if (stateBeforeRequest === 'granted' || stateBeforeRequest === 'denied') {
            return permissionStateToResult(stateBeforeRequest)
        }
    }

    const permissionRequester = WEB_API_PERMISSION_REQUESTERS[apiName]
    if (permissionRequester === undefined) {
        if (permissionName === undefined) return WebApiPermissionResult.Unsupported
        return requestByPermissionsApi(permissionName)
    }

    try {
        const requestResult = await permissionRequester()
        if (requestResult !== WebApiPermissionResult.Prompt || permissionName === undefined) {
            return requestResult
        }

        const stateAfterRequest = await queryPermissionState(permissionName)
        if (stateAfterRequest === undefined) return requestResult
        return permissionStateToResult(stateAfterRequest)
    } catch {
        return WebApiPermissionResult.Error
    }
}
