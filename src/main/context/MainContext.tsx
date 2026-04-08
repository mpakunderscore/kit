import { createContext, type ReactNode, use } from 'react'

type MainContextValue = {}

const MainContext = createContext<MainContextValue | null>(null)

type MainProviderProps = {
    readonly children: ReactNode
}

export const MainProvider = ({ children }: MainProviderProps) => {
    return <MainContext value={{}}>{children}</MainContext>
}

export const useMainContext = (): MainContextValue => {
    const context = use(MainContext)
    if (context === null) {
        throw new Error('useMainContext must be used inside MainProvider')
    }
    return context
}
