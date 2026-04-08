import { TEXTS } from '@src/main/content/texts'
import { Block } from '@src/main/components/section/block/Block'
import { Section } from '@src/main/components/section/Section'

export const DataSection = () => {
    const texts = TEXTS.data

    return (
        <Section>
            <Block>
                <div>{texts.serverBlockText}</div>
            </Block>
            <Block>
                <div>{texts.browserBlockText}</div>
            </Block>
        </Section>
    )
}
