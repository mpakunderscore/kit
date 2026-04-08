import { FOOTER_VALUES } from '@src/main/components/footer/footerValues'

export const Footer = () => {
    const footerValues = FOOTER_VALUES.filter((item) => item.value.length > 0)

    return (
        <footer className={'footer'}>
            {footerValues.map((item) => {
                return (
                    <span className={'footer_value'} key={item.id}>
                        {item.value}
                    </span>
                )
            })}
            <button
                type={'button'}
                className={'footer_toggle'}
                onClick={() => {
                    document.documentElement.classList.toggle('debug_background')
                }}
            >
                debug
            </button>
        </footer>
    )
}
