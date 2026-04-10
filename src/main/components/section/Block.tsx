import { useMemo, useState } from 'react'

import type { SectionBlock, SectionFieldTone } from '@src/main/content/sections'
import { getBrowserAllAvailableKeyDescription } from '@src/main/content/browser/browserAllAvailableKeyDescriptions'
import { isWebApiAvailable } from '@src/main/content/webApi/webApiAvailabilityChecks'
import { getWebApiDescription } from '@src/main/content/webApi/webApiDescriptions'
import { getWebApiPermissionDescription } from '@src/main/content/webApi/webApiPermissionDescriptions'
import {
    requestWebApiPermission,
    type WebApiPermissionRequestResult,
} from '@src/main/content/webApi/webApiPermissionRequests'

type BlockProps = {
    readonly block: SectionBlock
}

export const Block = ({ block }: BlockProps) => {
    const isWebApiPermissionBlock = block.id.startsWith('web_api_with_permissions')
    const isWebApiAvailabilityBlock = block.id.startsWith('web_api_without_permissions')
    const isBrowserInlineListBlock = block.id === 'browser_all_available_keys'
    const isWebApiInlineListBlock = isWebApiPermissionBlock || isWebApiAvailabilityBlock
    const isInlineListBlock = isWebApiInlineListBlock || isBrowserInlineListBlock
    const [permissionTonesByFieldId, setPermissionTonesByFieldId] = useState<
        Readonly<Record<string, SectionFieldTone>>
    >({})

    const availabilityTonesByFieldId = useMemo<Readonly<Record<string, SectionFieldTone>>>(() => {
        if (!isWebApiAvailabilityBlock) return {}

        return block.fields.reduce<Record<string, SectionFieldTone>>((accumulator, field) => {
            accumulator[field.id] = isWebApiAvailable(field.label) ? 'ok' : 'bad'
            return accumulator
        }, {})
    }, [block.fields, isWebApiAvailabilityBlock])

    const resolvePermissionTone = (result: WebApiPermissionRequestResult): SectionFieldTone => {
        if (result === 'granted') return 'ok'
        if (result === 'denied' || result === 'error') return 'bad'
        if (result === 'unsupported') return 'neutral'
        return 'warn'
    }

    const requestPermissionForField = async (fieldId: string, apiName: string): Promise<void> => {
        const permissionResult = await requestWebApiPermission(apiName)
        const permissionTone = resolvePermissionTone(permissionResult)

        setPermissionTonesByFieldId((currentTones) => ({
            ...currentTones,
            [fieldId]: permissionTone,
        }))
    }

    return (
        <article className={'section_card'}>
            {block.description.trim() !== '' ? (
                <div className={'section_card_description'}>{block.description}</div>
            ) : null}
            {isInlineListBlock ? (
                <div className={'section_api_inline_list'}>
                    {block.fields.map((field, fieldIndex) => {
                        const fieldTone = isWebApiPermissionBlock
                            ? (permissionTonesByFieldId[field.id] ?? field.tone)
                            : isWebApiAvailabilityBlock
                              ? (availabilityTonesByFieldId[field.id] ?? field.tone)
                              : field.tone
                        const fieldTitle = isWebApiPermissionBlock
                            ? getWebApiPermissionDescription(field.label)
                            : isWebApiAvailabilityBlock
                              ? getWebApiDescription(field.label)
                              : isBrowserInlineListBlock
                                ? getBrowserAllAvailableKeyDescription(field.label)
                                : field.label

                        return isWebApiPermissionBlock ? (
                            <button
                                className={'section_api_inline_item section_api_inline_item_button'}
                                data-tone={fieldTone}
                                key={`${block.id}_${field.id}`}
                                onClick={() => {
                                    void requestPermissionForField(field.id, field.label)
                                }}
                                title={fieldTitle}
                                type={'button'}
                            >
                                {field.label}
                                {fieldIndex < block.fields.length - 1 ? ',' : ''}
                            </button>
                        ) : (
                            <span
                                className={'section_api_inline_item'}
                                data-tone={fieldTone}
                                key={`${block.id}_${field.id}`}
                                title={fieldTitle}
                            >
                                {field.label}
                                {fieldIndex < block.fields.length - 1 ? ',' : ''}
                            </span>
                        )
                    })}
                </div>
            ) : (
                <>
                    {block.fields.map((field) => {
                        const valueClassName =
                            field.tone === undefined
                                ? 'section_field_value'
                                : `section_field_value section_field_value_${field.tone}`
                        const rowClassName =
                            field.value === ''
                                ? 'section_field_row section_field_row_single'
                                : 'section_field_row'

                        return (
                            <div className={rowClassName} key={`${block.id}_${field.id}`}>
                                <div className={'section_field_label'} title={field.keyTooltip}>
                                    {field.label}
                                </div>
                                {field.value === '' ? null : (
                                    <div className={valueClassName} title={field.value}>
                                        {field.value}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </>
            )}
        </article>
    )
}
