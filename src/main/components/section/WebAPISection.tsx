import { TEXTS } from '@src/main/content/texts'
import { Block } from '@src/main/components/section/block/Block'
import { Section } from '@src/main/components/section/Section'

export const WebAPISection = () => {
    const texts = TEXTS.webApi

    return (
        <Section>
            <Block>
                <div>{texts.demoBlockText}</div>
            </Block>
            <Block>
                <div>{texts.availableBlockText}</div>
            </Block>
        </Section>
    )
}
