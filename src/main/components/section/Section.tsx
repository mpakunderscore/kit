import { Block } from '@src/main/components/section/Block'
import { BlockProvider } from '@src/main/context/BlockContext'
import { useSectionContext } from '@src/main/context/SectionContext'

export const Section = () => {
    const { blocks, id } = useSectionContext()
    return (
        <section className={'section'} id={id}>
            <div className={'section_grid'}>
                {blocks.map((block) => {
                    return (
                        <BlockProvider block={block} key={id + '_' + block.id}>
                            <Block />
                        </BlockProvider>
                    )
                })}
            </div>
        </section>
    )
}
