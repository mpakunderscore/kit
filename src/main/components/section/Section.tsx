import { Block } from '@src/main/components/section/Block'
import type { AppSection } from '@src/main/content/sections'

type SectionProps = {
    readonly section: AppSection
}

export const Section = ({ section }: SectionProps) => {
    const { blocks, id } = section
    return (
        <section className={'section'} id={id}>
            <div className={'section_grid'}>
                {blocks.map((block) => {
                    return <Block block={block} key={id + '_' + block.id} />
                })}
            </div>
        </section>
    )
}
