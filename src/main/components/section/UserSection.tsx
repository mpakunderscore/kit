import { Block } from '@src/main/components/section/block/Block'
import { Section } from '@src/main/components/section/Section'
import { TEXTS } from '@src/main/content/texts'

export const UserSection = () => {
    const texts = TEXTS.user

    return (
        <Section>
            <Block>
                <div>{texts.uuidBlockText}</div>
            </Block>
            <Block>
                <div>{texts.profileBlockText}</div>
            </Block>
        </Section>
    )
}
