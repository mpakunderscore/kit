import { Code2, Rocket } from 'lucide-react'

import { FOOTER_VALUES } from '@src/main/components/footer/footerValues'

const ENV_ICONS = {
    development: Code2,
    production: Rocket,
} as const

export const Footer = () => {
    const footerValues = FOOTER_VALUES.filter((item) => item.value.length > 0)

    return (
        <footer className={'footer'}>
            {footerValues.map((item) => {
                if (item.id === 'node_env') {
                    const EnvIcon = ENV_ICONS[item.value as keyof typeof ENV_ICONS]

                    if (EnvIcon) {
                        return (
                            <span className={'footer_value footer_value_icon'} key={item.id}>
                                <EnvIcon aria-label={item.value} size={18} strokeWidth={2} />
                            </span>
                        )
                    }
                }

                return (
                    <span className={'footer_value'} key={item.id}>
                        {item.value}
                    </span>
                )
            })}
        </footer>
    )
}
