import { FieldRowsBlock } from '@src/main/components/section/FieldRowsBlock'
import { InlineListBlock, InlineListMode } from '@src/main/components/section/InlineListBlock'
import { BlockId } from '@src/main/content/sectionIds'
import type { SectionBlock } from '@src/main/content/sections'

type BlockProps = {
    readonly block: SectionBlock
}

const WEB_API_PERMISSION_BLOCK_IDS = new Set<BlockId>([
    BlockId.WebApiWithPermissions,
    BlockId.WebApiWithPermissionsBrowserContext,
])

const WEB_API_AVAILABILITY_BLOCK_IDS = new Set<BlockId>([
    BlockId.WebApiWithoutPermissionsStable,
    BlockId.WebApiWithoutPermissionsRisky,
])

export const Block = ({ block }: BlockProps) => {
    const isWebApiPermissionBlock = WEB_API_PERMISSION_BLOCK_IDS.has(block.id)
    const isWebApiAvailabilityBlock = WEB_API_AVAILABILITY_BLOCK_IDS.has(block.id)
    const isBrowserInlineListBlock = block.id === BlockId.BrowserAllAvailableKeys

    return (
        <article className={'section_card'}>
            {block.description.trim() !== '' ? (
                <div className={'section_card_description'}>{block.description}</div>
            ) : null}

            {isWebApiPermissionBlock ? (
                <InlineListBlock block={block} mode={InlineListMode.WebApiPermission} />
            ) : isWebApiAvailabilityBlock ? (
                <InlineListBlock block={block} mode={InlineListMode.WebApiAvailability} />
            ) : isBrowserInlineListBlock ? (
                <InlineListBlock block={block} mode={InlineListMode.Browser} />
            ) : (
                <FieldRowsBlock block={block} />
            )}
        </article>
    )
}
