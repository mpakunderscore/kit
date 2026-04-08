import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import '@src/assets/styles/index.css'
import App from '@src/main/App'
import { MainProvider } from '@src/main/context/MainContext'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

createRoot(rootElement).render(
    <StrictMode>
        <MainProvider>
            <App />
        </MainProvider>
    </StrictMode>
)
