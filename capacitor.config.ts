import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'space.mpak.kit',
    appName: 'KIT',
    webDir: 'dist/client',
    server: {
        androidScheme: 'https',
    },
}

export default config
