import { Section } from '@src/main/components/section/Section'
import { TEXTS } from '@src/main/content/texts'

export const WebAPISection = () => {
    return (
        <Section
            blocks={[TEXTS.webApi.demoBlockText, TEXTS.webApi.availableBlockText]}
            id={'web_api_section'}
        />
    )
}
