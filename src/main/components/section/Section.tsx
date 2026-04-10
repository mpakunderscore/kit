import { Block } from '@src/main/components/section/Block'
import { BlockId, SectionId } from '@src/main/content/sectionIds'
import type { AppSection } from '@src/main/content/sections'

type SectionProps = {
    readonly section: AppSection
}

export const Section = ({ section }: SectionProps) => {
    const { blocks, id } = section
    const isFirstSection = id === SectionId.User
    const isProjectSection = id === SectionId.Project
    const gridClassName = blocks.length === 1 ? 'section_grid section_grid_single' : 'section_grid'

    const blocksById = new Map(blocks.map((block) => [block.id, block]))
    const projectPackageBlock = blocksById.get(BlockId.ProjectPackageKeys)
    const projectDependenciesBlock = blocksById.get(BlockId.ProjectDependenciesLibraryVersions)
    const projectDevDependenciesBlock = blocksById.get(
        BlockId.ProjectDevDependenciesLibraryVersions
    )

    const sectionGrid =
        isProjectSection &&
        projectPackageBlock !== undefined &&
        projectDependenciesBlock !== undefined &&
        projectDevDependenciesBlock !== undefined ? (
            <div className={'section_grid section_grid_project'}>
                <div className={'section_grid_project_left'}>
                    <Block block={projectPackageBlock} key={id + '_' + projectPackageBlock.id} />
                    <Block
                        block={projectDependenciesBlock}
                        key={id + '_' + projectDependenciesBlock.id}
                    />
                </div>
                <div className={'section_grid_project_right'}>
                    <Block
                        block={projectDevDependenciesBlock}
                        key={id + '_' + projectDevDependenciesBlock.id}
                    />
                </div>
            </div>
        ) : (
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
