import { BlockId, SectionId } from '@src/main/content/sectionIds'
import type { AppSection } from '@src/main/content/sections'
import type { UserResponse } from '@src/main/network/httpApi'
import { formatUiTime24h } from '@src/main/utils/formatUiTime24h'

export const applyUserToSections = (
    appSections: readonly AppSection[],
    user: UserResponse
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== SectionId.User) return section

        return {
            ...section,
            blocks: section.blocks.map((block) => {
                if (block.id !== BlockId.UserIdentity) return block

                return {
                    ...block,
                    fields: [
                        { id: 'uuid', label: 'UUID', value: user.uuid },
                        {
                            id: 'created_at',
                            label: 'createdAt',
                            value: formatUiTime24h(user.createdAt),
                        },
                        {
                            id: 'updated_at',
                            label: 'updatedAt',
                            value: formatUiTime24h(user.updatedAt),
                        },
                    ],
                }
            }),
        }
    })
}
