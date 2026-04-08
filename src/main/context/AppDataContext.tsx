import { createContext, type ReactNode, use, useEffect, useMemo, useState } from 'react'

import { APP_SECTIONS, type AppSection, type MenuSection } from '@src/main/content/sections'
import { requestUser, type UserResponse } from '@src/main/network/httpApi'

const applyUserToSections = (
    appSections: readonly AppSection[],
    user: UserResponse
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== 'user_section') return section

        return {
            ...section,
            blocks: section.blocks.map((block) => {
                if (block.id === 'user_identity') {
                    return {
                        ...block,
                        fields: [
                            { id: 'uuid', label: 'UUID', value: user.uuid },
                            { id: 'created_at', label: 'createdAt', value: user.createdAt },
                            { id: 'updated_at', label: 'updatedAt', value: user.updatedAt },
                        ],
                    }
                }

                if (block.id === 'user_profile') {
                    return {
                        ...block,
                        description: '',
                        fields: [],
                    }
                }

                return block
            }),
        }
    })
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
        let isActive = true

        const loadUser = async () => {
            try {
                const user = await requestUser()
                if (!isActive) return

                setAppSections((currentAppSections) =>
                    applyUserToSections(currentAppSections, user)
                )
            } catch {
                // Keep section blocks empty when /api/user is unavailable.
            }
        }

        void loadUser()

        return () => {
            isActive = false
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
