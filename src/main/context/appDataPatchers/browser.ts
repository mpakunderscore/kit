import type { BrowserDataKey } from '@src/main/content/browser/browserDataKeys'
import type { BrowserDataValues } from '@src/main/content/browser/browserDataValues'
import { SectionId } from '@src/main/content/sectionIds'
import type { AppSection } from '@src/main/content/sections'

export const applyBrowserDataToSections = (
    appSections: readonly AppSection[],
    browserDataValues: BrowserDataValues
): readonly AppSection[] => {
    return appSections.map((section) => {
        if (section.id !== SectionId.Browser) return section

        return {
            ...section,
            blocks: section.blocks.map((block) => ({
                ...block,
                fields: block.fields.map((field) => {
                    if (field.keyTooltip === undefined) return field
                    const browserKey = field.keyTooltip as BrowserDataKey

                    return {
                        ...field,
                        value: browserDataValues[browserKey],
                    }
                }),
            })),
        }
    })
}
