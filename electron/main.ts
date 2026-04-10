import path from 'node:path'

import { app, BrowserWindow, Menu } from 'electron'

import { registerStorageHandlers } from '@electron/ipc/storageHandlers'
import { createElectronStorage, type ElectronStorage } from '@electron/storage/sqlite/storage'

app.setName('KIT')

const rendererDevelopmentUrl = process.env.ELECTRON_RENDERER_URL
const isDevelopment = rendererDevelopmentUrl !== undefined
const rendererProductionHtmlPath = path.resolve(__dirname, '../client/index.html')
const preloadScriptPath = path.resolve(__dirname, 'preload.js')
const iconPath = path.resolve(__dirname, '../../public/icons/icon-macos.png')

const WINDOW_BOUNDS = {
    width: 1280,
    height: 900,
    minWidth: 640,
    minHeight: 640,
} as const

const WINDOW_BACKGROUND_COLOR = '#0d1117'

let storage: ElectronStorage | undefined

const createMainWindow = async (): Promise<void> => {
    const mainWindow = new BrowserWindow({
        ...WINDOW_BOUNDS,
        backgroundColor: WINDOW_BACKGROUND_COLOR,
        icon: iconPath,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            preload: preloadScriptPath,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    })

    if (isDevelopment && rendererDevelopmentUrl !== undefined) {
        await mainWindow.loadURL(rendererDevelopmentUrl)
        return
    }

    await mainWindow.loadFile(rendererProductionHtmlPath)
}

if (process.platform === 'darwin') {
    Menu.setApplicationMenu(
        Menu.buildFromTemplate([
            {
                label: 'KIT',
                submenu: [
                    { role: 'about', label: 'About KIT' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide', label: 'Hide KIT' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit', label: 'Quit KIT' },
                ],
            },
            { role: 'editMenu' },
            { role: 'viewMenu' },
            { role: 'windowMenu' },
        ])
    )
}

app.whenReady()
    .then(async () => {
        if (process.platform === 'darwin' && isDevelopment) {
            app.dock?.setIcon(iconPath)
        }

        storage = createElectronStorage({
            userDataPath: app.getPath('userData'),
        })
        registerStorageHandlers(storage)
        await createMainWindow()

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                void createMainWindow()
            }
        })
    })
    .catch((error: unknown) => {
        console.error('Electron bootstrap failed', error)
        app.exit(1)
    })

app.on('before-quit', () => {
    storage?.close()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
