import { FOOTER_VALUES } from '@src/main/components/footer/footerValues'

export const Footer = () => {
    return (
        <footer className={'footer'}>
            {FOOTER_VALUES.map((item) => {
                return (
                    <span className={'footer_value'} key={item.id}>
                        {item.value}
                    </span>
                )
            })}
        </footer>
    )
}
