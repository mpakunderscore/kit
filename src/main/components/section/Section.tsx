import { Block } from '@src/main/components/section/Block'
import type { AppSection } from '@src/main/content/sections'

type SectionProps = {
    readonly section: AppSection
}

export const Section = ({ section }: SectionProps) => {
    const { blocks, id } = section
    const isFirstSection = id === 'user_section'
    const gridClassName = blocks.length === 1 ? 'section_grid section_grid_single' : 'section_grid'
    const sectionGrid = (
        <div className={gridClassName}>
            {blocks.map((block) => {
                return <Block block={block} key={id + '_' + block.id} />
            })}
        </div>
    )

    return (
        <section className={'section'} id={id}>
            {isFirstSection ? (
                <div className={'section_first_content'}>
                    <div className={'section_mobile_logo_wrap'}>
                        <img
                            alt={''}
                            className={'section_mobile_logo'}
                            src={'/icons/icon-192.png'}
                        />
                    </div>
                    {sectionGrid}
                </div>
            ) : (
                sectionGrid
            )}
        </section>
    )
}
