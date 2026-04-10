import { Block } from '@src/main/components/section/Block'
import type { AppSection } from '@src/main/content/sections'

type SectionProps = {
    readonly section: AppSection
}

export const Section = ({ section }: SectionProps) => {
    const { blocks, id } = section
    const isFirstSection = id === 'user_section'
    const isProjectSection = id === 'project_section'
    const gridClassName = blocks.length === 1 ? 'section_grid section_grid_single' : 'section_grid'

    const projectPackageBlock = blocks.find((block) => block.id === 'project_package_keys')
    const projectDependenciesBlock = blocks.find(
        (block) => block.id === 'project_dependencies_library_versions'
    )
    const projectDevDependenciesBlock = blocks.find(
        (block) => block.id === 'project_dev_dependencies_library_versions'
    )
    const sectionGrid = (() => {
        if (
            isProjectSection &&
            projectPackageBlock !== undefined &&
            projectDependenciesBlock !== undefined &&
            projectDevDependenciesBlock !== undefined
        ) {
            return (
                <div className={'section_grid section_grid_project'}>
                    <div className={'section_grid_project_left'}>
                        <Block
                            block={projectPackageBlock}
                            key={id + '_' + projectPackageBlock.id}
                        />
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
            )
        }

        return (
            <div className={gridClassName}>
                {blocks.map((block) => {
                    return <Block block={block} key={id + '_' + block.id} />
                })}
            </div>
        )
    })()

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
