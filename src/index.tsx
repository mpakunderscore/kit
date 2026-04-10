import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import '@src/assets/styles/index.css'
import '@src/assets/styles/electron.css'

import App from '@src/main/App'
import { AppDataProvider } from '@src/main/context/AppDataContext'
import { NavigationProvider } from '@src/main/context/NavigationContext'
import { applyDesktopDocumentClass } from '@src/utils/electron'

applyDesktopDocumentClass()

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

createRoot(rootElement).render(
    <StrictMode>
        <AppDataProvider>
            <NavigationProvider>
                <App />
            </NavigationProvider>
        </AppDataProvider>
    </StrictMode>
)
