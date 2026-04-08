import type { SectionBlock } from '@src/main/content/sections'

type BlockProps = {
    readonly block: SectionBlock
}

export const Block = ({ block }: BlockProps) => {
    const isWebApiInlineListBlock =
        block.id === 'web_api_with_permissions' || block.id === 'web_api_without_permissions'

    return (
        <article className={'section_card'}>
            {block.description.trim() !== '' ? (
                <div className={'section_card_description'}>{block.description}</div>
            ) : null}
            {isWebApiInlineListBlock ? (
                <div className={'section_api_inline_list'}>
                    {block.fields.map((field, fieldIndex) => {
                        return (
                            <span
                                className={'section_api_inline_item'}
                                data-tone={field.tone}
                                key={`${block.id}_${field.id}`}
                            >
                                {field.label}
                                {fieldIndex < block.fields.length - 1 ? ',' : ''}
                            </span>
                        )
                    })}
                </div>
            ) : (
                <div className={'section_field_list'}>
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
                                    <div className={valueClassName}>{field.value}</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </article>
    )
}
