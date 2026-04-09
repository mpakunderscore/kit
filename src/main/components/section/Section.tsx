import { Block } from '@src/main/components/section/Block'
import type { AppSection } from '@src/main/content/sections'

type SectionProps = {
    readonly section: AppSection
}

export const Section = ({ section }: SectionProps) => {
    const { blocks, id } = section
    const gridClassName = blocks.length === 1 ? 'section_grid section_grid_single' : 'section_grid'

    return (
        <section className={'section'} id={id}>
            <div className={gridClassName}>
                {blocks.map((block) => {
                    return <Block block={block} key={id + '_' + block.id} />
                })}
            </div>
        </section>
    )
}
