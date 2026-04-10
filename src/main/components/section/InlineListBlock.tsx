import { useMemo, useState } from 'react'

import { getBrowserAllAvailableKeyDescription } from '@src/main/content/browser/browserAllAvailableKeyDescriptions'
import { SectionFieldTone, type SectionBlock } from '@src/main/content/sections'
import { isWebApiAvailable } from '@src/main/content/webApi/webApiAvailabilityChecks'
import { getWebApiDescription } from '@src/main/content/webApi/webApiDescriptions'
import { getWebApiPermissionDescription } from '@src/main/content/webApi/webApiPermissionDescriptions'
import {
    requestWebApiPermission,
    WebApiPermissionResult,
    type WebApiPermissionRequestResult,
} from '@src/main/content/webApi/webApiPermissionRequests'

export enum InlineListMode {
    WebApiPermission = 'web_api_permission',
    WebApiAvailability = 'web_api_availability',
    Browser = 'browser',
}

type InlineListBlockProps = {
    readonly block: SectionBlock
    readonly mode: InlineListMode
}

const resolvePermissionTone = (result: WebApiPermissionRequestResult): SectionFieldTone => {
    if (result === WebApiPermissionResult.Granted) return SectionFieldTone.Ok
    if (result === WebApiPermissionResult.Denied || result === WebApiPermissionResult.Error) {
        return SectionFieldTone.Bad
    }
    if (result === WebApiPermissionResult.Unsupported) return SectionFieldTone.Neutral
    return SectionFieldTone.Warn
}

export const InlineListBlock = ({ block, mode }: InlineListBlockProps) => {
    const [permissionTonesByFieldId, setPermissionTonesByFieldId] = useState<
        Readonly<Record<string, SectionFieldTone>>
    >({})

    const availabilityTonesByFieldId = useMemo<Readonly<Record<string, SectionFieldTone>>>(() => {
        if (mode !== InlineListMode.WebApiAvailability) return {}

        return block.fields.reduce<Record<string, SectionFieldTone>>((accumulator, field) => {
            accumulator[field.id] = isWebApiAvailable(field.label)
                ? SectionFieldTone.Ok
                : SectionFieldTone.Bad
            return accumulator
        }, {})
    }, [block.fields, mode])

    const requestPermissionForField = async (fieldId: string, apiName: string): Promise<void> => {
        const permissionResult = await requestWebApiPermission(apiName)
        const permissionTone = resolvePermissionTone(permissionResult)

        setPermissionTonesByFieldId((currentTones) => ({
            ...currentTones,
            [fieldId]: permissionTone,
        }))
    }

    return (
        <div className={'section_api_inline_list'}>
            {block.fields.map((field, fieldIndex) => {
                const fieldTone =
                    mode === InlineListMode.WebApiPermission
                        ? (permissionTonesByFieldId[field.id] ?? field.tone)
                        : mode === InlineListMode.WebApiAvailability
                          ? (availabilityTonesByFieldId[field.id] ?? field.tone)
                          : field.tone

                const fieldTitle =
                    mode === InlineListMode.WebApiPermission
                        ? getWebApiPermissionDescription(field.label)
                        : mode === InlineListMode.WebApiAvailability
                          ? getWebApiDescription(field.label)
                          : getBrowserAllAvailableKeyDescription(field.label)

                return mode === InlineListMode.WebApiPermission ? (
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
    )
}
