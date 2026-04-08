import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import '@src/assets/styles/index.css'
import App from '@src/main/App'
import { AppDataProvider } from '@src/main/context/AppDataContext'
import { NavigationProvider } from '@src/main/context/NavigationContext'

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
