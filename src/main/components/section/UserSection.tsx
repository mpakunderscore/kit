import { Section } from '@src/main/components/section/Section'
import { TEXTS } from '@src/main/content/texts'

export const UserSection = () => {
    return (
        <Section
            blocks={[TEXTS.user.uuidBlockText, TEXTS.user.profileBlockText]}
            id={'user_section'}
        />
    )
}
