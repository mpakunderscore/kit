import type { SectionBlock } from '@src/main/content/sections'

type BlockProps = {
    readonly block: SectionBlock
}

export const Block = ({ block }: BlockProps) => {

    return (
        <article className={'section_card'}>
            <div className={'section_card_description'}>{block.description}</div>
            <div className={'section_field_list'}>
                {block.fields.map((field) => {
                    const valueClassName =
                        field.tone === undefined
                            ? 'section_field_value'
                            : `section_field_value section_field_value_${field.tone}`

                    return (
                        <div className={'section_field_row'} key={`${block.id}_${field.id}`}>
                            <div className={'section_field_label'}>{field.label}</div>
                            <div className={valueClassName}>{field.value}</div>
                        </div>
                    )
                })}
            </div>
        </article>
    )
}
