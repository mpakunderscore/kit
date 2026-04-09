const WEB_API_PERMISSION_DESCRIPTIONS: Readonly<Record<string, string>> = {
    'Audio Output Devices':
        'Lets a site choose the output audio device, such as speakers or headphones.',
    'Barcode Detection': 'Allows scanning and decoding barcodes from camera input or media frames.',
    Clipboard: 'Allows reading from or writing to the system clipboard.',
    'Contact Picker': "Lets a site request selected contacts from the user's address book.",
    'Device orientation events':
        'Provides access to motion and orientation sensor data from the device.',
    Geolocation: "Provides access to the user's geographic location.",
    'Idle Detection': 'Detects whether the user is idle and whether the screen is locked.',
    'Local Font Access': 'Lets a site query and use fonts installed on the local system.',
    'Media Capture and Streams API (Media Stream)':
        'Provides access to media streams from camera and microphone devices.',
    'MediaStream Image Capture':
        'Enables photo capture and camera controls for active media streams.',
    'MediaStream Recording': 'Allows recording audio and video from media streams.',
    Notifications: 'Allows displaying system notifications outside the web page context.',
    Push: 'Allows receiving push messages from a server in the background.',
    'Screen Capture':
        'Allows capturing the display, application window, or browser tab as a media stream.',
    'Storage Access':
        'Lets embedded content request access to storage blocked by browser privacy policies.',
    'Web Bluetooth': 'Allows discovering and connecting to nearby Bluetooth devices.',
    WebHID: 'Allows communication with Human Interface Devices over the HID protocol.',
    'Web MIDI': 'Allows communication with MIDI input and output devices.',
    'Web NFC': 'Allows reading and writing NFC tags on supported devices.',
    'Web Serial': 'Allows communication with serial devices connected to the system.',
    'Web Speech': 'Provides speech recognition and speech synthesis capabilities.',
    WebUSB: 'Allows communication with USB devices from the browser.',
    'WebXR Device': 'Allows immersive augmented reality and virtual reality device sessions.',
    'Window Management':
        'Allows querying and controlling multiple screens and advanced window placement.',
}

const DEFAULT_PERMISSION_DESCRIPTION =
    'Requires user permission to access sensitive browser or device capabilities.'

export const getWebApiPermissionDescription = (apiName: string): string => {
    return WEB_API_PERMISSION_DESCRIPTIONS[apiName] ?? DEFAULT_PERMISSION_DESCRIPTION
}
