import type { SectionBlock } from '@src/main/content/sections'

type FieldRowsBlockProps = {
    readonly block: SectionBlock
}

export const FieldRowsBlock = ({ block }: FieldRowsBlockProps) => {
    return (
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
    )
}
