import { Section } from '@src/main/components/section/Section'
import { TEXTS } from '@src/main/content/texts'

export const DataSection = () => {
    return (
        <Section
            blocks={[TEXTS.data.serverBlockText, TEXTS.data.browserBlockText]}
            id={'data_section'}
        />
    )
}
