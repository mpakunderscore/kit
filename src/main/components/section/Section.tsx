import { Block } from '@src/main/components/section/Block'

type SectionProps = {
    readonly blocks: readonly string[]
    readonly id: string
}

export const Section = ({ blocks, id }: SectionProps) => {
    return (
        <section className={'section'} id={id}>
            {blocks.map((text, index) => {
                return <Block key={`${id}_${index}`} text={text} />
            })}
        </section>
    )
}
