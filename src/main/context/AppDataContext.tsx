import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    use,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { APP_SECTIONS, type AppSection, type MenuSection } from '@src/main/content/sections'
import {
    type AppSectionsPatcher,
    loadBrowserSectionPatcher,
    loadNetworkSectionPatcher,
    loadProjectSectionPatcher,
    loadUserSectionPatcher,
} from '@src/main/context/appDataLoaders'

const runSectionLoader = async (
    loader: () => Promise<AppSectionsPatcher | undefined>,
    isDisposed: () => boolean,
    setAppSections: Dispatch<SetStateAction<readonly AppSection[]>>
): Promise<void> => {
    const patcher = await loader()
    if (patcher === undefined || isDisposed()) return

    setAppSections((currentAppSections) => patcher(currentAppSections))
}

type AppDataContextValue = {
    readonly appSections: readonly AppSection[]
    readonly menuSections: readonly MenuSection[]
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

type AppDataProviderProps = {
    readonly children: ReactNode
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
    const [appSections, setAppSections] = useState<readonly AppSection[]>(APP_SECTIONS)

    useEffect(() => {
        let isDisposed = false

        const getIsDisposed = (): boolean => isDisposed

        void runSectionLoader(loadBrowserSectionPatcher, getIsDisposed, setAppSections)
        void runSectionLoader(loadUserSectionPatcher, getIsDisposed, setAppSections)
        void runSectionLoader(loadNetworkSectionPatcher, getIsDisposed, setAppSections)
        void runSectionLoader(loadProjectSectionPatcher, getIsDisposed, setAppSections)

        return () => {
            isDisposed = true
        }
    }, [])

    const menuSections = useMemo<readonly MenuSection[]>(() => {
        return appSections.map(({ id, label }) => ({ id, label }))
    }, [appSections])

    return (
        <AppDataContext
            value={{
                appSections,
                menuSections,
            }}
        >
            {children}
        </AppDataContext>
    )
}

export const useAppDataContext = (): AppDataContextValue => {
    const context = use(AppDataContext)
    if (context === null) {
        throw new Error('useAppDataContext must be used inside AppDataProvider')
    }
    return context
}
